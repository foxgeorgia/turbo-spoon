import { useState, useEffect } from 'react'
import EmailCard from './EmailCard'
import './EmailMessages.css'

const STORAGE_KEY = 'emailFeedState:v1'
const MAX_STORED_ENTRIES = 200

// Helper to load state from localStorage
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (err) {
    console.warn('Failed to load email state from localStorage:', err)
    return {}
  }
}

// Helper to save entire state to localStorage
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Failed to save email state to localStorage:', err)
  }
}

// Helper to update a single email's state
function upsertState(emailId, updates) {
  const state = loadState()
  state[emailId] = {
    ...state[emailId],
    ...updates,
    updatedAt: Date.now()
  }
  
  // Prune to newest MAX_STORED_ENTRIES
  const entries = Object.entries(state)
  if (entries.length > MAX_STORED_ENTRIES) {
    entries.sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    const pruned = Object.fromEntries(entries.slice(0, MAX_STORED_ENTRIES))
    saveState(pruned)
  } else {
    saveState(state)
  }
}

function EmailMessages() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [summarizingId, setSummarizingId] = useState(null)

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/emails/recent')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.ok) {
          throw new Error(data.error || 'Failed to fetch emails')
        }

        // Load saved state from localStorage
        const savedState = loadState()

        // Map backend fields to frontend fields
        const mappedEmails = data.emails.map(email => {
          const saved = savedState[email.id] || {}
          
          return {
            id: email.id,
            subject: email.subject === "" ? "(no subject)" : email.subject,
            sender: email.from,
            date: email.date,
            snippet: email.snippet,
            body: email.body,
            // Restore from saved state if available
            llmSummary: saved.summaryData?.summary ?? null,
            actionItems: saved.summaryData?.action_items ?? [],
            needsReply: saved.summaryData?.needs_reply ?? null,
            isRead: saved.read ?? false,
            isSummarized: saved.summarized ?? false,
          }
        })

        setEmails(mappedEmails)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [])

  const summarizeEmail = async (email) => {
    // CRITICAL: Prevent duplicate OpenAI calls
    if (email.isSummarized || email.llmSummary) {
      return
    }

    try {
      setSummarizingId(email.id)
      setError(null)

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: email.sender,
          subject: email.subject,
          body: email.body || email.snippet,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || 'Failed to summarize email')
      }

      const summaryData = {
        summary: data.summary ?? null,
        action_items: Array.isArray(data.action_items) ? data.action_items : [],
        needs_reply: typeof data.needs_reply === 'boolean' ? data.needs_reply : null,
      }

      // Update only this email in state
      setEmails(prev =>
        prev.map(e =>
          e.id === email.id
            ? {
              ...e,
              llmSummary: summaryData.summary,
              actionItems: summaryData.action_items,
              needsReply: summaryData.needs_reply,
              isSummarized: true, // Mark as summarized after successful summary
            }
            : e
        )
      )

      // Persist to localStorage
      upsertState(email.id, {
        summarized: true,
        summaryData: summaryData
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSummarizingId(null)
    }
  }

  const markAsRead = (emailId) => {
    setEmails(prev =>
      prev.map(e =>
        e.id === emailId ? { ...e, isRead: true } : e
      )
    )
    
    // Persist to localStorage
    upsertState(emailId, { read: true })
  }

  if (loading) {
    return (
      <div className="email-messages">
        <div className="email-loading">
          <p>Loading emails...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="email-messages">
        <div className="email-error-container">
          <p className="email-error">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="email-messages">
      {emails.map(email => (
        <EmailCard
          key={email.id}
          email={email}
          onSummarize={summarizeEmail}
          onMarkAsRead={markAsRead}
          isSummarizing={summarizingId === email.id}
        />
      ))}
    </div>
  )
}

export default EmailMessages
