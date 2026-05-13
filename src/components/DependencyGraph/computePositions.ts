import type { GraphNode } from "@/types/analysis";
import { LAYER_ORDER, NODE_W, NODE_H, H_GAP, V_GAP, ROW_GAP, NODES_PER_ROW } from "./constants";

export function computePositions(
  nodes: GraphNode[]
): Record<string, { x: number; y: number }> {
  const byLayer: Partial<Record<string, GraphNode[]>> = {};

  for (const node of nodes) {
    const key = (LAYER_ORDER as string[]).includes(node.layer) ? node.layer : "other";
    if (!byLayer[key]) byLayer[key] = [];
    byLayer[key]!.push(node);
  }

  const positions: Record<string, { x: number; y: number }> = {};
  let currentY = 0;

  const allLayers = [...LAYER_ORDER, "other"];

  for (const layer of allLayers) {
    const layerNodes = byLayer[layer];
    if (!layerNodes?.length) continue;

    layerNodes.sort((a, b) => {
      if (a.isHotspot !== b.isHotspot) return a.isHotspot ? -1 : 1;
      if (a.hasCircularDep !== b.hasCircularDep) return a.hasCircularDep ? -1 : 1;
      return b.inDegree + b.outDegree - (a.inDegree + a.outDegree);
    });

    const rowCount = Math.ceil(layerNodes.length / NODES_PER_ROW);

    for (let row = 0; row < rowCount; row++) {
      const rowNodes = layerNodes.slice(row * NODES_PER_ROW, (row + 1) * NODES_PER_ROW);
      const rowW = rowNodes.length * (NODE_W + H_GAP) - H_GAP;
      rowNodes.forEach((node, i) => {
        positions[node.id] = {
          x: -rowW / 2 + i * (NODE_W + H_GAP),
          y: currentY + row * (NODE_H + ROW_GAP),
        };
      });
    }

    currentY += rowCount * (NODE_H + ROW_GAP) + V_GAP;
  }

  return positions;
}
