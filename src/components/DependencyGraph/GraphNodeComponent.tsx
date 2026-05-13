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
      style={{
        width: NODE_W,
        height: NODE_H,
        background: dimmed
          ? "oklch(0.115 0.012 260)"
          : `color-mix(in oklch, ${cfg.color} 9%, oklch(0.13 0.015 260))`,
        border: `1px solid ${borderColor}`,
        borderRadius: 11,
        opacity: dimmed ? 0.22 : 1,
        boxShadow: glowShadow,
        transition: "opacity 0.25s, box-shadow 0.25s, border-color 0.25s",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "9px 11px 8px",
        gap: 5,
        backdropFilter: "blur(4px)",
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

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-geist-mono, monospace)",
            fontWeight: 600,
            color: dimmed ? "oklch(0.38 0.02 260)" : "oklch(0.92 0 0)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 128,
            lineHeight: 1.3,
          }}
          title={node.path}
        >
          {node.label}
        </span>
        <div style={{ display: "flex", gap: 3, flexShrink: 0, marginTop: 1 }}>
          {node.isHotspot && (
            <span style={{ fontSize: 9 }} title="Dependency hotspot">🔥</span>
          )}
          {node.hasCircularDep && (
            <span
              style={{
                fontSize: 9,
                color: "oklch(0.68 0.22 27)",
                fontWeight: 800,
                fontFamily: "monospace",
              }}
              title="Circular dependency"
            >
              ↺
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "2px 6px",
            borderRadius: 4,
            color: dimmed ? "oklch(0.38 0.02 260)" : cfg.color,
            background: dimmed
              ? "oklch(0.17 0.01 260)"
              : `color-mix(in oklch, ${cfg.color} 14%, transparent)`,
            lineHeight: 1.5,
          }}
        >
          {cfg.label}
        </span>
        <div
          style={{
            fontSize: 9,
            fontFamily: "var(--font-geist-mono, monospace)",
            color: dimmed ? "oklch(0.32 0.02 260)" : "oklch(0.48 0.04 260)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span title="Imported by">↓{node.inDegree}</span>
          <span title="Imports">↑{node.outDegree}</span>
        </div>
      </div>
    </div>
  );
}
