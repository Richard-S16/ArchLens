import type { FileNode, RepoMeta } from "@/types/github";
import type {
  GraphNode,
  GraphEdge,
  NodeType,
  LayerType,
  ArchitecturePattern,
  ArchitectureMetadata,
  ArchitectureScores,
  ArchitectureInsight,
  AnalysisResult,
  CircularDep,
  HotspotFile,
} from "@/types/analysis";
import { extractImports, isLocalImport, resolveImportPath } from "@/lib/parser";

export function classifyNodeType(path: string): NodeType {
  const lower = path.toLowerCase();
  const fileName = lower.split("/").pop() ?? "";
  const ext = fileName.split(".").pop() ?? "";

  if (
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.includes("__tests__") ||
    lower.includes("/__test__/") ||
    lower.includes("/test/") ||
    lower.includes("/tests/")
  )
    return "test";

  if (["css", "scss", "sass", "less"].some((e) => ext === e) || lower.includes(".module."))
    return "style";

  if (
    lower.includes(".config.") ||
    lower.endsWith(".config.ts") ||
    lower.endsWith(".config.js") ||
    lower.endsWith(".config.mjs") ||
    lower.endsWith("tsconfig.json") ||
    lower.endsWith(".eslintrc") ||
    lower.includes("jest.config") ||
    lower.includes("vitest.config") ||
    lower.endsWith(".d.ts")
  )
    return "config";

  if (
    lower.includes("/types/") ||
    lower.includes("/type/") ||
    fileName.endsWith(".types.ts") ||
    fileName.endsWith(".types.tsx") ||
    fileName === "types.ts" ||
    fileName === "types.tsx" ||
    (fileName.startsWith("types") && ext === "ts")
  )
    return "type";

  if (
    lower.includes("/hooks/") ||
    lower.includes("/hook/") ||
    (fileName.startsWith("use") &&
      fileName[3] === fileName[3]?.toUpperCase() &&
      (ext === "ts" || ext === "tsx"))
  )
    return "hook";

  if (
    lower.includes("/store/") ||
    lower.includes("/stores/") ||
    lower.includes("/redux/") ||
    lower.includes("/state/") ||
    lower.includes("slice.") ||
    lower.includes(".slice.") ||
    lower.includes("/atoms") ||
    lower.includes("/jotai") ||
    lower.includes("/zustand")
  )
    return "store";

  if (
    lower.includes("/api/") ||
    lower.includes("/services/") ||
    lower.includes("/service/") ||
    lower.includes("/queries/") ||
    lower.includes("/mutations/") ||
    lower.includes("/fetcher") ||
    lower.includes("/client")
  )
    return "api";

  if (
    lower.includes("/context/") ||
    lower.includes("/contexts/") ||
    fileName.includes("context") ||
    fileName.includes("provider")
  )
    return "context";

  if (
    lower.includes("/layouts/") ||
    lower.includes("/layout/") ||
    fileName === "layout.tsx" ||
    fileName === "layout.ts" ||
    fileName === "layout.jsx"
  )
    return "layout";

  if (
    lower.includes("/pages/") ||
    (lower.includes("/app/") &&
      (fileName === "page.tsx" ||
        fileName === "page.ts" ||
        fileName === "page.jsx"))
  )
    return "page";

  if (ext === "tsx" || ext === "jsx") return "component";

  if (
    lower.includes("/utils/") ||
    lower.includes("/util/") ||
    lower.includes("/helpers/") ||
    lower.includes("/lib/") ||
    fileName.startsWith("utils") ||
    fileName.startsWith("helpers")
  )
    return "util";

  return "other";
}

export function classifyLayer(type: NodeType): LayerType {
  switch (type) {
    case "component":
    case "page":
    case "layout":
      return "presentation";
    case "hook":
    case "util":
    case "context":
    case "store":
      return "logic";
    case "api":
      return "data";
    case "config":
    case "type":
      return "config";
    case "test":
      return "test";
    default:
      return "logic";
  }
}

