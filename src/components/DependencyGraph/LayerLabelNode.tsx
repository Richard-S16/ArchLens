"use client";

import { type NodeProps } from "@xyflow/react";
import type { LabelNode } from "@/types/graph";

export function LayerLabelNode({ data }: NodeProps<LabelNode>) {
  return (
    <div
      className="pointer-events-none select-none text-[10px] font-bold uppercase tracking-widest opacity-45 font-mono flex items-center gap-1.5 whitespace-nowrap"
      style={{ color: data.color }}
    >
      <span
        className="inline-block w-1 h-1 rounded-full opacity-60 shrink-0"
        style={{ background: data.color }}
      />
      {data.label} Layer
    </div>
  );
}
