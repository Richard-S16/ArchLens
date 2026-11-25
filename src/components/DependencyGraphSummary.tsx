import type { AnalysisResult } from "@/types/analysis";

const patternLabels: Record<string, string> = {
  "feature-based": "Feature-based",
  "layer-based": "Layer-based",
  atomic: "Atomic design",
  mixed: "Mixed",
  flat: "Flat",
};

export function DependencyGraphSummary({ result }: { result: AnalysisResult }) {
  const { graph, metadata } = result;
  const facts = [
    ["Dependency nodes", graph.nodes.length.toLocaleString()],
    ["Dependency edges", graph.edges.length.toLocaleString()],
    ["Hotspot files", metadata.hotspots.length],
    ["Circular dependencies", metadata.circularDependencies.length],
    ["Architecture pattern", patternLabels[metadata.architecturePattern] ?? "Unknown"],
    ["Source files", metadata.sourceFiles.toLocaleString()],
    ["Test files", metadata.testFiles.toLocaleString()],
    ["Dynamic imports", metadata.dynamicImportCount],
    ["Parsed files", `${result.parsedFileCount.toLocaleString()} of ${metadata.totalFiles.toLocaleString()}`],
  ];
  return <div className="grid gap-6 text-sm md:grid-cols-2">
    <dl className="divide-y">
      {facts.map(([label, value]) => <div key={label} className="flex justify-between gap-3 py-2">
        <dt className="text-muted-foreground">{label}</dt><dd className="text-right font-mono tabular-nums">{value}</dd>
      </div>)}
    </dl>
    <div className="space-y-5">
      {metadata.techStack.length > 0 && <section>
        <h3 className="font-semibold">Detected stack</h3>
        <ul className="mt-2 flex flex-wrap gap-2">{metadata.techStack.map((tech) => <li key={tech} className="rounded border px-2 py-1 text-muted-foreground">{tech}</li>)}</ul>
      </section>}
      {metadata.hotspots.length > 0 && <section>
        <h3 className="font-semibold">Most imported hotspot files</h3>
        <dl className="mt-2 divide-y">{metadata.hotspots.slice(0, 5).map((hotspot) => <div key={hotspot.path} className="flex justify-between gap-3 py-2">
          <dt className="min-w-0 break-all"><code>{hotspot.path}</code></dt><dd className="shrink-0 text-muted-foreground">{hotspot.inDegree} importers</dd>
        </div>)}</dl>
      </section>}
    </div>
  </div>;
}
