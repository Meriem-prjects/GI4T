export function getSessionId(): string {
  const storageKey = 'feelinx_session_id';
  
  // Try to get existing session ID
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

export function calculateReadTime(text: string): number {
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // At least 1 minute
}
