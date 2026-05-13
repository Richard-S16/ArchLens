import type {
  GraphNode,
  GraphEdge,
  ArchitectureMetadata,
  ArchitectureScores,
  ArchitectureInsight,
} from "@/types/analysis";

export function generateInsights(
  nodes: GraphNode[],
  edges: GraphEdge[],
  metadata: ArchitectureMetadata,
  scores: ArchitectureScores
): ArchitectureInsight[] {
  const insights: ArchitectureInsight[] = [];
  const add = (insight: ArchitectureInsight) => insights.push(insight);

  if (metadata.circularDependencies.length > 0) {
    add({
      id: "circular-deps",
      variant: "danger",
      severity: "high",
      category: "coupling",
      title: `${metadata.circularDependencies.length} Circular Dependency Chain${metadata.circularDependencies.length > 1 ? "s" : ""} Detected`,
      description:
        "Circular dependencies create tight coupling and make modules impossible to tree-shake. Establish a clear dependency direction — typically: data → logic → presentation.",
      affectedFiles: metadata.circularDependencies[0]?.files.slice(0, 3),
      metric: `${metadata.circularDependencies.length} cycle${metadata.circularDependencies.length > 1 ? "s" : ""}`,
    });
  }

  if (metadata.hotspots.length > 3) {
    add({
      id: "hotspot-files",
      variant: "warning",
      severity: "medium",
      category: "coupling",
      title: "Dependency Hotspot Files Identified",
      description: `${metadata.hotspots.length} files carry disproportionate import load, creating high-blast-radius change points. Splitting these barrel files or introducing dependency injection can reduce coupling.`,
      affectedFiles: metadata.hotspots.slice(0, 3).map((hotspot) => hotspot.path),
      metric: `${metadata.hotspots.length} hotspots`,
    });
  }

  if (!metadata.hasTypeScript) {
    add({
      id: "no-typescript",
      variant: "warning",
      severity: "medium",
      category: "maintainability",
      title: "TypeScript Not Adopted",
      description:
        "TypeScript catches up to 15% of production bugs at compile time and dramatically improves IDE support. Adopting it alongside JSDoc types provides an incremental migration path.",
    });
  }

  if (!metadata.hasTesting) {
    add({
      id: "no-testing",
      variant: "warning",
      severity: "high",
      category: "maintainability",
      title: "No Test Infrastructure Detected",
      description:
        "No test files found. Adding a testing layer (Vitest or Jest + Testing Library) would reduce regression risk and signal architectural maturity to contributors.",
    });
  } else {
    const testRatio = metadata.sourceFiles > 0 ? metadata.testFiles / metadata.sourceFiles : 0;
    if (testRatio < 0.15) {
      add({
        id: "low-test-ratio",
        variant: "info",
        severity: "medium",
        category: "maintainability",
        title: "Low Test-to-Source Ratio",
        description: `Only ${Math.round(testRatio * 100)}% of source files have corresponding tests. A ratio above 30% is the threshold where confident refactoring becomes realistic.`,
        metric: `${Math.round(testRatio * 100)}% test coverage`,
      });
    }
  }

  if (metadata.architecturePattern === "flat") {
    add({
      id: "flat-structure",
      variant: "warning",
      severity: "medium",
      category: "scalability",
      title: "Flat Module Structure May Limit Scale",
      description:
        "Without clear architectural boundaries the codebase will develop implicit coupling over time. Establishing feature- or layer-based grouping before the codebase grows reduces future refactoring cost.",
    });
  } else if (metadata.architecturePattern === "feature-based") {
    add({
      id: "feature-arch",
      variant: "success",
      severity: "low",
      category: "architecture",
      title: "Feature-Based Architecture Detected",
      description:
        "Co-locating code by feature rather than technical role promotes high cohesion, low coupling, and easy deletion of features — a pattern that scales linearly with team size.",
    });
  } else if (metadata.architecturePattern === "atomic") {
    add({
      id: "atomic-arch",
      variant: "success",
      severity: "low",
      category: "architecture",
      title: "Atomic Design System Detected",
      description:
        "Atomic design creates a clear component hierarchy from atoms to organisms. Combined with a design token system, this produces highly reusable, documented UI primitives.",
    });
  } else if (metadata.architecturePattern === "layer-based") {
    add({
      id: "layer-arch",
      variant: "success",
      severity: "low",
      category: "architecture",
      title: "Layer-Based Architecture Detected",
      description:
        "Clear separation between UI components, business logic, data fetching, and utilities makes this codebase predictable and easy to navigate for new contributors.",
    });
  }

  if (scores.coupling < 45) {
    add({
      id: "high-coupling",
      variant: "danger",
      severity: "high",
      category: "coupling",
      title: "Elevated Inter-Module Coupling",
      description:
        "High average import density increases change blast radius and makes isolated testing difficult. Consider introducing interface boundaries and avoiding deep barrel re-exports.",
    });
  }

  if (metadata.maxFolderDepth > 9) {
    add({
      id: "deep-nesting",
      variant: "warning",
      severity: "low",
      category: "structure",
      title: "Excessive Folder Nesting",
      description: `Maximum folder depth of ${metadata.maxFolderDepth} harms navigability. Aim for ≤ 5–6 levels by colocating related code and reducing intermediate directories.`,
      metric: `Depth: ${metadata.maxFolderDepth}`,
    });
  }

  if (!metadata.hasLinting) {
    add({
      id: "no-linting",
      variant: "info",
      severity: "low",
      category: "maintainability",
      title: "No Code Quality Enforcement",
      description:
        "Adding ESLint (or Biome for zero-config) enforces consistent style, prevents common anti-patterns, and surfaces issues before runtime.",
    });
  }

  if (metadata.dynamicImportCount > 5) {
    add({
      id: "code-splitting",
      variant: "success",
      severity: "low",
      category: "performance",
      title: "Intentional Code Splitting Detected",
      description: `${metadata.dynamicImportCount} dynamic imports signal deliberate route- or component-level code splitting, reducing initial bundle size and improving TTI.`,
      metric: `${metadata.dynamicImportCount} dynamic imports`,
    });
  }

  if (edges.length > 400) {
    add({
      id: "high-edge-count",
      variant: "info",
      severity: "medium",
      category: "dependencies",
      title: "Dense Dependency Graph",
      description: `${edges.length} inter-module dependency edges create a dense graph. Consider auditing barrel files — they often inflate edge counts without adding organisational value.`,
      metric: `${edges.length} edges`,
    });
  }

  return insights.slice(0, 8);
}
