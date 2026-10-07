import type { TeamMember } from "./types";

/**
 * Telegen's clinical team, by opaque id only (see TeamMember). Empty until the
 * owner records each doctor following docs/REVIEW.md. Never add names, parafă
 * codes, photos or any detail that identifies a person.
 */
export const team: TeamMember[] = [];

export function getTeamMember(id: string): TeamMember | undefined {
  return team.find((m) => m.id === id);
}

/** Romanian specialty label as used in the visible review line. */
export const specialtyLabel: Record<TeamMember["specialty"], string> = {
  dermatologie: "dermatolog",
  urologie: "urolog",
  "medicina-de-familie": "de familie",
};

/** Specialty a reviewer must have for each condition (CLAUDE.md §7c.G). */
export const reviewerSpecialties: Record<string, TeamMember["specialty"][]> = {
  "caderea-parului": ["dermatologie"],
  acnee: ["dermatologie"],
  "disfunctie-erectila": ["urologie", "medicina-de-familie"],
};
