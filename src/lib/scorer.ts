import type { GraphNode, GraphEdge, ArchitectureMetadata, ArchitectureScores } from "@/types/analysis";

export function calculateScores(
  nodes: GraphNode[],
  edges: GraphEdge[],
  metadata: ArchitectureMetadata
): ArchitectureScores {
  return {
    coupling: scoreCoupling(nodes, metadata),
    maintainability: scoreMaintainability(metadata),
    scalability: scoreScalability(metadata),
    frontendPerformance: scoreFrontendPerformance(metadata),
    architectureConsistency: scoreArchConsistency(nodes, metadata),
  };
}

function scoreCoupling(nodes: GraphNode[], metadata: ArchitectureMetadata): number {
  if (nodes.length === 0) return 72;

  const avgIn = nodes.reduce((sum, node) => sum + node.inDegree, 0) / nodes.length;
  const maxIn = Math.max(...nodes.map((node) => node.inDegree), 0);
  const hotspotRatio = nodes.filter((node) => node.isHotspot).length / nodes.length;
  const circularRatio = metadata.circularDependencies.length / Math.max(nodes.length, 1);

  let score = 100;
  score -= Math.min(25, avgIn * 5);
  score -= Math.min(20, hotspotRatio * 120);
  score -= Math.min(25, circularRatio * 200);
  score -= Math.min(15, Math.max(0, maxIn - 6) * 1.5);

  return Math.max(10, Math.min(100, Math.round(score)));
}

function scoreMaintainability(metadata: ArchitectureMetadata): number {
  let score = 55;
  if (metadata.hasTypeScript) score += 15;
  if (metadata.hasTesting) score += 10;
  if (metadata.hasLinting) score += 8;
  if (metadata.hasStorybook) score += 4;

  const testRatio = metadata.sourceFiles > 0 ? metadata.testFiles / metadata.sourceFiles : 0;
  score += Math.min(10, testRatio * 35);

  if (metadata.maxFolderDepth > 8) score -= (metadata.maxFolderDepth - 8) * 3;
  if (metadata.avgFilesPerFolder > 20) score -= 5;
  if (metadata.avgFilesPerFolder > 30) score -= 8;

  return Math.max(20, Math.min(100, Math.round(score)));
}

function scoreScalability(metadata: ArchitectureMetadata): number {
  const bonus: Record<string, number> = {
    "feature-based": 28,
    atomic: 18,
    "layer-based": 12,
    mixed: 4,
    flat: -18,
    unknown: 0,
  };

  let score = 52;
  score += bonus[metadata.architecturePattern] ?? 0;
  if (metadata.hasTypeScript) score += 6;
  if (metadata.hasTesting) score += 5;
  if (metadata.circularDependencies.length === 0) score += 5;
  else score -= Math.min(15, metadata.circularDependencies.length * 2);

  return Math.max(20, Math.min(100, Math.round(score)));
}

function scoreFrontendPerformance(metadata: ArchitectureMetadata): number {
  let score = 60;
  const perfFrameworks = ["next", "nuxt", "remix", "astro", "sveltekit"];
  if (metadata.framework && perfFrameworks.some((perfFramework) => metadata.framework!.toLowerCase().includes(perfFramework))) score += 15;

  score += Math.min(10, metadata.dynamicImportCount * 2);
  if (metadata.hasTypeScript) score += 5;

  const techStack = metadata.techStack.join(" ").toLowerCase();
  if (techStack.includes("react query") || techStack.includes("swr")) score += 5;
  if (techStack.includes("tailwind")) score += 3;

  return Math.max(30, Math.min(100, Math.round(score)));
}

function scoreArchConsistency(nodes: GraphNode[], metadata: ArchitectureMetadata): number {
  let score = 65;

  if (metadata.architecturePattern !== "unknown" && metadata.architecturePattern !== "mixed") score += 15;
  else if (metadata.architecturePattern === "mixed") score -= 5;

  if (metadata.circularDependencies.length === 0) score += 10;
  else score -= Math.min(20, metadata.circularDependencies.length * 3);

  const typeVariance =
    new Set(nodes.filter((node) => node.type !== "other" && node.type !== "test").map((node) => node.type)).size;
  if (typeVariance > 6) score += 5;
  if (typeVariance > 9) score -= 5;

  return Math.max(20, Math.min(100, Math.round(score)));
}
