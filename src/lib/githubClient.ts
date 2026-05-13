import { GITHUB_API } from "@/constants/github";

export async function githubFetch(path: string) {
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

export async function fetchFileContent(
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

export async function fetchSourceFiles(
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
      batch.map((filePath) => fetchFileContent(owner, repo, filePath, branch))
    );
    results.forEach((result, idx) => {
      if (result.status === "fulfilled" && result.value) {
        contents.set(batch[idx], result.value);
      }
    });
  }

  return contents;
}
