"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { AnalysisResult } from "@/types/analysis";
import { GraphFlow } from "./DependencyGraph/GraphFlow";

export function DependencyGraph({ result, visible }: { result: AnalysisResult; visible: boolean }) {
  return (
    <ReactFlowProvider>
      <GraphFlow graphNodes={result.graph.nodes} graphEdges={result.graph.edges} visible={visible} />
    </ReactFlowProvider>
  );
}
