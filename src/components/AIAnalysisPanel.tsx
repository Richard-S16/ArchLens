"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AIAnalysis, AIRecommendation } from "@/types/analysis";
import { container, item } from "@/constants/animations";

const ASSESSMENT_CONFIG = {
  excellent: {
    label: "Excellent Architecture",
    color: "oklch(0.72 0.17 160)",
    bg: "oklch(0.72 0.17 160 / 10%)",
    border: "oklch(0.72 0.17 160 / 25%)",
    icon: CheckCircle2,
  },
  good: {
    label: "Good Architecture",
    color: "oklch(0.70 0.17 200)",
    bg: "oklch(0.70 0.17 200 / 10%)",
    border: "oklch(0.70 0.17 200 / 25%)",
    icon: TrendingUp,
  },
  "needs-work": {
    label: "Needs Improvement",
    color: "oklch(0.72 0.18 52)",
    bg: "oklch(0.72 0.18 52 / 10%)",
    border: "oklch(0.72 0.18 52 / 25%)",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical Issues",
    color: "oklch(0.68 0.22 27)",
    bg: "oklch(0.68 0.22 27 / 10%)",
    border: "oklch(0.68 0.22 27 / 25%)",
    icon: AlertTriangle,
  },
};

const PRIORITY_CONFIG = {
  high: { label: "High", color: "oklch(0.68 0.22 27)", dotColor: "bg-red-500" },
  medium: { label: "Medium", color: "oklch(0.72 0.18 52)", dotColor: "bg-orange-400" },
  low: { label: "Low", color: "oklch(0.70 0.17 200)", dotColor: "bg-sky-400" },
};

const EFFORT_IMPACT_CONFIG = {
  low: { label: "Low", bars: 1 },
  medium: { label: "Med", bars: 2 },
  high: { label: "High", bars: 3 },
};

function EffortImpactBar({ level, color }: { level: "low" | "medium" | "high"; color: string }) {
  const cfg = EFFORT_IMPACT_CONFIG[level];
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className="w-1 h-2.5 rounded-sm transition-colors"
          style={{
            background: bar <= cfg.bars ? color : "oklch(0.25 0.02 260)",
          }}
        />
      ))}
    </div>
  );
}

function RecommendationCard({
  rec,
  index,
}: {
  rec: AIRecommendation;
  index: number;
}) {
  const priorityCfg = PRIORITY_CONFIG[rec.priority];

  return (
    <motion.div
      variants={item}
      className="group relative flex gap-4 p-4 rounded-xl border bg-[oklch(0.11_0.014_260/60%)] border-[oklch(1_0_0/8%)] transition-all duration-300"
      whileHover={{ borderColor: `${priorityCfg.color}40`, scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold font-mono border"
          style={{
            background: `${priorityCfg.color}18`,
            borderColor: `${priorityCfg.color}35`,
            color: priorityCfg.color,
          }}
        >
          {index + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground leading-tight">{rec.title}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: `${priorityCfg.color}18`,
                color: priorityCfg.color,
                border: `1px solid ${priorityCfg.color}35`,
              }}
            >
              {priorityCfg.label} Priority
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{rec.rationale}</p>

        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/70 font-mono">
              Effort
            </span>
            <EffortImpactBar level={rec.effort} color="oklch(0.52 0.03 260)" />
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              {EFFORT_IMPACT_CONFIG[rec.effort].label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/70 font-mono">
              Impact
            </span>
            <EffortImpactBar level={rec.impact} color="oklch(0.55 0.18 280)" />
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              {EFFORT_IMPACT_CONFIG[rec.impact].label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AIAnalysisPanel({ aiAnalysis }: { aiAnalysis: AIAnalysis }) {
  const assessmentCfg = ASSESSMENT_CONFIG[aiAnalysis.overallAssessment];
  const AssessmentIcon = assessmentCfg.icon;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-xl border p-5"
        style={{
          background: `linear-gradient(135deg, ${assessmentCfg.bg}, oklch(0.11 0.014 260 / 80%))`,
          borderColor: assessmentCfg.border,
        }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, ${assessmentCfg.color} 0%, transparent 60%)`,
          }}
        />

        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: assessmentCfg.bg, border: `1px solid ${assessmentCfg.border}` }}
            >
              <AssessmentIcon className="w-4 h-4" style={{ color: assessmentCfg.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{assessmentCfg.label}</h3>
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wide">
                AI Analysis
              </p>
            </div>
          </div>

          <p className="text-sm text-foreground/85 leading-relaxed">
            {aiAnalysis.architectureSummary}
          </p>

          <div className="pt-1">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
              Technical Debt
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {aiAnalysis.technicalDebtAssessment}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          variants={item}
          className="rounded-xl border p-4 space-y-3 bg-[oklch(0.11_0.014_260/60%)] border-[oklch(0.72_0.17_160/20%)]"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center bg-[oklch(0.72_0.17_160/15%)]"
            >
              <CheckCircle2 className="w-3 h-3 text-[oklch(0.72_0.17_160)]" />
            </div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Strengths
            </h4>
          </div>
          <ul className="space-y-2">
            {aiAnalysis.keyStrengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div
                  className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-[oklch(0.72_0.17_160)]"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-xl border p-4 space-y-3 bg-[oklch(0.11_0.014_260/60%)] border-[oklch(0.68_0.22_27/20%)]"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center bg-[oklch(0.68_0.22_27/15%)]"
            >
              <AlertTriangle className="w-3 h-3 text-[oklch(0.68_0.22_27)]" />
            </div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Critical Risks
            </h4>
          </div>
          <ul className="space-y-2">
            {aiAnalysis.criticalRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div
                  className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-[oklch(0.68_0.22_27)]"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {aiAnalysis.recommendations.length > 0 && (
        <motion.div variants={item} className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[oklch(0.55_0.18_280)]" />
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Recommendations
            </h4>
            <ArrowUpRight className="w-3 h-3 text-muted-foreground/40" />
            <Badge
              className="text-[9px] px-1.5 py-0 font-mono bg-[oklch(0.55_0.18_280/15%)] text-[oklch(0.55_0.18_280)] border border-[oklch(0.55_0.18_280/30%)]"
            >
              {aiAnalysis.recommendations.length} actions
            </Badge>
          </div>
          <motion.div variants={container} className="space-y-2">
            {aiAnalysis.recommendations.map((rec, idx) => (
              <RecommendationCard key={rec.id} rec={rec} index={idx} />
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
