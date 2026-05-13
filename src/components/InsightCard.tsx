"use client";

import { motion } from "framer-motion";
import { FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArchitectureInsight } from "@/types/analysis";
import { VARIANT_CONFIG, CATEGORY_LABELS } from "@/constants/insightCards";

export function InsightCard({
  insight,
  index,
}: {
  insight: ArchitectureInsight;
  index: number;
}) {
  const cfg = VARIANT_CONFIG[insight.variant];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
      className={`relative flex flex-col gap-3 p-4 rounded-xl border bg-(--al-surface) shadow-md ${cfg.border} ${cfg.glow} hover:border-opacity-50 transition-all duration-300 group`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${VARIANT_CONFIG[insight.variant].badge.replace("text-", "bg-").split(" ")[0]}`}
          style={{ background: "oklch(1 0 0 / 4%)" }}
        >
          <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={`text-[10px] px-1.5 py-0 font-mono ${cfg.badge}`}>
              {CATEGORY_LABELS[insight.category]}
            </Badge>
            {insight.metric && (
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                {insight.metric}
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {insight.title}
          </h4>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed pl-10">
        {insight.description}
      </p>

      {insight.affectedFiles && insight.affectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-10">
          {insight.affectedFiles.map((filePath) => (
            <span
              key={filePath}
              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-(--al-surface-elevated) text-muted-foreground border border-border/30"
            >
              <FileCode className="w-2.5 h-2.5" />
              {filePath.split("/").pop()}
            </span>
          ))}
        </div>
      )}

      <div
        className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-60 ${
          insight.severity === "high"
            ? "bg-red-400"
            : insight.severity === "medium"
            ? "bg-amber-400"
            : "bg-emerald-400"
        }`}
      />
    </motion.div>
  );
}
