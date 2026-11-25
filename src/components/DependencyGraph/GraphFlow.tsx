"use client";

import {
  ReactFlow, Background, Controls, MiniMap, MarkerType, useNodesState, useReactFlow,
  BackgroundVariant, type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/types/analysis";
import { NODE_W, NODE_H, MAX_NODES, TYPE_CONFIG, LAYER_ORDER, LAYER_LABELS } from "@/constants/dependencyGraph";
import type { RFNode, RFEdge, LabelNode } from "@/types/graph";
import { computePositions } from "./computePositions";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { edgeTypes, nodeTypes } from "@/constants/graphFlow";

const layers = [...LAYER_ORDER, "other"];
const layerOf = (node: GraphNode) => layers.includes(node.layer) ? node.layer : "other";
const layerCode = (layer: string) => String.fromCharCode(65 + layers.indexOf(layer));
const edgeInk = { static: "#5d7269", dynamic: "#75568a", reexport: "#466c83", incoming: "#86491c", outgoing: "#235a45" };

export function GraphFlow({ graphNodes, graphEdges, visible }: { graphNodes: GraphNode[]; graphEdges: GraphEdge[]; visible: boolean }) {
  const [search, setSearch] = useState("");
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState(false);
  const [cycles, setCycles] = useState(false);
  const [legend, setLegend] = useState(false);
  const { fitView, setCenter, getZoom, getNode } = useReactFlow();
  const [canvasNodes, setNodes, onNodesChange] = useNodesState<RFNode | LabelNode>([]);

  const shown = useMemo(() => {
    const eligible = graphNodes.filter((node) => (!hotspots || node.isHotspot) && (!cycles || node.hasCircularDep));
    const displayed = eligible.length <= MAX_NODES ? eligible : eligible.sort((a, b) =>
      Number(b.isHotspot) - Number(a.isHotspot) ||
      Number(b.hasCircularDep) - Number(a.hasCircularDep) ||
      b.inDegree + b.outDegree - a.inDegree - a.outDegree
    ).slice(0, MAX_NODES);
    const ids = new Set(displayed.map((node) => node.id));
    return { nodes: displayed, edges: graphEdges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)), total: eligible.length };
  }, [graphNodes, graphEdges, hotspots, cycles]);
  const focused = shown.nodes.find((node) => node.id === focusedNodeId);
  const focusedId = focused?.id;
  const positions = useMemo(() => computePositions(shown.nodes), [shown.nodes]);
  const groups = useMemo(() => layers.map((layer) => ({
    layer, code: layerCode(layer), label: LAYER_LABELS[layer], nodes: shown.nodes.filter((node) => layerOf(node) === layer),
  })).filter((group) => group.nodes.length), [shown.nodes]);

  useEffect(() => {
    setNodes([
      ...shown.nodes.map((node): RFNode => ({
        id: node.id, type: "graphNode", position: positions[node.id], data: { node, dimmed: false, focused: false },
        ariaLabel: node.path,
      })),
      ...groups.map(({ layer, label, code, nodes }): LabelNode => ({
        id: `__label__${layer}`, type: "layerLabel", draggable: false, selectable: false, focusable: false,
        position: { x: -NODE_W / 2, y: Math.min(...nodes.map((node) => positions[node.id].y)) - 32 },
        data: { label, code },
      })),
    ]);
  }, [groups, positions, setNodes, shown.nodes]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => void fitView({ padding: 0.14 }), 80);
    return () => clearTimeout(timer);
  }, [visible, positions, fitView]);

  const onChange = useCallback((changes: NodeChange<RFNode | LabelNode>[]) => {
    const selected = changes.find((change) => change.type === "select" && change.selected);
    if (selected?.type === "select") setFocusedNodeId(selected.id);
    onNodesChange(changes.filter((change) => change.type !== "select"));
  }, [onNodesChange]);

  const { nodes, edges, matches } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const neighbors = new Set([focusedId]);
    const edges = shown.edges.map((edge): RFEdge => {
      const direction = focusedId === edge.source ? "outgoing" : focusedId === edge.target ? "incoming" : undefined;
      if (direction) {
        neighbors.add(edge.source);
        neighbors.add(edge.target);
      }
      return {
        id: edge.id, source: edge.source, target: edge.target, type: "graphEdge",
        data: { edgeType: edge.type, dimmed: !!focusedId && !direction, direction },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeInk[direction ?? edge.type], width: 12, height: 12 },
        zIndex: direction ? 1 : 0,
      };
    });
    const matches: GraphNode[] = [];
    const nodes = canvasNodes.map((entry) => {
      if (entry.type !== "graphNode") return entry;
      const match = !query || entry.data.node.path.toLowerCase().includes(query) || entry.data.node.label.toLowerCase().includes(query);
      if (match && query) matches.push(entry.data.node);
      return {
        ...entry, selected: entry.id === focusedId,
        data: { ...entry.data, focused: entry.id === focusedId, dimmed: focusedId ? !neighbors.has(entry.id) : !match },
      };
    });
    return { nodes, edges, matches };
  }, [canvasNodes, focusedId, search, shown.edges]);

  const types = new Set(shown.nodes.map((node) => node.type));
  function locate(id: string) {
    setFocusedNodeId(id);
    setSearch("");
    const position = getNode(id)?.position ?? positions[id];
    if (position) void setCenter(position.x + NODE_W / 2, position.y + NODE_H / 2, { zoom: Math.max(0.95, getZoom()) });
  }
  return (
    <div className="atlas-graph">
      <aside className="atlas-layer-index" aria-label="Layer index">
        <h2>Layer index</h2>
        {groups.map(({ layer, label, code, nodes }) => <div key={layer}><b>{code}</b><span>{label}</span><code>{nodes.length}</code></div>)}
      </aside>
      <div className="atlas-map-main">
        <div className="atlas-tools">
          <label className="atlas-search"><Search size={16} /><input type="search" aria-label="Search files" placeholder="Search files" value={search} onChange={(event) => setSearch(event.target.value)} />
            {search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}
          </label>
          <label><input type="checkbox" checked={hotspots} onChange={(event) => setHotspots(event.target.checked)} /> Hotspots</label>
          <label><input type="checkbox" checked={cycles} onChange={(event) => setCycles(event.target.checked)} /> Cycles</label>
          <button className="atlas-small-button" aria-expanded={legend} aria-controls="atlas-graph-legend" onClick={() => setLegend(!legend)}>Legend</button>
        </div>
        <div id="atlas-graph-legend" className="atlas-legend" hidden={!legend}>
          <span>Import types:</span> <span>Static · solid</span><span>Dynamic · dashed</span><span>Re-export · dotted</span>
          {types.size > 0 && <span>Files: {[...types].map((type) => TYPE_CONFIG[type].label).join(", ")}</span>}
        </div>
        {search.trim() && <div className="atlas-search-matches" aria-label="Matching files">
          {matches.length ? matches.slice(0, 6).map((node) => <button key={node.id} onClick={() => locate(node.id)} title={node.path}><code>{node.path}</code><ArrowUpRight size={14} /></button>) : <p>No matching files on this map.</p>}
          {matches.length > 6 && <p>Showing 6 of {matches.length} matches. Refine the search to see more.</p>}
        </div>}
        <div className="atlas-canvas">
          <ReactFlow<RFNode | LabelNode, RFEdge>
            nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            onNodesChange={onChange}
            onNodeClick={(_, node) => { if (node.type === "graphNode") setFocusedNodeId(node.id); }}
            onPaneClick={() => setFocusedNodeId(null)}
            fitView fitViewOptions={{ padding: 0.14 }} minZoom={0.05} maxZoom={2.5}
            deleteKeyCode={null} edgesFocusable={false} colorMode="light"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#b9c7b7" />
            <Controls position="bottom-left" />
            <MiniMap position="bottom-right" nodeColor={(node) => node.type === "layerLabel" ? "transparent" : "#669080"} maskColor="#dce7ddaa" pannable zoomable />
          </ReactFlow>
          {!shown.nodes.length && <p className="atlas-map-message" role="status">{graphNodes.length ? "No files match the active filters." : "No dependency files were found."}</p>}
        </div>
        <div className="atlas-map-foot">
          <div className="atlas-trace-key"><span>Imports</span><span>Imported by</span></div>
          <span aria-live="polite">{search.trim() ? `${matches.length} matches · ` : ""}{shown.nodes.length} / {shown.total} files · {shown.edges.length} links</span>
        </div>
      </div>
      <NodeDetailPanel node={focused} nodes={shown.nodes} edges={shown.edges} lane={focused ? layerCode(layerOf(focused)) : undefined} onSelect={locate} onClose={() => setFocusedNodeId(null)} />
    </div>
  );
}
