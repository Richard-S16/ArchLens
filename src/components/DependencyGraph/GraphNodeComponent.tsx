"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TYPE_CONFIG, NODE_W, NODE_H } from "@/constants/dependencyGraph";
import type { RFNode } from "@/types/graph";

export function GraphNodeComponent({ data, selected }: NodeProps<RFNode>) {
  const { node, dimmed, focused } = data;
  const cfg = TYPE_CONFIG[node.type] ?? TYPE_CONFIG.other;

  const isAlert = node.isHotspot || node.hasCircularDep;
  const alertColor = node.hasCircularDep ? "oklch(0.68 0.22 27)" : "oklch(0.72 0.18 52)";

  const borderColor = selected
    ? cfg.color
    : isAlert
    ? alertColor
    : dimmed
    ? "oklch(0.22 0.02 260)"
    : `color-mix(in oklch, ${cfg.color} 35%, transparent)`;

  const glowShadow = selected
    ? `0 0 22px color-mix(in oklch, ${cfg.color} 40%, transparent), inset 0 1px 0 oklch(1 0 0 / 6%)`
    : focused && !dimmed
    ? `0 0 14px color-mix(in oklch, ${cfg.color} 25%, transparent), inset 0 1px 0 oklch(1 0 0 / 6%)`
    : isAlert && !dimmed
    ? `0 0 16px color-mix(in oklch, ${alertColor} 30%, transparent), inset 0 1px 0 oklch(1 0 0 / 6%)`
    : "inset 0 1px 0 oklch(1 0 0 / 5%)";

  return (
    <div
      className="rounded-[11px] overflow-hidden flex flex-col pt-2.25 px-2.75 pb-2 gap-1.25 cursor-pointer backdrop-blur-sm transition-[opacity,box-shadow,border-color] duration-250"
      style={{
        width: NODE_W,
        height: NODE_H,
        background: dimmed
          ? "oklch(0.115 0.012 260)"
          : `color-mix(in oklch, ${cfg.color} 9%, oklch(0.13 0.015 260))`,
        border: `1px solid ${borderColor}`,
        opacity: dimmed ? 0.22 : 1,
        boxShadow: glowShadow,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 6, height: 6, top: -3 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 6, height: 6, bottom: -3 }}
      />

      <div className="flex items-start justify-between gap-1">
        <span
          className="text-[11px] font-mono font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-32 leading-[1.3]"
          style={{ color: dimmed ? "oklch(0.38 0.02 260)" : "oklch(0.92 0 0)" }}
          title={node.path}
        >
          {node.label}
        </span>
        <div className="flex gap-0.75 shrink-0 mt-px">
          {node.isHotspot && (
            <span className="text-[9px]" title="Dependency hotspot">🔥</span>
          )}
          {node.hasCircularDep && (
            <span
              className="text-[9px] font-extrabold font-mono"
              style={{ color: "oklch(0.68 0.22 27)" }}
              title="Circular dependency"
            >
              ↺
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-1">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.06em] py-0.5 px-1.5 rounded leading-normal"
          style={{
            color: dimmed ? "oklch(0.38 0.02 260)" : cfg.color,
            background: dimmed
              ? "oklch(0.17 0.01 260)"
              : `color-mix(in oklch, ${cfg.color} 14%, transparent)`,
          }}
        >
          {cfg.label}
        </span>
        <div
          className="text-[9px] font-mono flex items-center gap-1.25"
          style={{ color: dimmed ? "oklch(0.32 0.02 260)" : "oklch(0.48 0.04 260)" }}
        >
          <span title="Imported by">↓{node.inDegree}</span>
          <span title="Imports">↑{node.outDegree}</span>
        </div>
      </div>
    </div>
  );
}
