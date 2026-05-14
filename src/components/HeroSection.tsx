"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const EASE_SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function HeroSection() {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-center"
      >
        <Badge className="bg-(--al-blue)/15 text-(--al-blue) border-(--al-blue)/25 px-4 py-1.5 text-sm font-mono tracking-widest flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--al-blue) opacity-70" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-(--al-blue)" />
          </span>
          AI-POWERED REPOSITORY INTELLIGENCE
        </Badge>
      </motion.div>

      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
        {(["Understand", "your"] as const).map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 48, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, delay: 0.08 + i * 0.08, ease: EASE_SPRING }}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
        <br />
        <motion.span
          initial={{ opacity: 0, y: 48, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: 0.24, ease: EASE_SPRING }}
          className="inline-block mr-[0.2em] bg-linear-to-r from-(--al-blue) to-(--al-purple) bg-clip-text text-transparent"
        >
          architecture
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 48, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: 0.34, ease: EASE_SPRING }}
          className="inline-block"
        >
          instantly.
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.44 }}
        className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
      >
        Paste a GitHub URL. ArchLens maps your repository structure,
        visualizes dependencies, and surfaces architectural insights in seconds.
      </motion.p>
    </div>
  );
}

