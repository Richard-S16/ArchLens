"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TYPE_CONFIG, NODE_W, NODE_H } from "@/constants/dependencyGraph";
import type { RFNode } from "@/types/graph";

export function GraphNodeComponent({ data }: NodeProps<RFNode>) {
  const { node, dimmed, focused } = data;
  return (
    <div className="atlas-node" data-dimmed={dimmed} data-focused={focused} style={{ width: NODE_W, height: NODE_H }}>
      <Handle type="target" position={Position.Top} className="atlas-node-handle" isConnectable={false} />
      <Handle type="source" position={Position.Bottom} className="atlas-node-handle" isConnectable={false} />
      <strong title={node.path}>{node.label}</strong>
      <small>{TYPE_CONFIG[node.type].label}{node.hasCircularDep ? " · Cycle" : ""}{node.isHotspot ? " · Hotspot" : ""}</small>
    </div>
  );
}
