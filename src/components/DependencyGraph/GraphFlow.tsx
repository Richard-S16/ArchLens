"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  type Node,
} from "@xyflow/react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Layers } from "lucide-react";
import type { GraphNode, GraphEdge, NodeType } from "@/types/analysis";
import {
  NODE_W,
  NODE_H,
  H_GAP,
  V_GAP,
  ROW_GAP,
  NODES_PER_ROW,
  MAX_NODES,
  TYPE_CONFIG,
  LAYER_ORDER,
  LAYER_LABELS,
  LAYER_COLORS,
} from "@/constants/dependencyGraph";
import type { RFNode, RFEdge, LabelNode, NodeData } from "@/types/graph";
import { computePositions } from "./computePositions";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { FilterPill } from "./FilterPill";
import { edgeTypes, nodeTypes } from "@/constants/graphFlow";

export function GraphFlow({
  graphNodes,
  graphEdges,
}: {
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
}) {
  const [search, setSearch] = useState("");
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [showHotspotsOnly, setShowHotspotsOnly] = useState(false);
  const [showCircularOnly, setShowCircularOnly] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode | LabelNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);

  const displayedNodes = useMemo(() => {
    let ns = [...graphNodes];
    if (showHotspotsOnly) ns = ns.filter((graphNode) => graphNode.isHotspot);
    if (showCircularOnly) ns = ns.filter((graphNode) => graphNode.hasCircularDep);
    if (ns.length > MAX_NODES) {
      ns.sort((nodeA, nodeB) => {
        if (nodeA.isHotspot !== nodeB.isHotspot) return nodeA.isHotspot ? -1 : 1;
        if (nodeA.hasCircularDep !== nodeB.hasCircularDep) return nodeA.hasCircularDep ? -1 : 1;
        return nodeB.inDegree + nodeB.outDegree - (nodeA.inDegree + nodeA.outDegree);
      });
      ns = ns.slice(0, MAX_NODES);
    }
    return ns;
  }, [graphNodes, showHotspotsOnly, showCircularOnly]);

  const displayedEdges = useMemo(() => {
    const nodeSet = new Set(displayedNodes.map((graphNode) => graphNode.id));
    return graphEdges.filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target));
  }, [graphEdges, displayedNodes]);

  const positions = useMemo(() => computePositions(displayedNodes), [displayedNodes]);

  const focusedSet = useMemo(() => {
    if (!focusedNodeId) return null;
    const set = new Set<string>([focusedNodeId]);
    for (const edge of displayedEdges) {
      if (edge.source === focusedNodeId || edge.target === focusedNodeId) {
        set.add(edge.source);
        set.add(edge.target);
      }
    }
    return set;
  }, [focusedNodeId, displayedEdges]);

  const focusedEdgeSet = useMemo(() => {
    if (!focusedNodeId) return null;
    return new Set(
      displayedEdges
        .filter((edge) => edge.source === focusedNodeId || edge.target === focusedNodeId)
        .map((edge) => edge.id)
    );
  }, [focusedNodeId, displayedEdges]);

  useEffect(() => {
    const searchLow = search.toLowerCase().trim();
    const hasSearch = searchLow.length > 0;

    const byLayer: Partial<Record<string, GraphNode[]>> = {};
    for (const node of displayedNodes) {
      const key = (LAYER_ORDER as string[]).includes(node.layer) ? node.layer : "other";
      if (!byLayer[key]) byLayer[key] = [];
      byLayer[key]!.push(node);
    }

    const dataNodes: RFNode[] = displayedNodes.map((node) => {
      const matchesSearch =
        !hasSearch ||
        node.label.toLowerCase().includes(searchLow) ||
        node.path.toLowerCase().includes(searchLow);
      const dimmed = (focusedSet ? !focusedSet.has(node.id) : false) || !matchesSearch;
      const focused = focusedSet ? focusedSet.has(node.id) : false;

      return {
        id: node.id,
        type: "graphNode",
        position: positions[node.id] ?? { x: 0, y: 0 },
        data: { node, dimmed, focused },
        draggable: true,
      };
    });

    const labelNodes: LabelNode[] = [];
    let labelY = 0;
    let prevLayer: string | null = null;

    const allLayers = [...LAYER_ORDER, "other"];
    for (const layer of allLayers) {
      const layerNodes = byLayer[layer];
      if (!layerNodes?.length) continue;

      const rowCount = Math.ceil(layerNodes.length / NODES_PER_ROW);
      const labelX = -(NODES_PER_ROW * (NODE_W + H_GAP)) / 2 - 20;

      if (prevLayer !== layer) {
        labelNodes.push({
          id: `__label__${layer}`,
          type: "layerLabel",
          position: { x: labelX, y: labelY - 26 },
          data: { label: LAYER_LABELS[layer] ?? layer, color: LAYER_COLORS[layer] ?? "oklch(0.55 0.04 260)" },
          draggable: false,
          selectable: false,
        });
        prevLayer = layer;
      }

      labelY += rowCount * (NODE_H + ROW_GAP) + V_GAP;
    }

    const rfEdges: RFEdge[] = displayedEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "graphEdge",
      data: {
        edgeType: edge.type,
        dimmed: focusedEdgeSet ? !focusedEdgeSet.has(edge.id) : false,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "oklch(0.62 0.22 240 / 55%)",
        width: 10,
        height: 10,
      },
    }));

    setNodes([...dataNodes, ...labelNodes] as (RFNode | LabelNode)[]);
    setEdges(rfEdges);
  }, [
    displayedNodes,
    displayedEdges,
    positions,
    focusedSet,
    focusedEdgeSet,
    search,
    setNodes,
    setEdges,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => fitView({ padding: 0.1, duration: 480 }), 80);
    return () => clearTimeout(timer);
  }, [displayedNodes, fitView]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: RFNode | LabelNode) => {
      if (node.type === "layerLabel") return;
      setFocusedNodeId((prev) => (prev === node.id ? null : node.id));
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setFocusedNodeId(null);
  }, []);

  const typesPresent = useMemo(() => {
    const types = new Set<NodeType>();
    for (const n of displayedNodes) types.add(n.type);
    return types;
  }, [displayedNodes]);

  const hotspotCount = useMemo(
    () => graphNodes.filter((graphNode) => graphNode.isHotspot).length,
    [graphNodes]
  );
  const circularCount = useMemo(
    () => graphNodes.filter((graphNode) => graphNode.hasCircularDep).length,
    [graphNodes]
  );

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.75 flex-wrap">
        <div className="flex items-center gap-1.75 bg-[oklch(0.10_0.014_260/94%)] backdrop-blur-[14px] border border-[oklch(1_0_0/9%)] rounded-[10px] py-1.25 px-2.25 w-49 shadow-[0_4px_16px_oklch(0_0_0/30%)]">
          <Search className="w-3 h-3 text-[oklch(0.46_0.03_260)] shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search files…"
            className="bg-transparent border-0 outline-none text-[11px] text-[oklch(0.87_0_0)] w-full font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="bg-transparent border-0 cursor-pointer p-0 flex text-[oklch(0.46_0.03_260)]"
            >
              <X className="w-2.75 h-2.75" />
            </button>
          )}
        </div>

        <FilterPill
          active={showHotspotsOnly}
          onClick={() => setShowHotspotsOnly((prev) => !prev)}
          label="🔥 Hotspots"
          count={hotspotCount}
          activeColor="oklch(0.72 0.18 52)"
        />
        <FilterPill
          active={showCircularOnly}
          onClick={() => setShowCircularOnly((prev) => !prev)}
          label="↺ Circular"
          count={circularCount}
          activeColor="oklch(0.68 0.22 27)"
        />
        <FilterPill
          active={showLegend}
          onClick={() => setShowLegend((prev) => !prev)}
          label="Legend"
          count={null}
          activeColor="oklch(0.55 0.18 280)"
          icon={<Layers className="w-2.5 h-2.5" />}
        />
      </div>

      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-13 left-3 z-10 bg-[oklch(0.10_0.014_260/96%)] backdrop-blur-lg border border-[oklch(1_0_0/9%)] rounded-xl py-3 px-3.5 shadow-[0_8px_28px_oklch(0_0_0/40%)]"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[oklch(0.44_0.03_260)] mb-2.25">
              Node Types
            </p>
            <div className="grid grid-cols-2 gap-y-1.25 gap-x-4">
              {(Object.entries(TYPE_CONFIG) as [NodeType, { color: string; label: string }][])
                .filter(([type]) => typesPresent.has(type))
                .map(([type, { color, label }]) => (
                  <div
                    key={type}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ background: color, boxShadow: `0 0 5px ${color}` }}
                    />
                    <span className="text-[10px] text-[oklch(0.70_0_0)] whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                ))}
            </div>
            <div className="border-t border-[oklch(1_0_0/7%)] mt-2.5 pt-2.25">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[oklch(0.44_0.03_260)] mb-1.75">
                Edge Types
              </p>
              {[
                { dash: "none", color: "oklch(0.62 0.22 240)", label: "Static import" },
                { dash: "5 3",  color: "oklch(0.55 0.18 280)", label: "Dynamic import" },
                { dash: "2 2",  color: "oklch(0.60 0.14 165)", label: "Re-export" },
              ].map(({ dash, color, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.75 mb-1"
                >
                  <svg width={22} height={8}>
                    <line
                      x1={0}
                      y1={4}
                      x2={22}
                      y2={4}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray={dash === "none" ? undefined : dash}
                    />
                  </svg>
                  <span className="text-[10px] text-[oklch(0.70_0_0)]">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-14 left-3 z-10 bg-[oklch(0.10_0.014_260/92%)] backdrop-blur-[14px] border border-[oklch(1_0_0/8%)] rounded-[10px] py-1.5 px-3.5 flex gap-4 shadow-[0_4px_16px_oklch(0_0_0/30%)]">
        {[
          { label: "nodes", value: displayedNodes.length, color: "oklch(0.62 0.22 240)" },
          { label: "edges", value: displayedEdges.length, color: "oklch(0.55 0.18 280)" },
          { label: "hotspots", value: hotspotCount, color: "oklch(0.72 0.18 52)" },
          { label: "circular", value: circularCount, color: "oklch(0.68 0.22 27)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div
              className="text-[13px] font-mono font-bold leading-[1.2]"
              style={{ color }}
            >
              {value}
            </div>
            <div className="text-[8px] text-[oklch(0.44_0.03_260)] uppercase tracking-[0.06em]">
              {label}
            </div>
          </div>
        ))}
      </div>

      <NodeDetailPanel
        nodeId={focusedNodeId}
        nodes={displayedNodes}
        edges={displayedEdges}
        onClose={() => setFocusedNodeId(null)}
      />

      <ReactFlow
        nodes={nodes as (RFNode | LabelNode)[]}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick as Parameters<typeof ReactFlow>[0]["onNodeClick"]}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.05}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
        deleteKeyCode={null}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="oklch(1 0 0 / 4%)"
        />
        <Controls
          position="bottom-left"
          style={{
            left: 14,
            bottom: 14,
            background: "oklch(0.10 0.014 260 / 92%)",
            border: "1px solid oklch(1 0 0 / 8%)",
            borderRadius: 10,
            boxShadow: "0 4px 16px oklch(0 0 0 / 30%)",
          }}
        />
        <MiniMap
          position="bottom-right"
          style={{
            background: "oklch(0.085 0.012 260)",
            border: "1px solid oklch(1 0 0 / 8%)",
            borderRadius: 10,
            boxShadow: "0 4px 16px oklch(0 0 0 / 30%)",
          }}
          nodeColor={(node: Node) => {
            if (node.type === "layerLabel") return "transparent";
            const nd = node.data as NodeData;
            if (nd?.dimmed) return "oklch(0.22 0.02 260)";
            const cfg = TYPE_CONFIG[nd?.node?.type] ?? TYPE_CONFIG.other;
            return cfg.color;
          }}
          maskColor="oklch(0 0 0 / 35%)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
