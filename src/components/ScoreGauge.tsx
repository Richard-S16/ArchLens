"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function scoreColor(value: number): string {
  if (value >= 80) return "oklch(0.65 0.18 160)";
  if (value >= 60) return "oklch(0.62 0.22 240)";
  if (value >= 40) return "oklch(0.72 0.19 60)";
  return "oklch(0.65 0.22 27)";
}

export function scoreGrade(value: number): string {
  if (value >= 85) return "A";
  if (value >= 70) return "B";
  if (value >= 55) return "C";
  if (value >= 40) return "D";
  return "F";
}

export function ScoreGauge({
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
  const displayVal = useTransform(count, (value) => Math.round(value));
  const dashOffset = useTransform(
    count,
    (value) => circumference - (value / 100) * circumference
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
