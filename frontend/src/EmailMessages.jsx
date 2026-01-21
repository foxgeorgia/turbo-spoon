import { useState, useEffect } from 'react'
import EmailCard from './EmailCard'
import './EmailMessages.css'

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

        // Map backend fields to frontend fields
        const mappedEmails = data.emails.map(email => ({
          id: email.id,
          subject: email.subject === "" ? "(no subject)" : email.subject,
          sender: email.from,
          date: email.date,
          snippet: email.snippet,
          body: email.body,
          llmSummary: null,
          actionItems: [],
          needsReply: null,
        }))

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

      // Update only this email in state
      setEmails(prev =>
        prev.map(e =>
          e.id === email.id
            ? {
              ...e,
              llmSummary: data.summary ?? null,
              actionItems: Array.isArray(data.action_items) ? data.action_items : [],
              needsReply: typeof data.needs_reply === 'boolean' ? data.needs_reply : null,
            }
            : e
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSummarizingId(null)
    }
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
          isSummarizing={summarizingId === email.id}
        />
      ))}
    </div>
  )
}

export default EmailMessages
