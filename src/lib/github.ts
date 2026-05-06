import { z } from "zod";

export const repoUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .refine(
    (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+/.test(url),
    "Must be a public GitHub repository URL (e.g. https://github.com/owner/repo)"
  );

export type RepoMeta = {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  size: number;
  defaultBranch: string;
  topics: string[];
};

export type FileNode = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};

export type IngestionResult = {
  meta: RepoMeta;
  tree: FileNode[];
  languages: Record<string, number>;
};

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
