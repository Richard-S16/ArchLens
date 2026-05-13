import type { ArchitectureScores } from "@/types/analysis";

export type ScoreKey = keyof ArchitectureScores;

export const SCORE_META: Record<ScoreKey, { label: string; description: string }> = {
  coupling: { label: "Coupling", description: "Module decoupling quality" },
  maintainability: { label: "Maintainability", description: "Code quality & test coverage" },
  scalability: { label: "Scalability", description: "Architecture growth potential" },
  frontendPerformance: { label: "Performance", description: "Frontend delivery efficiency" },
  architectureConsistency: { label: "Consistency", description: "Structural pattern coherence" },
};
