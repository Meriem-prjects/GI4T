import { marked } from "marked";

// Configure marked for chat messages: GFM (line breaks convert to <br>),
// smart handling of headings, no HTML input trust.
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Detect Arabic characters — if a message is majority Arabic, we render it
// with dir="rtl" regardless of the UI language, so mixed conversations
// stay readable.
const AR_RANGE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;

export function isArabicText(text: string): boolean {
  if (!text) return false;
  const arMatches = text.match(AR_RANGE);
  if (!arMatches) return false;
  const arChars = arMatches.length;
  const totalLetters = (text.match(/[\p{L}]/gu) ?? []).length;
  if (totalLetters === 0) return arChars > 0;
  return arChars / totalLetters >= 0.3;
}

// Strip anything that could execute JS. The chat backend is trusted (our
// own OpenAI proxy), but the model output isn't — so a belt-and-braces
// sanitiser removes <script>, on* handlers, and javascript: URLs.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
}

// Render a chat message from markdown to sanitized HTML.
export function renderChatMarkdown(md: string): string {
  if (!md) return "";
  try {
    const html = marked.parse(md) as string;
    return sanitizeHtml(html);
  } catch {
    // Fallback to plain text if parsing fails
    return md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");
  }
}
