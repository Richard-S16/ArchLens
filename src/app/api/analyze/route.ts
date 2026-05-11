import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GITHUB_API } from "@/properties/github";
import { analyzeRepository } from "@/lib/analyzer";
import type { FileNode } from "@/lib/github";

const bodySchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  branch: z.string().optional(),
});

async function githubFetch(path: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<string | null> {
  try {
    const url = `/repos/${owner}/${repo}/contents/${path}${branch ? `?ref=${branch}` : ""}`;
    const data = await githubFetch(url);
    if (data.encoding === "base64" && typeof data.content === "string") {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchSourceFiles(
  owner: string,
  repo: string,
  paths: string[],
  branch?: string
): Promise<Map<string, string>> {
  const contents = new Map<string, string>();
  const BATCH_SIZE = 10;

  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((p) => fetchFileContent(owner, repo, p, branch))
    );
    results.forEach((result, idx) => {
      if (result.status === "fulfilled" && result.value) {
        contents.set(batch[idx], result.value);
      }
    });
  }

  return contents;
}

function selectFilesToFetch(tree: FileNode[]): string[] {
  const blobs = tree.filter((n) => n.type === "blob");

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

  const sourceFiles = blobs.filter((n) => {
    const lower = n.path.toLowerCase();
    if (SKIP_PATTERNS.some((p) => lower.includes(p))) return false;
    return SOURCE_EXTS.some((ext) => lower.endsWith(ext));
  });

  const scored = sourceFiles.map((n) => {
    let score = 0;
    const lower = n.path.toLowerCase();
    const depth = (n.path.match(/\//g) ?? []).length;

    if (depth <= 2) score += 10;
    if (depth <= 4) score += 5;

    if (lower.includes("index.")) score += 8;
    if (lower.includes("/store") || lower.includes("slice")) score += 6;
    if (lower.includes("/hooks/") || lower.includes("/hook/")) score += 5;
    if (lower.includes("/components/")) score += 4;
    if (lower.includes("/app/") || lower.includes("/pages/")) score += 4;
    if (lower.includes("/lib/") || lower.includes("/utils/")) score += 4;
    if (lower.includes("/api/")) score += 3;

    return { node: n, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 60).map((s) => s.node.path);
}


export async function POST(request: NextRequest) {
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
    const [repoData, langsData, treeData] = await Promise.all([
      githubFetch(`/repos/${owner}/${repo}`),
      githubFetch(`/repos/${owner}/${repo}/languages`),
      githubFetch(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`),
    ]);

    const tree: FileNode[] = (
      (treeData.tree ?? []) as Array<{ path: string; type: string; size?: number }>
    )
      .filter((n) => n.type === "blob" || n.type === "tree")
      .slice(0, 2000)
      .map((n) => ({ path: n.path, type: n.type as "blob" | "tree", size: n.size }));

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

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("404")) {
      return NextResponse.json(
        { error: "Repository not found or is private" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
