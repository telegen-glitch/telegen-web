import { acneEvaluation } from "./acne";
import { erectileDysfunctionEvaluation } from "./erectile-dysfunction";
import { hairLossEvaluation } from "./hair-loss";
import type { EvaluationDefinition } from "./types";

export const evaluations: EvaluationDefinition[] = [
  hairLossEvaluation,
  acneEvaluation,
  erectileDysfunctionEvaluation,
];

export function getEvaluation(topic: string): EvaluationDefinition | undefined {
  return evaluations.find((e) => e.topic === topic);
}
