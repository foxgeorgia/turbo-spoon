// Decode HTML entities (e.g., &#39; -> ', &amp; -> &)
export function decodeHtmlEntities(text) {
  if (!text) return text;
  
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Truncate text for preview (used as fallback)
export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
