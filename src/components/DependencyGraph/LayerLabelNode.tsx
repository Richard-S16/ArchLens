"use client";

import { type NodeProps } from "@xyflow/react";
import type { LabelNode } from "@/types/graph";

export function LayerLabelNode({ data }: NodeProps<LabelNode>) {
  return (
    <div className="atlas-lane-label"><b>{data.code}</b> {data.label}</div>
  );
}