export function detectFramework(
  tree: FileNode[],
  deps: Record<string, string>
): { framework: string | null; frameworkVersion: string | null } {
  const paths = tree.map((n) => n.path.toLowerCase());

  const checks: [string, RegExp | null, string | null][] = [
    ["Next.js", null, "next"],
    ["Nuxt", null, "nuxt"],
    ["Remix", null, "@remix-run/react"],
    ["Astro", null, "astro"],
    ["SvelteKit", null, "@sveltejs/kit"],
    ["Vite + React", null, "vite"],
    ["Create React App", null, "react-scripts"],
    ["Angular", null, "@angular/core"],
    ["Vue", null, "vue"],
    ["Svelte", null, "svelte"],
    ["Solid", null, "solid-js"],
  ];

  if (paths.some((p) => p === "next.config.ts" || p === "next.config.js" || p === "next.config.mjs"))
    return { framework: "Next.js", frameworkVersion: deps["next"] ?? null };
  if (paths.some((p) => p === "nuxt.config.ts" || p === "nuxt.config.js"))
    return { framework: "Nuxt", frameworkVersion: deps["nuxt"] ?? null };
  if (paths.some((p) => p === "astro.config.mjs" || p === "astro.config.ts"))
    return { framework: "Astro", frameworkVersion: deps["astro"] ?? null };
  if (paths.some((p) => p.includes("svelte.config")))
    return { framework: "SvelteKit", frameworkVersion: deps["@sveltejs/kit"] ?? null };
  if (paths.some((p) => p === "remix.config.js" || p === "remix.config.ts"))
    return { framework: "Remix", frameworkVersion: deps["@remix-run/react"] ?? null };
  if (paths.some((p) => p === "vite.config.ts" || p === "vite.config.js"))
    return { framework: "Vite", frameworkVersion: deps["vite"] ?? null };

  for (const [name, , dep] of checks) {
    if (dep && dep in deps) {
      return { framework: name, frameworkVersion: deps[dep] ?? null };
    }
  }

  return { framework: null, frameworkVersion: null };
}

