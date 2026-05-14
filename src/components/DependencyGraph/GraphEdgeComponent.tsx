"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { RFEdge } from "@/types/graph";

export function GraphEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<RFEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const dimmed = data?.dimmed ?? false;
  const edgeType = data?.edgeType ?? "static";

  const strokeColor = dimmed
    ? "oklch(0.28 0.01 260 / 18%)"
    : edgeType === "dynamic"
    ? "oklch(0.55 0.18 280 / 55%)"
    : edgeType === "reexport"
    ? "oklch(0.60 0.14 165 / 55%)"
    : "oklch(0.62 0.22 240 / 50%)";

  const particleColor =
    edgeType === "dynamic"
      ? "oklch(0.65 0.20 290)"
      : edgeType === "reexport"
      ? "oklch(0.65 0.16 170)"
      : "oklch(0.72 0.22 235)";

  const strokeDash =
    edgeType === "dynamic" ? "5 3" : edgeType === "reexport" ? "2 2" : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={dimmed ? undefined : markerEnd}
        interactionWidth={0}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 1.2,
          strokeDasharray: strokeDash,
          transition: "stroke 0.2s, stroke-width 0.2s",
        }}
      />
      {!dimmed && (
        <circle r="2.8" fill={particleColor} opacity="0.85" style={{ filter: `drop-shadow(0 0 3px ${particleColor})` }}>
          <animateMotion
            dur={`${1.8 + ((id.charCodeAt(0) ?? 0) % 12) / 10}s`}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
}
