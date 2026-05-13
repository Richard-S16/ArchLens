"use client";

import { type NodeProps } from "@xyflow/react";
import type { LabelNode } from "@/types/graph";

export function LayerLabelNode({ data }: NodeProps<LabelNode>) {
  return (
    <div
      style={{
        pointerEvents: "none",
        userSelect: "none",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: data.color,
        opacity: 0.45,
        fontFamily: "var(--font-geist-mono, monospace)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: data.color,
          opacity: 0.6,
        }}
      />
      {data.label} Layer
    </div>
  );
}
