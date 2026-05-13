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
import { GraphNodeComponent } from "./GraphNodeComponent";
import { GraphEdgeComponent } from "./GraphEdgeComponent";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { LayerLabelNode } from "./LayerLabelNode";
import { FilterPill } from "./FilterPill";

const edgeTypes = { graphEdge: GraphEdgeComponent };
const nodeTypes = { graphNode: GraphNodeComponent, layerLabel: LayerLabelNode };

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
    if (showHotspotsOnly) ns = ns.filter((n) => n.isHotspot);
    if (showCircularOnly) ns = ns.filter((n) => n.hasCircularDep);
    if (ns.length > MAX_NODES) {
      ns.sort((a, b) => {
        if (a.isHotspot !== b.isHotspot) return a.isHotspot ? -1 : 1;
        if (a.hasCircularDep !== b.hasCircularDep) return a.hasCircularDep ? -1 : 1;
        return b.inDegree + b.outDegree - (a.inDegree + a.outDegree);
      });
      ns = ns.slice(0, MAX_NODES);
    }
    return ns;
  }, [graphNodes, showHotspotsOnly, showCircularOnly]);

  const displayedEdges = useMemo(() => {
    const nodeSet = new Set(displayedNodes.map((n) => n.id));
    return graphEdges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target));
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
        .filter((e) => e.source === focusedNodeId || e.target === focusedNodeId)
        .map((e) => e.id)
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
    () => graphNodes.filter((n) => n.isHotspot).length,
    [graphNodes]
  );
  const circularCount = useMemo(
    () => graphNodes.filter((n) => n.hasCircularDep).length,
    [graphNodes]
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "oklch(0.10 0.014 260 / 94%)",
            backdropFilter: "blur(14px)",
            border: "1px solid oklch(1 0 0 / 9%)",
            borderRadius: 10,
            padding: "5px 9px",
            width: 196,
            boxShadow: "0 4px 16px oklch(0 0 0 / 30%)",
          }}
        >
          <Search style={{ width: 12, height: 12, color: "oklch(0.46 0.03 260)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 11,
              color: "oklch(0.87 0 0)",
              width: "100%",
              fontFamily: "var(--font-geist-mono, monospace)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                color: "oklch(0.46 0.03 260)",
              }}
            >
              <X style={{ width: 11, height: 11 }} />
            </button>
          )}
        </div>

        <FilterPill
          active={showHotspotsOnly}
          onClick={() => setShowHotspotsOnly((v) => !v)}
          label="🔥 Hotspots"
          count={hotspotCount}
          activeColor="oklch(0.72 0.18 52)"
        />
        <FilterPill
          active={showCircularOnly}
          onClick={() => setShowCircularOnly((v) => !v)}
          label="↺ Circular"
          count={circularCount}
          activeColor="oklch(0.68 0.22 27)"
        />
        <FilterPill
          active={showLegend}
          onClick={() => setShowLegend((v) => !v)}
          label="Legend"
          count={null}
          activeColor="oklch(0.55 0.18 280)"
          icon={<Layers style={{ width: 10, height: 10 }} />}
        />
      </div>

      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              top: 52,
              left: 12,
              zIndex: 10,
              background: "oklch(0.10 0.014 260 / 96%)",
              backdropFilter: "blur(16px)",
              border: "1px solid oklch(1 0 0 / 9%)",
              borderRadius: 12,
              padding: "12px 14px",
              boxShadow: "0 8px 28px oklch(0 0 0 / 40%)",
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "oklch(0.44 0.03 260)",
                marginBottom: 9,
              }}
            >
              Node Types
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "5px 16px",
              }}
            >
              {(Object.entries(TYPE_CONFIG) as [NodeType, { color: string; label: string }][])
                .filter(([type]) => typesPresent.has(type))
                .map(([type, { color, label }]) => (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: color,
                        flexShrink: 0,
                        boxShadow: `0 0 5px ${color}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: "oklch(0.70 0 0)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
            </div>
            <div style={{ borderTop: "1px solid oklch(1 0 0 / 7%)", marginTop: 10, paddingTop: 9 }}>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "oklch(0.44 0.03 260)",
                  marginBottom: 7,
                }}
              >
                Edge Types
              </p>
              {[
                { dash: "none", color: "oklch(0.62 0.22 240)", label: "Static import" },
                { dash: "5 3",  color: "oklch(0.55 0.18 280)", label: "Dynamic import" },
                { dash: "2 2",  color: "oklch(0.60 0.14 165)", label: "Re-export" },
              ].map(({ dash, color, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 4,
                  }}
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
                  <span style={{ fontSize: 10, color: "oklch(0.70 0 0)" }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 12,
          zIndex: 10,
          background: "oklch(0.10 0.014 260 / 92%)",
          backdropFilter: "blur(14px)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: 10,
          padding: "6px 14px",
          display: "flex",
          gap: 16,
          boxShadow: "0 4px 16px oklch(0 0 0 / 30%)",
        }}
      >
        {[
          { label: "nodes", value: displayedNodes.length, color: "oklch(0.62 0.22 240)" },
          { label: "edges", value: displayedEdges.length, color: "oklch(0.55 0.18 280)" },
          { label: "hotspots", value: hotspotCount, color: "oklch(0.72 0.18 52)" },
          { label: "circular", value: circularCount, color: "oklch(0.68 0.22 27)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                fontFamily: "var(--font-geist-mono, monospace)",
                fontWeight: 700,
                color,
                lineHeight: 1.2,
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontSize: 8,
                color: "oklch(0.44 0.03 260)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
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
