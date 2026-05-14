import { NextRequest, NextResponse } from "next/server";
import { repoUrlSchema, parseRepoUrl } from "@/lib/github";
import type { IngestionResult, FileNode } from "@/types/github";
import { githubFetch } from "@/lib/githubClient";
import { checkRateLimit, extractClientIP } from "@/lib/rateLimiter";

const MAX_BODY_BYTES = 2048;

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

  const parsed = repoUrlSchema.safeParse((body as { url?: unknown; })?.url);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 422 }
    );
  }

  const { owner, repo } = parseRepoUrl(parsed.data);

  try {
    const encodedOwner = encodeURIComponent(owner);
    const encodedRepo = encodeURIComponent(repo);

    const [repoData, langsData, treeData] = await Promise.all([
      githubFetch(`/repos/${encodedOwner}/${encodedRepo}`),
      githubFetch(`/repos/${encodedOwner}/${encodedRepo}/languages`),
      githubFetch(
        `/repos/${encodedOwner}/${encodedRepo}/git/trees/HEAD?recursive=1`
      ),
    ]);

    const tree: FileNode[] = (
      (treeData.tree ?? []) as Array<{ path: string; type: string; size?: number; }>
    )
      .filter((node) => node.type === "blob" || node.type === "tree")
      .slice(0, 2000)
      .map((node) => ({ path: node.path, type: node.type as "blob" | "tree", size: node.size }));

    const result: IngestionResult = {
      meta: {
        owner: repoData.owner.login,
        repo: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description ?? null,
        language: repoData.language ?? null,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        size: repoData.size,
        defaultBranch: repoData.default_branch,
        topics: repoData.topics ?? [],
      },
      tree,
      languages: langsData,
    };

    return NextResponse.json(result);
  } catch (err) {
    const code = err instanceof Error ? err.message : "GITHUB_API_ERROR";
    const clientErrors: Record<string, { status: number; message: string }> = {
      NOT_FOUND: { status: 404, message: "Repository not found or is private" },
      FORBIDDEN: { status: 403, message: "Access denied to repository" },
      RATE_LIMITED: { status: 429, message: "GitHub rate limit reached. Try again later." },
    };
    const response = clientErrors[code] ?? { status: 500, message: "Ingestion failed. Please try again." };
    return NextResponse.json({ error: response.message }, { status: response.status });
  }
}
