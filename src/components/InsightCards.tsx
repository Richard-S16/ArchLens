"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  FileCode,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArchitectureInsight, InsightVariant, InsightCategory } from "@/types/analysis";

const VARIANT_CONFIG: Record<
  InsightVariant,
  { icon: React.ElementType; border: string; glow: string; badge: string; iconColor: string }
> = {
  danger: {
    icon: AlertCircle,
    border: "border-red-500/25",
    glow: "shadow-red-900/20",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
    iconColor: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/25",
    glow: "shadow-amber-900/20",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    iconColor: "text-amber-400",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/25",
    glow: "shadow-emerald-900/20",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    iconColor: "text-emerald-400",
  },
  info: {
    icon: Info,
    border: "border-(--al-blue)/25",
    glow: "shadow-(--al-blue)/10",
    badge: "bg-(--al-blue)/15 text-(--al-blue) border-(--al-blue)/25",
    iconColor: "text-(--al-blue)",
  },
};

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  coupling: "Coupling",
  performance: "Performance",
  maintainability: "Maintainability",
  scalability: "Scalability",
  structure: "Structure",
  dependencies: "Dependencies",
  architecture: "Architecture",
};

const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function InsightCard({
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
          {insight.affectedFiles.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-(--al-surface-elevated) text-muted-foreground border border-border/30"
            >
              <FileCode className="w-2.5 h-2.5" />
              {f.split("/").pop()}
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
