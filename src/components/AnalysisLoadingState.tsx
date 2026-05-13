"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

export function AnalysisLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4 py-10"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-(--al-blue)/20 border-t-(--al-blue) animate-spin" />
        <BrainCircuit className="absolute inset-0 m-auto w-5 h-5 text-(--al-blue)" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm text-foreground/80 font-medium">Parsing architecture…</p>
        <p className="text-xs text-muted-foreground">
          Fetching source files, resolving dependencies, building graph
        </p>
      </div>
      <div className="w-full max-w-md space-y-2 mt-2">
        {[80, 60, 72, 50].map((width, index) => (
          <div
            key={index}
            className="h-2 rounded-full bg-(--al-surface-elevated) animate-pulse"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
