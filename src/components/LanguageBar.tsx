import { cn } from "@/lib/utils";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  CSS: "bg-pink-500",
  HTML: "bg-red-500",
  SCSS: "bg-pink-400",
  Vue: "bg-emerald-500",
  Svelte: "bg-orange-400",
};

type Props = { languages: Record<string, number> };

export function LanguageBar({ languages }: Props) {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) return null;
  const entries = Object.entries(languages).sort(([, bytesA], [, bytesB]) => bytesB - bytesA);

  return (
    <div className="space-y-3">
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {entries.map(([lang, bytes]) => {
          const pct = (bytes / total) * 100;
          const color = LANG_COLORS[lang] ?? "bg-muted-foreground";
          return (
            <div
              key={lang}
              className={cn("h-full transition-all", color)}
              style={{ width: `${pct}%` }}
              title={`${lang} ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.slice(0, 8).map(([lang, bytes]) => {
          const pct = (bytes / total) * 100;
          const color = LANG_COLORS[lang] ?? "bg-muted-foreground";
          return (
            <div key={lang} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", color)} />
              <span>{lang}</span>
              <span className="text-muted-foreground/60">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
