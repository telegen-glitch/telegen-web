/**
 * The topic chosen in the topic picker, handed to the evaluation flow across a
 * client-side navigation. Module memory only: never in the URL, cookies or
 * storage (a chosen condition is health information). Cleared once the flow has read it.
 */
let pending: string | null = null;

export function setPendingTopic(slug: string): void {
  pending = slug;
}

/** Read without clearing (safe inside render / state initialisers). */
export function peekPendingTopic(): string | null {
  return pending;
}

export function clearPendingTopic(): void {
  pending = null;
}
