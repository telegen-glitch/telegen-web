import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal inline markup for content strings:
 *   [label](/path or https://…)   link
 *   **bold**                      strong
 *   {{cite:source-id}}            numbered citation to the page's source list
 */
const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\{\{cite:([a-z0-9-]+)\}\}/g;

export function renderRichText(text: string, sourceOrder: string[] = []): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    if (m[1] && m[2]) {
      const href = m[2];
      nodes.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href}>
            {m[1]}
          </Link>
        ) : (
          <a key={key++} href={href} rel="noopener noreferrer" target="_blank">
            {m[1]}
          </a>
        ),
      );
    } else if (m[3]) {
      nodes.push(<strong key={key++}>{m[3]}</strong>);
    } else if (m[4]) {
      const n = sourceOrder.indexOf(m[4]) + 1;
      if (n > 0) {
        nodes.push(
          <sup key={key++} className="ml-0.5 text-[0.7em] font-semibold">
            <a
              href={`#sursa-${m[4]}`}
              className="text-blue-700 no-underline hover:underline"
              aria-label={`Sursa ${n}`}
            >
              [{n}]
            </a>
          </sup>,
        );
      }
    }
    last = index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Plain text for meta descriptions and structured data. */
export function plainText(text: string): string {
  return text
    .replace(/\s*\{\{cite:[a-z0-9-]+\}\}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Citation ids in order of first appearance in the given strings. */
export function citationOrder(texts: string[]): string[] {
  const order: string[] = [];
  for (const t of texts) {
    for (const m of t.matchAll(/\{\{cite:([a-z0-9-]+)\}\}/g)) {
      if (!order.includes(m[1])) order.push(m[1]);
    }
  }
  return order;
}
