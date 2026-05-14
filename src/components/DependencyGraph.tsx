"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { AnalysisResult } from "@/types/analysis";
import { GraphFlow } from "./DependencyGraph/GraphFlow";

export function DependencyGraph({ result }: { result: AnalysisResult }) {
  return (
    <div className="h-165 bg-[oklch(0.078_0.012_260)] rounded-2xl overflow-hidden relative border border-[oklch(1_0_0/6%)] shadow-[inset_0_1px_0_oklch(1_0_0/4%)]">
      <ReactFlowProvider>
        <GraphFlow graphNodes={result.graph.nodes} graphEdges={result.graph.edges} />
      </ReactFlowProvider>
    </div>
  );
}
