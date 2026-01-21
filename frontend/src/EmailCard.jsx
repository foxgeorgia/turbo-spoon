import { useState } from 'react';
import { formatDate, decodeHtmlEntities } from './utils';
import './EmailMessages.css';

function EmailCard({ email, onSummarize, onMarkAsRead, isSummarizing }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e) => {
    // Don't toggle if clicking on a link or other interactive element
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Mark as read when expanding
    if (newExpandedState && !email.isRead) {
      onMarkAsRead(email.id);
    }

    // Auto-generate summary when expanding if not already present
    if (newExpandedState && !email.llmSummary && !isSummarizing) {
      onSummarize(email);
    }
  };

  // Decode HTML entities from the email body
  const decodedBody = decodeHtmlEntities(email.body || email.snippet);
  const decodedSnippet = decodeHtmlEntities(email.snippet);
  const decodedSubject = decodeHtmlEntities(email.subject);
  const decodedSender = decodeHtmlEntities(email.sender);

  return (
    <div 
      className={`email-card ${isExpanded ? 'expanded' : 'collapsed'} ${email.isRead ? 'read' : 'unread'}`}
      onClick={handleCardClick}
    >
      <div className="email-header">
        <div className="email-subject-wrapper">
          {!email.isRead && <span className="unread-indicator">●</span>}
          <h3 className="email-subject">{decodedSubject}</h3>
        </div>
        <div className="email-meta">
          <span className="email-date">{formatDate(email.date)}</span>
        </div>
      </div>

      <div className="email-sender-wrapper">
        <span className="email-sender">{decodedSender}</span>
        {/* Summarized indicator */}
        {isSummarizing ? (
          <span className="summary-indicator summarizing">
            <span className="spinner"></span> Summarizing…
          </span>
        ) : email.isSummarized ? (
          <span className="summary-indicator summarized">
            <span className="checkmark">✓</span> AI
          </span>
        ) : !isExpanded ? (
          <span className="summary-indicator not-summarized">AI</span>
        ) : null}
      </div>

      {!isExpanded && (
        <>
          <p className="email-preview">{decodedSnippet}</p>
          <div className="read-more">Read more...</div>
        </>
      )}

      {isExpanded && (
        <>
          <div className="email-body">
            {decodedBody}
          </div>

          <div className="email-summary-section">
            <div className="section-divider"></div>
            
            <div className="ai-summary-header">AI Summary</div>

            {isSummarizing ? (
              <div className="summary-loading">Generating summary…</div>
            ) : email.llmSummary ? (
              <>
                <div className="summary-text">{email.llmSummary}</div>

                {email.actionItems && email.actionItems.length > 0 && (
                  <div className="action-items">
                    <strong>Action items:</strong>
                    <ul>
                      {email.actionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {email.needsReply !== null && (
                  <div className="needs-reply-badge">
                    <span className={`badge ${email.needsReply ? 'yes' : 'no'}`}>
                      {email.needsReply ? 'Needs Reply: Yes' : 'Needs Reply: No'}
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export default EmailCard;