export function detectArchitecturePattern(tree: FileNode[]): ArchitecturePattern {
  const dirs = new Set<string>();
  for (const node of tree) {
    const parts = node.path.split("/");
    if (parts.length > 1) dirs.add(parts[0]);
    if (parts.length > 2) dirs.add(`${parts[0]}/${parts[1]}`);
  }

  const dirStr = [...dirs].join(" ").toLowerCase();

  const featureIndicators = ["features", "modules", "domains", "slices", "feature"].filter(
    (d) => dirStr.includes(d)
  ).length;
  const atomicIndicators = ["atoms", "molecules", "organisms", "templates"].filter(
    (d) => dirStr.includes(d)
  ).length;
  const layerIndicators = ["components", "hooks", "services", "utils", "store", "api", "types"].filter(
    (d) => dirStr.includes(d)
  ).length;

  if (atomicIndicators >= 2) return "atomic";
  if (featureIndicators >= 1) return "feature-based";
  if (layerIndicators >= 3) return "layer-based";
  if (layerIndicators >= 1) return "mixed";

  const deepFiles = tree.filter((n) => (n.path.match(/\//g) ?? []).length >= 2).length;
  const totalFiles = tree.filter((n) => n.type === "blob").length;
  if (totalFiles > 0 && deepFiles / totalFiles < 0.3) return "flat";

  return "unknown";
}

export function detectTechStack(
  deps: Record<string, string>,
  devDeps: Record<string, string>
): string[] {
  const all = { ...deps, ...devDeps };
  const stack: string[] = [];

  const checks: [string, string][] = [
    ["React", "react"],
    ["TypeScript", "typescript"],
    ["Tailwind CSS", "tailwindcss"],
    ["shadcn/ui", "shadcn"],
    ["Framer Motion", "framer-motion"],
    ["Zustand", "zustand"],
    ["Redux Toolkit", "@reduxjs/toolkit"],
    ["React Query", "@tanstack/react-query"],
    ["Prisma", "prisma"],
    ["tRPC", "@trpc/server"],
    ["Zod", "zod"],
    ["React Hook Form", "react-hook-form"],
    ["Radix UI", "radix-ui"],
    ["Vitest", "vitest"],
    ["Jest", "jest"],
    ["Testing Library", "@testing-library/react"],
    ["Storybook", "@storybook/react"],
    ["ESLint", "eslint"],
    ["Prettier", "prettier"],
    ["Valtio", "valtio"],
    ["Jotai", "jotai"],
    ["SWR", "swr"],
    ["Axios", "axios"],
    ["GSAP", "gsap"],
    ["Three.js", "three"],
    ["D3", "d3"],
    ["Recharts", "recharts"],
    ["Chart.js", "chart.js"],
    ["Lucide", "lucide-react"],
    ["Supabase", "@supabase/supabase-js"],
    ["Firebase", "firebase"],
    ["NextAuth", "next-auth"],
    ["Clerk", "@clerk/nextjs"],
    ["Drizzle ORM", "drizzle-orm"],
  ];

  for (const [label, pkg] of checks) {
    if (pkg in all) stack.push(label);
  }

  return stack;
}

export function detectPackageManager(tree: FileNode[]): ArchitectureMetadata["packageManager"] {
  const paths = tree.map((n) => n.path);
  if (paths.includes("bun.lockb")) return "bun";
  if (paths.includes("pnpm-lock.yaml")) return "pnpm";
  if (paths.includes("yarn.lock")) return "yarn";
  if (paths.includes("package-lock.json")) return "npm";
  return "unknown";
}

const HOTSPOT_MIN_INDEGREE = 4;

export function buildDependencyGraph(
  fileContents: Map<string, string>,
  allPaths: Set<string>
): { nodes: GraphNode[]; edges: GraphEdge[]; dynamicImportCount: number } {
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const edges: GraphEdge[] = [];
  let dynamicImportCount = 0;

  for (const p of allPaths) {
    inDegree.set(p, 0);
    outDegree.set(p, 0);
  }

  for (const [filePath, content] of fileContents) {
    const imports = extractImports(content);
    for (const { path: importPath, isDynamic } of imports) {
      if (!isLocalImport(importPath)) continue;
      const resolved = resolveImportPath(importPath, filePath, allPaths);
      if (!resolved || resolved === filePath) continue;

      if (isDynamic) dynamicImportCount++;

      const edgeId = `${filePath}→${resolved}`;
      if (!edges.find((e) => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source: filePath,
          target: resolved,
          type: isDynamic ? "dynamic" : "static",
        });
        outDegree.set(filePath, (outDegree.get(filePath) ?? 0) + 1);
        inDegree.set(resolved, (inDegree.get(resolved) ?? 0) + 1);
      }
    }
  }

  const degrees = [...inDegree.values()];
  const mean = degrees.reduce((a, b) => a + b, 0) / (degrees.length || 1);
  const std = Math.sqrt(
    degrees.reduce((sum, d) => sum + (d - mean) ** 2, 0) / (degrees.length || 1)
  );
  const hotspotThreshold = Math.max(HOTSPOT_MIN_INDEGREE, mean + 1.5 * std);

  const circularFiles = new Set<string>();
  for (const dep of detectCircularDependencies([...allPaths], edges).slice(0, 20)) {
    for (const f of dep.files) circularFiles.add(f);
  }

  const activeNodes = new Set<string>([
    ...fileContents.keys(),
    ...edges.map((e) => e.source),
    ...edges.map((e) => e.target),
  ]);

  const nodes: GraphNode[] = [];
  for (const path of activeNodes) {
    const type = classifyNodeType(path);
    const ind = inDegree.get(path) ?? 0;
    const outd = outDegree.get(path) ?? 0;
    nodes.push({
      id: path,
      path,
      label: path.split("/").pop() ?? path,
      type,
      size: 1,
      inDegree: ind,
      outDegree: outd,
      isHotspot: ind >= hotspotThreshold,
      hasCircularDep: circularFiles.has(path),
      layer: classifyLayer(type),
    });
  }

  return { nodes, edges, dynamicImportCount };
}

export function detectCircularDependencies(
  nodeIds: string[],
  edges: GraphEdge[]
): CircularDep[] {
  const graph = new Map<string, string[]>();
  for (const id of nodeIds) graph.set(id, []);
  for (const { source, target } of edges) {
    graph.get(source)?.push(target);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycles: CircularDep[] = [];

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx !== -1) {
        const cycle = path.slice(idx);
        const key = [...cycle].sort().join("|");
        if (!cycles.find((c) => [...c.files].sort().join("|") === key)) {
          cycles.push({ files: cycle });
        }
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    for (const neighbor of graph.get(node) ?? []) {
      dfs(neighbor, [...path, node]);
      if (cycles.length >= 15) return;
    }

    stack.delete(node);
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) dfs(id, []);
    if (cycles.length >= 15) break;
  }

  return cycles;
}

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

  const avgIn = nodes.reduce((s, n) => s + n.inDegree, 0) / nodes.length;
  const maxIn = Math.max(...nodes.map((n) => n.inDegree), 0);
  const hotspotRatio = nodes.filter((n) => n.isHotspot).length / nodes.length;
  const circularRatio = metadata.circularDependencies.length / Math.max(nodes.length, 1);

  let s = 100;
  s -= Math.min(25, avgIn * 5);
  s -= Math.min(20, hotspotRatio * 120);
  s -= Math.min(25, circularRatio * 200);
  s -= Math.min(15, Math.max(0, maxIn - 6) * 1.5);

  return Math.max(10, Math.min(100, Math.round(s)));
}

