"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/types/analysis";
import { TYPE_CONFIG, LAYER_LABELS } from "./constants";

export function NodeDetailPanel({
  nodeId,
  nodes,
  edges,
  onClose,
}: {
  nodeId: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
}) {
  const node = useMemo(() => nodes.find((n) => n.id === nodeId), [nodes, nodeId]);

  const imports = useMemo(
    () =>
      edges
        .filter((e) => e.source === nodeId)
        .map((e) => nodes.find((n) => n.id === e.target))
        .filter(Boolean) as GraphNode[],
    [edges, nodeId, nodes]
  );

  const importedBy = useMemo(
    () =>
      edges
        .filter((e) => e.target === nodeId)
        .map((e) => nodes.find((n) => n.id === e.source))
        .filter(Boolean) as GraphNode[],
    [edges, nodeId, nodes]
  );

  const cfg = node ? (TYPE_CONFIG[node.type] ?? TYPE_CONFIG.other) : null;

  return (
    <AnimatePresence>
      {node && cfg && (
        <motion.div
          key={nodeId}
          initial={{ opacity: 0, x: 16, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 252,
            zIndex: 20,
            background: "oklch(0.10 0.014 260 / 96%)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(1 0 0 / 9%)",
            borderRadius: 14,
            padding: "14px 14px 16px",
            boxShadow: "0 12px 40px oklch(0 0 0 / 50%), inset 0 1px 0 oklch(1 0 0 / 7%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 10,
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "oklch(0.93 0 0)",
                  display: "block",
                  wordBreak: "break-all",
                  lineHeight: 1.35,
                }}
              >
                {node.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "oklch(0.46 0.03 260)",
                  wordBreak: "break-all",
                  display: "block",
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {node.path}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "oklch(0.18 0.015 260)",
                border: "1px solid oklch(1 0 0 / 8%)",
                cursor: "pointer",
                padding: "4px 5px",
                borderRadius: 7,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "oklch(0.50 0.03 260)",
              }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "3px 8px",
                borderRadius: 6,
                color: cfg.color,
                background: `color-mix(in oklch, ${cfg.color} 14%, transparent)`,
                border: `1px solid color-mix(in oklch, ${cfg.color} 28%, transparent)`,
              }}
            >
              {cfg.label}
            </span>
            {node.isHotspot && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "3px 8px",
                  borderRadius: 6,
                  color: "oklch(0.72 0.18 52)",
                  background: "oklch(0.72 0.18 52 / 12%)",
                  border: "1px solid oklch(0.72 0.18 52 / 28%)",
                }}
              >
                🔥 Hotspot
              </span>
            )}
            {node.hasCircularDep && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "3px 8px",
                  borderRadius: 6,
                  color: "oklch(0.68 0.22 27)",
                  background: "oklch(0.68 0.22 27 / 12%)",
                  border: "1px solid oklch(0.68 0.22 27 / 28%)",
                }}
              >
                ↺ Circular
              </span>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {[
              { label: "Imports", value: node.outDegree },
              { label: "Imported by", value: node.inDegree },
              { label: "Layer", value: LAYER_LABELS[node.layer] ?? node.layer },
              { label: "Size", value: node.size > 1024 ? `${(node.size / 1024).toFixed(1)}K` : `${node.size}B` },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "oklch(0.14 0.014 260)",
                  borderRadius: 8,
                  padding: "7px 10px",
                  border: "1px solid oklch(1 0 0 / 5%)",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "oklch(0.44 0.03 260)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-geist-mono, monospace)",
                    fontWeight: 700,
                    color: "oklch(0.87 0 0)",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {imports.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 9,
                  color: "oklch(0.44 0.03 260)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 5,
                }}
              >
                <ArrowUpRight style={{ width: 10, height: 10, color: "oklch(0.62 0.22 240)" }} />
                Imports ({imports.length})
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  maxHeight: 96,
                  overflowY: "auto",
                }}
              >
                {imports.slice(0, 8).map((dep) => (
                  <span
                    key={dep.id}
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-geist-mono, monospace)",
                      color: "oklch(0.62 0.22 240)",
                      background: "oklch(0.62 0.22 240 / 8%)",
                      borderRadius: 5,
                      padding: "2px 7px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={dep.path}
                  >
                    {dep.label}
                  </span>
                ))}
                {imports.length > 8 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "oklch(0.44 0.03 260)",
                      paddingLeft: 5,
                    }}
                  >
                    +{imports.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {importedBy.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: 9,
                  color: "oklch(0.44 0.03 260)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 5,
                }}
              >
                <ArrowDownLeft style={{ width: 10, height: 10, color: "oklch(0.55 0.18 280)" }} />
                Imported by ({importedBy.length})
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  maxHeight: 96,
                  overflowY: "auto",
                }}
              >
                {importedBy.slice(0, 8).map((dep) => (
                  <span
                    key={dep.id}
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-geist-mono, monospace)",
                      color: "oklch(0.55 0.18 280)",
                      background: "oklch(0.55 0.18 280 / 8%)",
                      borderRadius: 5,
                      padding: "2px 7px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={dep.path}
                  >
                    {dep.label}
                  </span>
                ))}
                {importedBy.length > 8 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "oklch(0.44 0.03 260)",
                      paddingLeft: 5,
                    }}
                  >
                    +{importedBy.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
