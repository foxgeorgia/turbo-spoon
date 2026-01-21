import { useState } from 'react';
import { formatDate, decodeHtmlEntities } from './utils';
import './EmailMessages.css';

function EmailCard({ email, onSummarize, isSummarizing }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = async (e) => {
    // Don't toggle if clicking on a link or other interactive element
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

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
      className={`email-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={handleCardClick}
    >
      <div className="email-header">
        <h3 className="email-subject">{decodedSubject}</h3>
        <span className="email-date">{formatDate(email.date)}</span>
      </div>

      <div className="email-sender">{decodedSender}</div>

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
