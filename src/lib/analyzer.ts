import type { FileNode, RepoMeta } from "@/types/github";
import type {
  ArchitectureMetadata,
  AnalysisResult,
  HotspotFile,
} from "@/types/analysis";
import { detectFramework, detectArchitecturePattern, detectTechStack, detectPackageManager } from "@/lib/detector";
import { buildDependencyGraph, detectCircularDependencies } from "@/lib/graphBuilder";
import { calculateScores } from "@/lib/scorer";
import { generateInsights } from "@/lib/insightGenerator";


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
  const blobs = tree.filter((node) => node.type === "blob");
  const lowerPaths = blobs.map((node) => node.path.toLowerCase());

  const testFiles = lowerPaths.filter(
    (path) => path.includes(".test.") || path.includes(".spec.") || path.includes("__tests__")
  ).length;

  const sourceFiles = lowerPaths.filter((path) =>
    [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"].some((ext) => path.endsWith(ext))
  ).length;

  const componentFiles = lowerPaths.filter(
    (path) => path.endsWith(".tsx") || path.endsWith(".jsx")
  ).length;

  const typeFiles = lowerPaths.filter(
    (path) =>
      path.includes("/types/") ||
      path.endsWith(".types.ts") ||
      path.endsWith(".types.tsx") ||
      path.endsWith(".d.ts")
  ).length;

  const utilFiles = lowerPaths.filter(
    (path) => path.includes("/utils/") || path.includes("/helpers/") || path.includes("/lib/")
  ).length;

  const depths = blobs.map((node) => (node.path.match(/\//g) ?? []).length);
  const maxFolderDepth = depths.length > 0 ? Math.max(...depths) : 0;

  const folderCounts = new Map<string, number>();
  for (const n of blobs) {
    const dir = n.path.includes("/") ? n.path.split("/").slice(0, -1).join("/") : "/";
    folderCounts.set(dir, (folderCounts.get(dir) ?? 0) + 1);
  }
  const avgFilesPerFolder =
    folderCounts.size > 0
      ? [...folderCounts.values()].reduce((sum, count) => sum + count, 0) / folderCounts.size
      : 0;

  const entryPoints = lowerPaths
    .filter((path) =>
      ["src/index.ts", "src/index.tsx", "src/main.ts", "src/main.tsx", "src/app.tsx",
        "app/page.tsx", "pages/index.tsx", "pages/index.js"].some((entryPoint) => path.endsWith(entryPoint))
    )
    .slice(0, 3);

  const hasTypeScript = lowerPaths.some((path) => path.endsWith(".ts") || path.endsWith(".tsx"));
  const hasTesting = testFiles > 0;
  const hasStorybook = lowerPaths.some(
    (path) => path.includes(".stories.") || path.includes("/.storybook/")
  );
  const hasLinting = lowerPaths.some(
    (path) =>
      path.includes(".eslintrc") ||
      path.includes("eslint.config") ||
      path.includes("biome.json") ||
      path.includes(".oxlintrc")
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
  const blobs = tree.filter((node) => node.type === "blob");
  const allPaths = new Set(blobs.map((node) => node.path));

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
    nodes.map((node) => node.id),
    edges
  );

  const hotspots: HotspotFile[] = nodes
    .filter((node) => node.isHotspot)
    .sort((nodeA, nodeB) => nodeB.inDegree - nodeA.inDegree)
    .slice(0, 10)
    .map((node) => ({ path: node.path, inDegree: node.inDegree, outDegree: node.outDegree }));

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
