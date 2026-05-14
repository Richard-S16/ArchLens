import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { githubFetch, fetchFileContent, fetchSourceFiles } from "@/lib/githubClient";
import { analyzeRepository } from "@/lib/analyzer";
import { generateAIAnalysis } from "@/lib/aiAnalyzer";
import { checkRateLimit, extractClientIP } from "@/lib/rateLimiter";
import type { FileNode } from "@/types/github";

const MAX_BODY_BYTES = 1024;

const bodySchema = z.object({
  owner: z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, "Invalid GitHub username"),
  repo: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid repository name")
    .refine((val) => !val.startsWith("."), "Repository name cannot start with a dot"),
  branch: z
    .string()
    .max(255)
    .regex(/^[a-zA-Z0-9_./-]+$/, "Invalid branch name")
    .optional(),
});

function selectFilesToFetch(tree: FileNode[]): string[] {
  const blobs = tree.filter((node) => node.type === "blob");

  const SOURCE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs", ".vue", ".svelte"];
  const SKIP_PATTERNS = [
    ".min.",
    ".bundle.",
    ".generated.",
    ".d.ts",
    "node_modules",
    ".next",
    "dist/",
    "build/",
    "coverage/",
    ".storybook",
    "__snapshots__",
  ];

  const sourceFiles = blobs.filter((node) => {
    const lower = node.path.toLowerCase();
    if (SKIP_PATTERNS.some((pattern) => lower.includes(pattern))) return false;
    return SOURCE_EXTS.some((ext) => lower.endsWith(ext));
  });

  const scored = sourceFiles.map((node) => {
    let score = 0;
    const lower = node.path.toLowerCase();
    const depth = (node.path.match(/\//g) ?? []).length;

    if (depth <= 2) score += 10;
    if (depth <= 4) score += 5;

    if (lower.includes("index.")) score += 8;
    if (lower.includes("/store") || lower.includes("slice")) score += 6;
    if (lower.includes("/hooks/") || lower.includes("/hook/")) score += 5;
    if (lower.includes("/components/")) score += 4;
    if (lower.includes("/app/") || lower.includes("/pages/")) score += 4;
    if (lower.includes("/lib/") || lower.includes("/utils/")) score += 4;
    if (lower.includes("/api/")) score += 3;

    return { node, score };
  });

  scored.sort((scoredA, scoredB) => scoredB.score - scoredA.score);
  return scored.slice(0, 60).map((scoredFile) => scoredFile.node.path);
}


export async function POST(request: NextRequest) {
  const ip = extractClientIP(request);
  const { allowed, retryAfterSeconds } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 422 }
    );
  }

  const { owner, repo, branch } = parsed.data;

  try {
    const encodedOwner = encodeURIComponent(owner);
    const encodedRepo = encodeURIComponent(repo);

    const [repoData, langsData, treeData] = await Promise.all([
      githubFetch(`/repos/${encodedOwner}/${encodedRepo}`),
      githubFetch(`/repos/${encodedOwner}/${encodedRepo}/languages`),
      githubFetch(`/repos/${encodedOwner}/${encodedRepo}/git/trees/HEAD?recursive=1`),
    ]);

    const tree: FileNode[] = (
      (treeData.tree ?? []) as Array<{ path: string; type: string; size?: number }>
    )
      .filter((rawNode) => rawNode.type === "blob" || rawNode.type === "tree")
      .slice(0, 2000)
      .map((rawNode) => ({ path: rawNode.path, type: rawNode.type as "blob" | "tree", size: rawNode.size }));

    const pkgContent = await fetchFileContent(owner, repo, "package.json", branch);
    let packageJson: Record<string, unknown> | null = null;
    if (pkgContent) {
      try {
        packageJson = JSON.parse(pkgContent) as Record<string, unknown>;
      } catch {
        packageJson = null;
      }
    }

    const filesToFetch = selectFilesToFetch(tree);
    const fileContents = await fetchSourceFiles(owner, repo, filesToFetch, branch);

    if (pkgContent) fileContents.set("package.json", pkgContent);

    const repoMeta = {
      owner: repoData.owner.login as string,
      repo: repoData.name as string,
      fullName: repoData.full_name as string,
      description: (repoData.description as string) ?? null,
      language: (repoData.language as string) ?? null,
      stars: repoData.stargazers_count as number,
      forks: repoData.forks_count as number,
      size: repoData.size as number,
      defaultBranch: repoData.default_branch as string,
      topics: (repoData.topics as string[]) ?? [],
    };

    const result = analyzeRepository(tree, repoMeta, langsData, fileContents, packageJson);

    const aiAnalysis = await generateAIAnalysis(result, repoMeta);

    return NextResponse.json({ ...result, aiAnalysis });
  } catch (err) {
    const code = err instanceof Error ? err.message : "GITHUB_API_ERROR";
    const clientErrors: Record<string, { status: number; message: string }> = {
      NOT_FOUND: { status: 404, message: "Repository not found or is private" },
      FORBIDDEN: { status: 403, message: "Access denied to repository" },
      RATE_LIMITED: { status: 429, message: "GitHub rate limit reached. Try again later." },
    };
    const response = clientErrors[code] ?? { status: 500, message: "Analysis failed. Please try again." };
    return NextResponse.json({ error: response.message }, { status: response.status });
  }
}
