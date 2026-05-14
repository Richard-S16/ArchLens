"use client";

import { motion } from "framer-motion";
import type { ArchitectureScores } from "@/types/analysis";
import { SCORE_META } from "@/constants/architectureScores";
import type { ScoreKey } from "@/constants/architectureScores";
import { ScoreGauge, scoreColor, scoreGrade } from "@/components/ScoreGauge";

export function ArchitectureScores({ scores }: { scores: ArchitectureScores }) {
  const keys = Object.keys(SCORE_META) as ScoreKey[];
  const overall = Math.round(
    keys.reduce((sum, k) => sum + scores[k], 0) / keys.length
  );

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-(--al-surface-elevated)/50"
      >
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
            Overall Health
          </p>
          <p
            className="text-3xl font-bold mt-0.5"
            style={{ color: scoreColor(overall) }}
          >
            {overall}
            <span className="text-base font-normal text-muted-foreground ml-1">/ 100</span>
          </p>
        </div>

        <div className="flex-1 max-w-48 mx-6">
          <div className="h-1.5 rounded-full bg-(--al-surface-elevated) overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: scoreColor(overall) }}
              initial={{ width: 0 }}
              animate={{ width: `${overall}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1 font-mono">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        <div
          className="text-4xl font-black"
          style={{ color: scoreColor(overall) }}
        >
          {scoreGrade(overall)}
        </div>
      </motion.div>

      <div className="grid grid-cols-5 gap-4 justify-items-center">
        {keys.map((key, i) => (
          <ScoreGauge
            key={key}
            value={scores[key]}
            label={SCORE_META[key].label}
            description={SCORE_META[key].description}
            delay={0.15 + i * 0.1}
          />
        ))}
      </div>
    </div>
  );
}
