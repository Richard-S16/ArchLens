"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link2, Cpu, Sparkles } from "lucide-react";

const EASE_SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STEPS = [
  {
    icon: Link2,
    number: "01",
    title: "Paste a GitHub URL",
    desc: "Drop any public repository URL. ArchLens connects to GitHub and begins ingesting the codebase instantly.",
    color: "oklch(0.62 0.22 240)",
    glow: "oklch(0.62 0.22 240 / 15%)",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Parse & Map",
    desc: "Every file, module, and dependency is resolved. Architectural layers, coupling hotspots, and circular chains are surfaced automatically.",
    color: "oklch(0.55 0.18 280)",
    glow: "oklch(0.55 0.18 280 / 15%)",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Explore Intelligence",
    desc: "Interact with the live dependency graph, inspect architecture health scores, and get AI-generated recommendations.",
    color: "oklch(0.65 0.18 160)",
    glow: "oklch(0.65 0.18 160 / 15%)",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 py-16 max-w-5xl mx-auto w-full" aria-labelledby="how-it-works-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-sm font-mono tracking-widest text-muted-foreground/60 uppercase mb-3">
          How it works
        </p>
        <h2
          id="how-it-works-heading"
          className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight"
        >
          From URL to insight in seconds
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Three steps. No configuration. No account required.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div
          className="hidden md:block absolute top-11 left-[20%] right-[20%] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(1 0 0 / 8%), oklch(1 0 0 / 8%), transparent)",
          }}
          aria-hidden="true"
        />

        {STEPS.map(({ icon: Icon, number, title, desc, color, glow }, i) => (
          <motion.div
            key={number}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: EASE_SPRING }}
            className="flex flex-col items-center text-center gap-5"
          >
            <div className="relative z-10">
              <div
                className="w-22 h-22 rounded-2xl border border-border/50 flex items-center justify-center transition-all duration-300 hover:border-opacity-70 hover:scale-105"
                style={{
                  background: `radial-gradient(circle at center, ${glow}, oklch(0.13 0.015 260))`,
                  boxShadow: `0 0 32px ${glow}`,
                }}
              >
                <Icon className="w-8 h-8" style={{ color }} aria-hidden="true" />
              </div>
              <span
                className="absolute -top-2 -right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-background"
                style={{ color, borderColor: `${color}40` }}
              >
                {number}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-50">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
