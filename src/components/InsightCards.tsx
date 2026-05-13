"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Tag,
} from "lucide-react";
import type { ArchitectureInsight } from "@/types/analysis";
import { SEVERITY_ORDER } from "@/constants/insightCards";
import { InsightCard } from "@/components/InsightCard";

export function InsightCards({ insights }: { insights: ArchitectureInsight[] }) {
  const sorted = [...insights].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  const dangerCount = insights.filter((i) => i.variant === "danger").length;
  const warningCount = insights.filter((i) => i.variant === "warning").length;
  const successCount = insights.filter((i) => i.variant === "success").length;
  const infoCount = insights.filter((i) => i.variant === "info").length;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap"
      >
        <span className="flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </span>
        {dangerCount > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle className="w-3 h-3" /> {dangerCount} critical
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="w-3 h-3" /> {warningCount} warning{warningCount !== 1 ? "s" : ""}
          </span>
        )}
        {successCount > 0 && (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> {successCount} positive
          </span>
        )}
        {infoCount > 0 && (
          <span className="flex items-center gap-1 text-(--al-blue)">
            <Info className="w-3 h-3" /> {infoCount} info
          </span>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} index={i} />
        ))}
      </div>
    </div>
  );
}
