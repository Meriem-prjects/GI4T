import React, { useMemo } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  level: 1 | 2 | 3;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  html: string;
  language?: 'fr' | 'ar';
  className?: string;
}

// Parse an HTML string for top-level <h1>/<h2>/<h3> headings and emit a
// flat list of { level, text, id }. The id is derived from the index so
// it's stable as long as the heading order doesn't change.
function extractHeadings(html: string): TocItem[] {
  if (!html || typeof window === 'undefined') return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const nodes = doc.querySelectorAll('h1, h2, h3');
  const items: TocItem[] = [];
  nodes.forEach((node, i) => {
    const tag = node.tagName.toLowerCase();
    const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3;
    const text = node.textContent?.trim() ?? '';
    if (!text) return;
    items.push({ level: level as 1 | 2 | 3, text, id: `doc-h-${i}` });
  });
  return items;
}

// Inject id="doc-h-i" attributes onto each H1/H2/H3 in the rendered
// body so the TOC anchors resolve to the right element.
export function injectHeadingIds(html: string): string {
  if (!html || typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const nodes = doc.querySelectorAll('h1, h2, h3');
  nodes.forEach((node, i) => {
    node.setAttribute('id', `doc-h-${i}`);
  });
  return doc.body.innerHTML;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  html,
  language = 'fr',
  className = '',
}) => {
  const items = useMemo(() => extractHeadings(html), [html]);
  if (items.length < 2) return null;
  const isRtl = language === 'ar';
  return (
    <nav
      aria-label={isRtl ? 'فهرس المحتويات' : 'Sommaire'}
      className={`rounded-lg border border-border bg-muted/30 p-4 ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground ${isRtl ? 'flex-row-reverse' : ''}`}>
        <List className="h-4 w-4" />
        {isRtl ? 'فهرس المحتويات' : 'Sommaire'}
      </h3>
      <ol className="space-y-1 text-sm">
        {items.map((it) => (
          <li
            key={it.id}
            className={
              it.level === 1
                ? 'font-medium'
                : it.level === 2
                ? `${isRtl ? 'mr-4' : 'ml-4'} text-muted-foreground`
                : `${isRtl ? 'mr-8' : 'ml-8'} text-xs text-muted-foreground`
            }
          >
            <a
              href={`#${it.id}`}
              className="hover:text-primary hover:underline"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TableOfContents;
