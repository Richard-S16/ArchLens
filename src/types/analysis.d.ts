export type NodeType =
  | "component"
  | "hook"
  | "util"
  | "api"
  | "page"
  | "config"
  | "test"
  | "style"
  | "type"
  | "store"
  | "layout"
  | "context"
  | "other";

export type LayerType = "presentation" | "logic" | "data" | "config" | "test";

export type GraphNode = {
  id: string;
  path: string;
  label: string;
  type: NodeType;
  size: number;
  inDegree: number;
  outDegree: number;
  isHotspot: boolean;
  hasCircularDep: boolean;
  layer: LayerType;
};

export type EdgeType = "static" | "dynamic" | "reexport";

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
};

export type ArchitectureScores = {
  maintainability: number;
  scalability: number;
  coupling: number;
  frontendPerformance: number;
  architectureConsistency: number;
};

export type InsightSeverity = "low" | "medium" | "high";
export type InsightVariant = "warning" | "info" | "success" | "danger";
export type InsightCategory =
  | "coupling"
  | "performance"
  | "maintainability"
  | "scalability"
  | "structure"
  | "dependencies"
  | "architecture";

export type ArchitectureInsight = {
  id: string;
  variant: InsightVariant;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  description: string;
  affectedFiles?: string[];
  metric?: string;
};

export type ArchitecturePattern =
  | "feature-based"
  | "layer-based"
  | "atomic"
  | "mixed"
  | "flat"
  | "unknown";

export type CircularDep = { files: string[] };

export type HotspotFile = {
  path: string;
  inDegree: number;
  outDegree: number;
};

export type ArchitectureMetadata = {
  framework: string | null;
  frameworkVersion: string | null;
  architecturePattern: ArchitecturePattern;
  totalFiles: number;
  sourceFiles: number;
  testFiles: number;
  componentFiles: number;
  typeFiles: number;
  utilFiles: number;
  maxFolderDepth: number;
  avgFilesPerFolder: number;
  circularDependencies: CircularDep[];
  hotspots: HotspotFile[];
  techStack: string[];
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | "unknown";
  hasTypeScript: boolean;
  hasTesting: boolean;
  hasStorybook: boolean;
  hasLinting: boolean;
  entryPoints: string[];
  dynamicImportCount: number;
};

export type AIRecommendationPriority = "high" | "medium" | "low";
export type AIEffortLevel = "low" | "medium" | "high";
export type AIOverallAssessment = "excellent" | "good" | "needs-work" | "critical";

export type AIRecommendation = {
  id: string;
  priority: AIRecommendationPriority;
  title: string;
  rationale: string;
  effort: AIEffortLevel;
  impact: AIEffortLevel;
  category: InsightCategory;
};

export type AIAnalysis = {
  architectureSummary: string;
  keyStrengths: string[];
  criticalRisks: string[];
  recommendations: AIRecommendation[];
  technicalDebtAssessment: string;
  overallAssessment: AIOverallAssessment;
};

export type AnalysisResult = {
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  scores: ArchitectureScores;
  metadata: ArchitectureMetadata;
  insights: ArchitectureInsight[];
  aiAnalysis: AIAnalysis | null;
  parsedFileCount: number;
  analysisTimestamp: string;
};