function scoreMaintainability(m: ArchitectureMetadata): number {
  let s = 55;
  if (m.hasTypeScript) s += 15;
  if (m.hasTesting) s += 10;
  if (m.hasLinting) s += 8;
  if (m.hasStorybook) s += 4;

  const testRatio = m.sourceFiles > 0 ? m.testFiles / m.sourceFiles : 0;
  s += Math.min(10, testRatio * 35);

  if (m.maxFolderDepth > 8) s -= (m.maxFolderDepth - 8) * 3;
  if (m.avgFilesPerFolder > 20) s -= 5;
  if (m.avgFilesPerFolder > 30) s -= 8;

  return Math.max(20, Math.min(100, Math.round(s)));
}

function scoreScalability(m: ArchitectureMetadata): number {
  const bonus: Record<string, number> = {
    "feature-based": 28,
    atomic: 18,
    "layer-based": 12,
    mixed: 4,
    flat: -18,
    unknown: 0,
  };

  let s = 52;
  s += bonus[m.architecturePattern] ?? 0;
  if (m.hasTypeScript) s += 6;
  if (m.hasTesting) s += 5;
  if (m.circularDependencies.length === 0) s += 5;
  else s -= Math.min(15, m.circularDependencies.length * 2);

  return Math.max(20, Math.min(100, Math.round(s)));
}

function scoreFrontendPerformance(m: ArchitectureMetadata): number {
  let s = 60;
  const perfFrameworks = ["next", "nuxt", "remix", "astro", "sveltekit"];
  if (m.framework && perfFrameworks.some((f) => m.framework!.toLowerCase().includes(f))) s += 15;

  s += Math.min(10, m.dynamicImportCount * 2);
  if (m.hasTypeScript) s += 5;

  const techStack = m.techStack.join(" ").toLowerCase();
  if (techStack.includes("react query") || techStack.includes("swr")) s += 5;
  if (techStack.includes("tailwind")) s += 3;

  return Math.max(30, Math.min(100, Math.round(s)));
}

function scoreArchConsistency(nodes: GraphNode[], m: ArchitectureMetadata): number {
  let s = 65;

  if (m.architecturePattern !== "unknown" && m.architecturePattern !== "mixed") s += 15;
  else if (m.architecturePattern === "mixed") s -= 5;

  if (m.circularDependencies.length === 0) s += 10;
  else s -= Math.min(20, m.circularDependencies.length * 3);

  const typeVariance =
    new Set(nodes.filter((n) => n.type !== "other" && n.type !== "test").map((n) => n.type)).size;
  if (typeVariance > 6) s += 5;
  if (typeVariance > 9) s -= 5;

  return Math.max(20, Math.min(100, Math.round(s)));
}

