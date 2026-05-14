"use client";

import { motion } from "framer-motion";
import {
  Network,
  ArrowUpRight,
  CircleDot,
  GitMerge,
  Flame,
  Layers,
  FileStack,
  TestTube2,
  Package,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/types/analysis";

type Props = {
  result: AnalysisResult;
};

function StatItem({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: "blue" | "red" | "amber" | "emerald" | "purple";
  delay?: number;
}) {
  const colors = {
    blue: "text-(--al-blue)",
    red: "text-red-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    purple: "text-(--al-purple)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay ?? 0 }}
      className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 ${accent ? colors[accent] : ""}`} />
        {label}
      </span>
      <span
        className={`text-sm font-mono font-semibold ${
          accent ? colors[accent] : "text-foreground/80"
        }`}
      >
        {value}
      </span>
    </motion.div>
  );
}

function MiniGraphPreview({ nodeCount }: { nodeCount: number }) {
  const count = Math.min(nodeCount, 24);
  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    const r = 28 + ((i * 7) % 18);
    return {
      x: 56 + r * Math.cos(angle),
      y: 56 + r * Math.sin(angle),
      size: i < 3 ? 4 : 2.5,
      isHub: i < 3,
    };
  });

  const edges: [number, number][] = [];
  for (let i = 0; i < Math.min(count - 1, 18); i++) {
    edges.push([i, (i + 1) % count]);
    if (i % 3 === 0 && i + 4 < count) edges.push([i, i + 4]);
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/30 bg-(--al-surface-elevated)/40 aspect-square w-full max-w-28">
      <svg
        viewBox="0 0 112 112"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 6px oklch(0.62 0.22 240 / 20%))" }}
      >
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a]?.x}
            y1={nodes[a]?.y}
            x2={nodes[b]?.x}
            y2={nodes[b]?.y}
            stroke="oklch(0.62 0.22 240 / 30%)"
            strokeWidth="0.8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.02 }}
          />
        ))}

        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill={
              node.isHub
                ? "oklch(0.62 0.22 240)"
                : "oklch(0.55 0.18 280 / 70%)"
            }
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.4 + i * 0.03,
              type: "spring",
              stiffness: 200,
            }}
          />
        ))}
      </svg>


    </div>
  );
}

export function DependencyGraphSummary({ result }: Props) {
  const { graph, metadata } = result;
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;
  const hotspotCount = metadata.hotspots.length;
  const circularCount = metadata.circularDependencies.length;

  const PATTERN_LABEL: Record<string, string> = {
    "feature-based": "Feature-Based",
    "layer-based": "Layer-Based",
    atomic: "Atomic Design",
    mixed: "Mixed",
    flat: "Flat",
    unknown: "Unknown",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Graph Statistics
        </p>

        <StatItem
          icon={CircleDot}
          label="Dependency Nodes"
          value={nodeCount.toLocaleString()}
          accent="blue"
          delay={0.05}
        />
        <StatItem
          icon={Network}
          label="Dependency Edges"
          value={edgeCount.toLocaleString()}
          accent="purple"
          delay={0.1}
        />
        <StatItem
          icon={Flame}
          label="Hotspot Files"
          value={hotspotCount}
          accent={hotspotCount > 5 ? "amber" : "emerald"}
          delay={0.15}
        />
        <StatItem
          icon={GitMerge}
          label="Circular Dependencies"
          value={circularCount}
          accent={circularCount > 0 ? "red" : "emerald"}
          delay={0.2}
        />
        <StatItem
          icon={Layers}
          label="Architecture Pattern"
          value={PATTERN_LABEL[metadata.architecturePattern] ?? "Unknown"}
          delay={0.25}
        />
        <StatItem
          icon={FileStack}
          label="Source Files"
          value={metadata.sourceFiles.toLocaleString()}
          delay={0.3}
        />
        <StatItem
          icon={TestTube2}
          label="Test Files"
          value={metadata.testFiles.toLocaleString()}
          accent={metadata.testFiles > 0 ? "emerald" : "amber"}
          delay={0.35}
        />
        <StatItem
          icon={ArrowUpRight}
          label="Dynamic Imports"
          value={metadata.dynamicImportCount}
          accent={metadata.dynamicImportCount > 0 ? "emerald" : undefined}
          delay={0.4}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <MiniGraphPreview nodeCount={nodeCount} />
          <div className="flex-1 pt-1">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-mono mb-1">
              Parsed Files
            </p>
            <p className="text-2xl font-bold text-foreground/90">
              {result.parsedFileCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              of {metadata.totalFiles} total
            </p>
          </div>
        </div>

        {metadata.techStack.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Package className="w-3 h-3" />
              Detected Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {metadata.techStack.map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 + i * 0.04 }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border/40 bg-(--al-surface-elevated)/60 text-muted-foreground hover:text-foreground hover:border-(--al-blue)/30 transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {metadata.hotspots.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              Hotspot Files
            </p>
            <div className="space-y-1">
              {metadata.hotspots.slice(0, 5).map((hotspot, index) => (
                <motion.div
                  key={hotspot.path}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between text-[11px] font-mono"
                >
                  <span className="text-muted-foreground truncate max-w-40 flex items-center gap-1">
                    <Code2 className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    {hotspot.path.split("/").pop()}
                  </span>
                  <span className="text-amber-400/80 shrink-0 ml-2">
                    ↑{hotspot.inDegree}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
