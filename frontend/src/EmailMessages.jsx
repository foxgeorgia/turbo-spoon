import { useState, useEffect } from 'react'
import './EmailMessages.css'

function EmailMessages() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
          subject: email.subject,
          sender: email.from,
          date: email.date,
          summary: email.snippet
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

  if (loading) {
    return (
      <div className="email-messages">
        <div className="email-card">
          <p>Loading emails...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="email-messages">
        <div className="email-card">
          <p className="email-error">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="email-messages">
      {emails.map(email => (
        <div key={email.id} className="email-card">
          <div className="email-header">
            <h3>{email.subject}</h3>
            <span className="email-date">{email.date}</span>
          </div>
          <div className="email-sender">{email.sender}</div>
          <p className="email-summary">{email.summary}</p>
        </div>
      ))}
    </div>
  )
}

export default EmailMessages