export function generateInsights(
  nodes: GraphNode[],
  edges: GraphEdge[],
  metadata: ArchitectureMetadata,
  scores: ArchitectureScores
): ArchitectureInsight[] {
  const insights: ArchitectureInsight[] = [];
  const add = (i: ArchitectureInsight) => insights.push(i);

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
      affectedFiles: metadata.hotspots.slice(0, 3).map((h) => h.path),
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

export function computeTreeMetadata(tree: FileNode[]): {
  sourceFiles: number;
  testFiles: number;
  componentFiles: number;
  typeFiles: number;
  utilFiles: number;
  maxFolderDepth: number;
  avgFilesPerFolder: number;
  entryPoints: string[];
  hasTypeScript: boolean;
  hasTesting: boolean;
  hasStorybook: boolean;
  hasLinting: boolean;
} {
  const blobs = tree.filter((n) => n.type === "blob");
  const lowerPaths = blobs.map((n) => n.path.toLowerCase());

  const testFiles = lowerPaths.filter(
    (p) => p.includes(".test.") || p.includes(".spec.") || p.includes("__tests__")
  ).length;

  const sourceFiles = lowerPaths.filter((p) =>
    [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"].some((e) => p.endsWith(e))
  ).length;

  const componentFiles = lowerPaths.filter(
    (p) => p.endsWith(".tsx") || p.endsWith(".jsx")
  ).length;

  const typeFiles = lowerPaths.filter(
    (p) =>
      p.includes("/types/") ||
      p.endsWith(".types.ts") ||
      p.endsWith(".types.tsx") ||
      p.endsWith(".d.ts")
  ).length;

  const utilFiles = lowerPaths.filter(
    (p) => p.includes("/utils/") || p.includes("/helpers/") || p.includes("/lib/")
  ).length;

  const depths = blobs.map((n) => (n.path.match(/\//g) ?? []).length);
  const maxFolderDepth = depths.length > 0 ? Math.max(...depths) : 0;

  const folderCounts = new Map<string, number>();
  for (const n of blobs) {
    const dir = n.path.includes("/") ? n.path.split("/").slice(0, -1).join("/") : "/";
    folderCounts.set(dir, (folderCounts.get(dir) ?? 0) + 1);
  }
  const avgFilesPerFolder =
    folderCounts.size > 0
      ? [...folderCounts.values()].reduce((a, b) => a + b, 0) / folderCounts.size
      : 0;

  const entryPoints = lowerPaths
    .filter((p) =>
      ["src/index.ts", "src/index.tsx", "src/main.ts", "src/main.tsx", "src/app.tsx",
        "app/page.tsx", "pages/index.tsx", "pages/index.js"].some((ep) => p.endsWith(ep))
    )
    .slice(0, 3);

  const hasTypeScript = lowerPaths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"));
  const hasTesting = testFiles > 0;
  const hasStorybook = lowerPaths.some(
    (p) => p.includes(".stories.") || p.includes("/.storybook/")
  );
  const hasLinting = lowerPaths.some(
    (p) =>
      p.includes(".eslintrc") ||
      p.includes("eslint.config") ||
      p.includes("biome.json") ||
      p.includes(".oxlintrc")
  );

  return {
    sourceFiles,
    testFiles,
    componentFiles,
    typeFiles,
    utilFiles,
    maxFolderDepth,
    avgFilesPerFolder: Math.round(avgFilesPerFolder * 10) / 10,
    entryPoints,
    hasTypeScript,
    hasTesting,
    hasStorybook,
    hasLinting,
  };
}

export function analyzeRepository(
  tree: FileNode[],
  meta: RepoMeta,
  languages: Record<string, number>,
  fileContents: Map<string, string>,
  packageJson: Record<string, unknown> | null
): AnalysisResult {
  const blobs = tree.filter((n) => n.type === "blob");
  const allPaths = new Set(blobs.map((n) => n.path));

  const deps = (packageJson?.dependencies as Record<string, string>) ?? {};
  const devDeps = (packageJson?.devDependencies as Record<string, string>) ?? {};
  const allDeps = { ...deps, ...devDeps };

  const { framework, frameworkVersion } = detectFramework(tree, allDeps);
  const techStack = detectTechStack(deps, devDeps);
  const architecturePattern = detectArchitecturePattern(tree);
  const packageManager = detectPackageManager(tree);

  const treeMeta = computeTreeMetadata(tree);

  const { nodes, edges, dynamicImportCount } = buildDependencyGraph(fileContents, allPaths);

  const circularDependencies = detectCircularDependencies(
    nodes.map((n) => n.id),
    edges
  );

  const hotspots: HotspotFile[] = nodes
    .filter((n) => n.isHotspot)
    .sort((a, b) => b.inDegree - a.inDegree)
    .slice(0, 10)
    .map((n) => ({ path: n.path, inDegree: n.inDegree, outDegree: n.outDegree }));

  const metadata: ArchitectureMetadata = {
    framework,
    frameworkVersion,
    architecturePattern,
    totalFiles: blobs.length,
    ...treeMeta,
    circularDependencies,
    hotspots,
    techStack,
    packageManager,
    dynamicImportCount,
  };

  const scores = calculateScores(nodes, edges, metadata);
  const insights = generateInsights(nodes, edges, metadata, scores);

  return {
    graph: { nodes, edges },
    scores,
    metadata,
    insights,
    parsedFileCount: fileContents.size,
    analysisTimestamp: new Date().toISOString(),
  };
}
