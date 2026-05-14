"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/types/analysis";
import { TYPE_CONFIG, LAYER_LABELS } from "@/constants/dependencyGraph";

export function NodeDetailPanel({
  nodeId,
  nodes,
  edges,
  onClose,
}: {
  nodeId: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
}) {
  const node = useMemo(() => nodes.find((graphNode) => graphNode.id === nodeId), [nodes, nodeId]);

  const imports = useMemo(
    () =>
      edges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => nodes.find((graphNode) => graphNode.id === edge.target))
        .filter(Boolean) as GraphNode[],
    [edges, nodeId, nodes]
  );

  const importedBy = useMemo(
    () =>
      edges
        .filter((edge) => edge.target === nodeId)
        .map((edge) => nodes.find((graphNode) => graphNode.id === edge.source))
        .filter(Boolean) as GraphNode[],
    [edges, nodeId, nodes]
  );

  const cfg = node ? (TYPE_CONFIG[node.type] ?? TYPE_CONFIG.other) : null;

  return (
    <AnimatePresence>
      {node && cfg && (
        <motion.div
          key={nodeId}
          initial={{ opacity: 0, x: 16, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-3 right-3 w-63 z-20 bg-[oklch(0.10_0.014_260/96%)] backdrop-blur-lg border border-[oklch(1_0_0/9%)] rounded-[14px] p-3.5 pb-4 shadow-[0_12px_40px_oklch(0_0_0/50%),inset_0_1px_0_oklch(1_0_0/7%)]"
        >
          <div className="flex items-start justify-between mb-2.5 gap-2">
            <div className="min-w-0 flex-1">
              <span className="font-mono text-sm font-bold text-[oklch(0.93_0_0)] block break-all leading-[1.35]">
                {node.label}
              </span>
              <span className="text-[10px] text-[oklch(0.46_0.03_260)] break-all block mt-0.5 leading-[1.4]">
                {node.path}
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-[oklch(0.18_0.015_260)] border border-[oklch(1_0_0/8%)] cursor-pointer p-[4px_5px] rounded-[7px] shrink-0 flex items-center justify-center text-[oklch(0.50_0.03_260)] transition-[color,background] duration-150"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-1.25 flex-wrap mb-2.5">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.06em] py-0.75 px-2 rounded-[6px]"
              style={{
                color: cfg.color,
                background: `color-mix(in oklch, ${cfg.color} 14%, transparent)`,
                border: `1px solid color-mix(in oklch, ${cfg.color} 28%, transparent)`,
              }}
            >
              {cfg.label}
            </span>
            {node.isHotspot && (
              <span className="text-[9px] font-bold uppercase tracking-[0.06em] py-0.75 px-2 rounded-[6px] text-[oklch(0.72_0.18_52)] bg-[oklch(0.72_0.18_52/12%)] border border-[oklch(0.72_0.18_52/28%)]">
                🔥 Hotspot
              </span>
            )}
            {node.hasCircularDep && (
              <span className="text-[9px] font-bold uppercase tracking-[0.06em] py-0.75 px-2 rounded-[6px] text-[oklch(0.68_0.22_27)] bg-[oklch(0.68_0.22_27/12%)] border border-[oklch(0.68_0.22_27/28%)]">
                ↺ Circular
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { label: "Imports", value: node.outDegree },
              { label: "Imported by", value: node.inDegree },
              { label: "Layer", value: LAYER_LABELS[node.layer] ?? node.layer },
              { label: "Size", value: node.size > 1024 ? `${(node.size / 1024).toFixed(1)}K` : `${node.size}B` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[oklch(0.14_0.014_260)] rounded-lg p-[7px_10px] border border-[oklch(1_0_0/5%)]"
              >
                <span className="text-[9px] text-[oklch(0.44_0.03_260)] uppercase tracking-[0.06em] block mb-[3px]">
                  {label}
                </span>
                <span className="text-[13px] font-mono font-bold text-[oklch(0.87_0_0)] leading-none">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {imports.length > 0 && (
            <div className="mb-2.5">
              <span className="text-[9px] text-[oklch(0.44_0.03_260)] uppercase tracking-[0.06em] flex items-center gap-1 mb-[5px]">
                <ArrowUpRight className="w-2.5 h-2.5 text-[oklch(0.62_0.22_240)]" />
                Imports ({imports.length})
              </span>
              <div className="flex flex-col gap-0.75 max-h-24 overflow-y-auto">
                {imports.slice(0, 8).map((dep) => (
                  <span
                    key={dep.id}
                    className="text-[10px] font-mono text-[oklch(0.62_0.22_240)] bg-[oklch(0.62_0.22_240/8%)] rounded-[5px] px-[7px] py-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
                    title={dep.path}
                  >
                    {dep.label}
                  </span>
                ))}
                {imports.length > 8 && (
                  <span className="text-[9px] text-[oklch(0.44_0.03_260)] pl-[5px]">
                    +{imports.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {importedBy.length > 0 && (
            <div>
              <span className="text-[9px] text-[oklch(0.44_0.03_260)] uppercase tracking-[0.06em] flex items-center gap-1 mb-[5px]">
                <ArrowDownLeft className="w-2.5 h-2.5 text-[oklch(0.55_0.18_280)]" />
                Imported by ({importedBy.length})
              </span>
              <div className="flex flex-col gap-0.75 max-h-24 overflow-y-auto">
                {importedBy.slice(0, 8).map((dep) => (
                  <span
                    key={dep.id}
                    className="text-[10px] font-mono text-[oklch(0.55_0.18_280)] bg-[oklch(0.55_0.18_280/8%)] rounded-[5px] px-[7px] py-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
                    title={dep.path}
                  >
                    {dep.label}
                  </span>
                ))}
                {importedBy.length > 8 && (
                  <span className="text-[9px] text-[oklch(0.44_0.03_260)] pl-[5px]">
                    +{importedBy.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
