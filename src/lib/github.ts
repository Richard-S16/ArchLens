import { z } from "zod";

export const repoUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .refine(
    (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+/.test(url),
    "Must be a public GitHub repository URL (e.g. https://github.com/owner/repo)"
  );

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
