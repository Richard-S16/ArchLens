"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { ArchitectureScores } from "@/types/analysis";
import { SCORE_META } from "@/constants/architectureScores";
import type { ScoreKey } from "@/constants/architectureScores";

function scoreColor(value: number): string {
  if (value >= 80) return "oklch(0.65 0.18 160)";
  if (value >= 60) return "oklch(0.62 0.22 240)";
  if (value >= 40) return "oklch(0.72 0.19 60)";
  return "oklch(0.65 0.22 27)";
}

function scoreGrade(value: number): string {
  if (value >= 85) return "A";
  if (value >= 70) return "B";
  if (value >= 55) return "C";
  if (value >= 40) return "D";
  return "F";
}

function ScoreGauge({
  value,
  label,
  description,
  delay = 0,
}: {
  value: number;
  label: string;
  description: string;
  delay?: number;
}) {
  const RADIUS = 38;
  const STROKE = 7;
  const circumference = 2 * Math.PI * RADIUS;

  const count = useMotionValue(0);
  const displayVal = useTransform(count, (v) => Math.round(v));
  const dashOffset = useTransform(
    count,
    (v) => circumference - (v / 100) * circumference
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.4,
      ease: "easeOut",
      delay,
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color = scoreColor(value);
  const grade = scoreGrade(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 group"
    >
      <div className="relative">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="oklch(1 0 0 / 6%)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
            className="drop-shadow-[0_0_6px_currentColor]"
          />
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <motion.span
            className="text-xl font-bold leading-none tabular-nums"
            style={{ color }}
          >
            {displayVal}
          </motion.span>
          <span
            className="text-[10px] font-bold mt-0.5 leading-none"
            style={{ color: `${color.replace(")", " / 60%)")}` }}
          >
            {grade}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-foreground/80">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug max-w-22.5">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

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
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
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
