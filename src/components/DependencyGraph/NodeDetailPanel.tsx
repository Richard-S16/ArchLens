"use client";

import { ArrowUpRight, X } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/types/analysis";
import { TYPE_CONFIG, LAYER_LABELS } from "@/constants/dependencyGraph";

export function NodeDetailPanel({ node, nodes, edges, lane, onSelect, onClose }: {
  node?: GraphNode; nodes: GraphNode[]; edges: GraphEdge[]; lane?: string;
  onSelect: (id: string) => void; onClose: () => void;
}) {
  const connections = node ? [
    { label: "Imports", total: node.outDegree, ids: new Set(edges.filter((edge) => edge.source === node.id).map((edge) => edge.target)) },
    { label: "Imported by", total: node.inDegree, ids: new Set(edges.filter((edge) => edge.target === node.id).map((edge) => edge.source)) },
  ] : [];
  return <aside className="atlas-inspector" aria-label="Module details">
    <div className="atlas-inspector-title"><h2>Module details</h2>{node && <button className="atlas-small-button" onClick={onClose} aria-label="Clear module selection"><X size={16} /></button>}</div>
    {node ? <>
      <h3>{node.label}</h3>
      <code>{node.path}</code>
      <p><b>{lane}</b> {LAYER_LABELS[node.layer] ?? node.layer} · {TYPE_CONFIG[node.type].label}</p>
      <p>{node.size > 1024 ? `${(node.size / 1024).toFixed(1)} KB` : `${node.size} B`}{node.isHotspot && " · Hotspot"}{node.hasCircularDep && " · Cycle"}</p>
      {connections.map(({ label, ids, total }) => <section key={label}>
        <h4>{label} <span>{total}</span></h4>
        {ids.size > 0 ? <ul>{nodes.filter((entry) => ids.has(entry.id)).map((entry) => <li key={entry.id}><button onClick={() => onSelect(entry.id)} title={entry.path}>{entry.label}<ArrowUpRight size={13} /></button></li>)}</ul> : <p>{total ? "None visible on this map." : "None detected."}</p>}
      </section>)}
    </> : <p>Select a file on the map to see its direct connections.</p>}
  </aside>;
}
