/**
 * Phrases that say the service is not open (CLAUDE.md v4.7). None may appear on
 * any page in the "open" launch state; outside src/lib/prelaunch-copy.ts none
 * may appear in the source either. Used by tests/unit/launch-copy.test.ts,
 * scripts/launch-copy-check.ts (after every build) and the e2e suite.
 */
export const PRELAUNCH_PATTERN =
  /pre-?lansare|lansarea|la lansare|înainte de lansare|lansăm|nu este încă|încă deschis|anunța|anunțăm|anunță-mă|în curând|în așteptare|listă de așteptare|waitlist|TEMPORARY|previzualizare|vor fi afișate|se publică|se completează/gi;

/** Every distinct pre-launch phrase found in a text (HTML is checked as markup and as text). */
export function prelaunchPhrases(input: string): string[] {
  const text = input.replace(/<[^>]+>/g, "");
  const found = new Set<string>();
  for (const source of [input, text]) {
    for (const m of source.matchAll(PRELAUNCH_PATTERN)) found.add(m[0].toLowerCase());
  }
  return [...found];
}
