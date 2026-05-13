import type { GraphNode } from "@/types/analysis";
import { LAYER_ORDER, NODE_W, NODE_H, H_GAP, V_GAP, ROW_GAP, NODES_PER_ROW } from "@/constants/dependencyGraph";

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

    layerNodes.sort((nodeA, nodeB) => {
      if (nodeA.isHotspot !== nodeB.isHotspot) return nodeA.isHotspot ? -1 : 1;
      if (nodeA.hasCircularDep !== nodeB.hasCircularDep) return nodeA.hasCircularDep ? -1 : 1;
      return nodeB.inDegree + nodeB.outDegree - (nodeA.inDegree + nodeA.outDegree);
    });

    const rowCount = Math.ceil(layerNodes.length / NODES_PER_ROW);

    for (let row = 0; row < rowCount; row++) {
      const rowNodes = layerNodes.slice(row * NODES_PER_ROW, (row + 1) * NODES_PER_ROW);
      const rowW = rowNodes.length * (NODE_W + H_GAP) - H_GAP;
      rowNodes.forEach((node, colIndex) => {
        positions[node.id] = {
          x: -rowW / 2 + colIndex * (NODE_W + H_GAP),
          y: currentY + row * (NODE_H + ROW_GAP),
        };
      });
    }

    currentY += rowCount * (NODE_H + ROW_GAP) + V_GAP;
  }

  return positions;
}
