"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { RFEdge } from "@/types/graph";

export function GraphEdgeComponent({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: EdgeProps<RFEdge>) {
  const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 3 });
  return <BaseEdge id={id} path={path} markerEnd={data?.dimmed ? undefined : markerEnd} interactionWidth={0}
    className={`atlas-edge edge-${data?.edgeType ?? "static"} trace-${data?.dimmed ? "muted" : data?.direction ?? "base"}`} />;
}
