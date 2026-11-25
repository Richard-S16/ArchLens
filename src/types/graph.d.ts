import type { Node, Edge } from "@xyflow/react";
import type { GraphNode } from "@/types/analysis";

export type NodeData = {
  node: GraphNode;
  dimmed: boolean;
  focused: boolean;
};

export type EdgeData = {
  edgeType: "static" | "dynamic" | "reexport";
  dimmed: boolean;
  direction?: "incoming" | "outgoing";
};

export type RFNode = Node<NodeData, "graphNode">;
export type RFEdge = Edge<EdgeData, "graphEdge">;

export type LabelNodeData = { label: string; code: string };
export type LabelNode = Node<LabelNodeData, "layerLabel">;
