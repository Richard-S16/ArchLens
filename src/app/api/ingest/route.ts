import { NextRequest, NextResponse } from "next/server";
import { repoUrlSchema, parseRepoUrl } from "@/lib/github";
import type { IngestionResult, FileNode } from "@/types/github";
import { GITHUB_API } from "@/properties/github";

async function githubFetch(path: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${path}`, { headers, next: { revalidate: 300 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
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
    const [repoData, langsData, treeData] = await Promise.all([
      githubFetch(`/repos/${owner}/${repo}`),
      githubFetch(`/repos/${owner}/${repo}/languages`),
      githubFetch(
        `/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
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
