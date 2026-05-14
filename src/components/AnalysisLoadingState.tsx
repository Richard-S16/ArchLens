"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle, BrainCircuit } from "lucide-react";

const STEPS = [
  { id: "patterns", label: "Analyzing architectural patterns" },
  { id: "debt", label: "Detecting technical debt" },
  { id: "scores", label: "Calculating health scores" },
  { id: "recommendations", label: "Generating recommendations" },
];

const STEP_DURATION = 1900;

export function AnalysisLoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;
    const timer = setTimeout(() => setCurrentStep((prev) => prev + 1), STEP_DURATION);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 py-6 px-2"
      role="status"
      aria-live="polite"
      aria-label="AI analysis in progress"
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" aria-hidden="true">
          <div className="w-10 h-10 rounded-full border-2 border-(--al-blue)/20 border-t-(--al-blue) animate-spin" />
          <BrainCircuit className="absolute inset-0 m-auto w-4 h-4 text-(--al-blue)" />
          <div className="absolute inset-0 rounded-full bg-(--al-blue)/5 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Running AI analysis…</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Powered by AI: step {Math.min(currentStep + 1, STEPS.length)} of {STEPS.length}
          </p>
        </div>

        <div className="ml-auto flex gap-1" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-500"
              style={{
                height: i === currentStep ? "14px" : "6px",
                background:
                  i < currentStep
                    ? "oklch(0.65 0.18 160)"
                    : i === currentStep
                    ? "var(--al-blue)"
                    : "oklch(0.25 0.02 260)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3" role="list">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-center gap-3"
              role="listitem"
            >
              <span aria-hidden="true">
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="flex"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </motion.span>
                  ) : isActive ? (
                    <motion.span key="active" className="flex">
                      <Loader2 className="w-4 h-4 text-(--al-blue) animate-spin shrink-0" />
                    </motion.span>
                  ) : (
                    <motion.span key="pending" className="flex">
                      <Circle className="w-4 h-4 text-border/40 shrink-0" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>

              <span
                className={`text-sm transition-all duration-300 ${
                  isDone
                    ? "text-muted-foreground/50 line-through decoration-muted-foreground/30"
                    : isActive
                    ? "text-foreground font-medium"
                    : isPending
                    ? "text-muted-foreground/35"
                    : ""
                }`}
              >
                {step.label}
              </span>

              <AnimatePresence>
                {isDone && (
                  <motion.span
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="ml-auto text-[10px] text-emerald-400 font-mono tracking-wide"
                    aria-label="completed"
                  >
                    done
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

