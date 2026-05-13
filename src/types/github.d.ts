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
