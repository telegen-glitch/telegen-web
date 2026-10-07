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

/**
 * Who decides, as shown in the hero condition panels. A specialty is named only when it is
 * certain: a team member of an allowed specialty exists, or the condition allows exactly one
 * specialty. Otherwise "Un medic". Never a name or photo.
 */
export function decidingDoctor(conditionSlug: string): string {
  const allowed = reviewerSpecialties[conditionSlug] ?? [];
  const member = team.find((m) => allowed.includes(m.specialty));
  const specialty = member?.specialty ?? (allowed.length === 1 ? allowed[0] : undefined);
  return specialty ? `Un medic ${specialtyLabel[specialty]}` : "Un medic";
}

/** Specialty a reviewer must have for each condition (CLAUDE.md §7c.G). */
export const reviewerSpecialties: Record<string, TeamMember["specialty"][]> = {
  "caderea-parului": ["dermatologie"],
  acnee: ["dermatologie"],
  "disfunctie-erectila": ["urologie", "medicina-de-familie"],
};
