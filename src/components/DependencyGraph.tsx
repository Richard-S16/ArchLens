"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { AnalysisResult } from "@/types/analysis";
import { GraphFlow } from "./DependencyGraph/GraphFlow";

export function DependencyGraph({ result }: { result: AnalysisResult }) {
  return (
    <div
      style={{
        height: 660,
        background: "oklch(0.078 0.012 260)",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        border: "1px solid oklch(1 0 0 / 6%)",
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 4%)",
      }}
    >
      <ReactFlowProvider>
        <GraphFlow graphNodes={result.graph.nodes} graphEdges={result.graph.edges} />
      </ReactFlowProvider>
    </div>
  );
}
