import { FileCode, FolderOpen } from "lucide-react";
import type { IngestionResult } from "@/types/github";

type Props = { tree: IngestionResult["tree"] };

export function FileTree({ tree }: Props) {
  const topLevel = tree
    .filter((node) => !node.path.includes("/"))
    .slice(0, 20);
  const fileCount = tree.filter((node) => node.type === "blob").length;
  const dirCount = tree.filter((node) => node.type === "tree").length;

  return (
    <div className="space-y-2">
      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><FileCode className="w-3.5 h-3.5" />{fileCount} files</span>
        <span className="flex items-center gap-1"><FolderOpen className="w-3.5 h-3.5" />{dirCount} directories</span>
      </div>
      <div className="font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        {topLevel.map((node) => (
          <div key={node.path} className="flex items-center gap-2 py-0.5 text-muted-foreground hover:text-foreground transition-colors">
            {node.type === "tree" ? (
              <FolderOpen className="w-3.5 h-3.5 text-(--al-blue) shrink-0" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            )}
            <span>{node.path}</span>
          </div>
        ))}
        {tree.length > 20 && (
          <p className="text-muted-foreground/50 pt-1">+{tree.length - 20} more…</p>
        )}
      </div>
    </div>
  );
}
