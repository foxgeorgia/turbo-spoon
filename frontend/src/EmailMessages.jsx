import './EmailMessages.css'

function EmailMessages() {
  // Sample email data - this will eventually come from the backend
  const emails = [
    {
      id: 1,
      subject: "Weekly Team Update",
      sender: "team@example.com",
      date: "2026-01-20",
      summary: "Project milestones achieved this week. Team velocity improved by 15%. Next sprint planning scheduled."
    },
    {
      id: 2,
      subject: "Customer Feedback Review",
      sender: "support@example.com",
      date: "2026-01-19",
      summary: "Positive feedback on new features. Users requesting mobile app improvements and faster load times."
    },
    {
      id: 3,
      subject: "Monthly Analytics Report",
      sender: "analytics@example.com",
      date: "2026-01-18",
      summary: "User engagement up 23%. Conversion rate increased to 4.2%. Top performing feature: email summaries."
    }
  ]

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
