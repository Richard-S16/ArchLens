import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { AnalysisResult, AIAnalysis } from "@/types/analysis";
import type { RepoMeta } from "@/types/github";

const recommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  rationale: z.string(),
  effort: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high"]),
  category: z.enum([
    "coupling",
    "performance",
    "maintainability",
    "scalability",
    "structure",
    "dependencies",
    "architecture",
  ]),
});

const aiAnalysisSchema = z.object({
  architectureSummary: z.string(),
  keyStrengths: z.array(z.string()),
  criticalRisks: z.array(z.string()),
  recommendations: z.array(recommendationSchema),
  technicalDebtAssessment: z.string(),
  overallAssessment: z.enum(["excellent", "good", "needs-work", "critical"]),
});

function buildPrompt(result: Omit<AnalysisResult, "aiAnalysis">, meta: RepoMeta): string {
  const { scores, metadata, insights, graph } = result;

  const hotspotLines = metadata.hotspots
    .slice(0, 5)
    .map((h) => `- ${h.path} (in: ${h.inDegree}, out: ${h.outDegree})`)
    .join("\n");

  const insightLines = insights
    .slice(0, 6)
    .map((i) => `- [${i.severity}] ${i.title}`)
    .join("\n");

  return `You are a staff software architect performing an architectural review. Analyze this GitHub repository and return structured architectural intelligence.

REPOSITORY
Name: ${meta.fullName}
Description: ${meta.description ?? "No description provided"}
Primary Language: ${meta.language ?? "Unknown"}
Stars: ${meta.stars} | Forks: ${meta.forks}
Framework: ${metadata.framework ?? "Unknown"}${metadata.frameworkVersion ? ` v${metadata.frameworkVersion}` : ""}
Architecture Pattern: ${metadata.architecturePattern}
Tech Stack: ${metadata.techStack.slice(0, 12).join(", ")}

FILE STATISTICS
Total files: ${metadata.totalFiles} | Source files: ${metadata.sourceFiles}
Component files: ${metadata.componentFiles} | Type files: ${metadata.typeFiles}
Test files: ${metadata.testFiles} | Util files: ${metadata.utilFiles}
Max folder depth: ${metadata.maxFolderDepth} | Avg files/folder: ${metadata.avgFilesPerFolder}
TypeScript: ${metadata.hasTypeScript ? "yes" : "no"} | Testing: ${metadata.hasTesting ? "yes" : "no"} | Linting: ${metadata.hasLinting ? "yes" : "no"} | Storybook: ${metadata.hasStorybook ? "yes" : "no"}

DEPENDENCY GRAPH
Nodes: ${graph.nodes.length} | Edges: ${graph.edges.length}
Hotspot files: ${metadata.hotspots.length} | Circular dependencies: ${metadata.circularDependencies.length}
Dynamic imports: ${metadata.dynamicImportCount}

TOP HOTSPOT FILES
${hotspotLines || "None detected"}

ARCHITECTURE SCORES (0–100)
Maintainability: ${scores.maintainability}
Scalability: ${scores.scalability}
Coupling: ${scores.coupling}
Frontend Performance: ${scores.frontendPerformance}
Architecture Consistency: ${scores.architectureConsistency}

DETECTED ISSUES
${insightLines || "No significant issues detected"}

INSTRUCTIONS
Provide:
1. architectureSummary: 2–3 sentences. Be specific — reference actual numbers, patterns, and framework. Sound like an experienced engineer, not a generic AI.
2. keyStrengths: 3–4 specific strengths grounded in the data above.
3. criticalRisks: 3–4 specific risks grounded in the data above. If scores are low, explain why.
4. recommendations: 4–5 concrete, prioritized actions. Each must have a specific title, detailed rationale, effort estimate, and expected impact.
5. technicalDebtAssessment: 1–2 sentences summarizing the technical debt burden.
6. overallAssessment: One of "excellent" (avg score ≥85), "good" (≥70), "needs-work" (≥50), or "critical" (<50).

Do not hallucinate frameworks or files. Base everything on the data provided.`;
}

export async function generateAIAnalysis(
  result: Omit<AnalysisResult, "aiAnalysis">,
  meta: RepoMeta
): Promise<AIAnalysis | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY not set — skipping AI analysis");
    return null;
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite"),
      schema: aiAnalysisSchema,
      prompt: buildPrompt(result, meta),
    });

    return object as AIAnalysis;
  } catch (err) {
    console.error("AI analysis failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
