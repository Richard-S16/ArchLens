import type { GraphNode, GraphEdge, CircularDep } from "@/types/analysis";
import { extractImports, isLocalImport, resolveImportPath } from "@/lib/parser";
import { classifyNodeType, classifyLayer } from "@/lib/classifier";

const HOTSPOT_MIN_INDEGREE = 4;

export function buildDependencyGraph(
  fileContents: Map<string, string>,
  allPaths: Set<string>
): { nodes: GraphNode[]; edges: GraphEdge[]; dynamicImportCount: number } {
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const edges: GraphEdge[] = [];
  let dynamicImportCount = 0;

  for (const path of allPaths) {
    inDegree.set(path, 0);
    outDegree.set(path, 0);
  }

  for (const [filePath, content] of fileContents) {
    const imports = extractImports(content);
    for (const { path: importPath, isDynamic } of imports) {
      if (!isLocalImport(importPath)) continue;
      const resolved = resolveImportPath(importPath, filePath, allPaths);
      if (!resolved || resolved === filePath) continue;

      if (isDynamic) dynamicImportCount++;

      const edgeId = `${filePath}→${resolved}`;
      if (!edges.find((edge) => edge.id === edgeId)) {
        edges.push({
          id: edgeId,
          source: filePath,
          target: resolved,
          type: isDynamic ? "dynamic" : "static",
        });
        outDegree.set(filePath, (outDegree.get(filePath) ?? 0) + 1);
        inDegree.set(resolved, (inDegree.get(resolved) ?? 0) + 1);
      }
    }
  }

  const degrees = [...inDegree.values()];
  const mean = degrees.reduce((sum, degree) => sum + degree, 0) / (degrees.length || 1);
  const std = Math.sqrt(
    degrees.reduce((sum, degree) => sum + (degree - mean) ** 2, 0) / (degrees.length || 1)
  );
  const hotspotThreshold = Math.max(HOTSPOT_MIN_INDEGREE, mean + 1.5 * std);

  const circularFiles = new Set<string>();
  for (const dep of detectCircularDependencies([...allPaths], edges).slice(0, 20)) {
    for (const file of dep.files) circularFiles.add(file);
  }

  const activeNodes = new Set<string>([
    ...fileContents.keys(),
    ...edges.map((edge) => edge.source),
    ...edges.map((edge) => edge.target),
  ]);

  const nodes: GraphNode[] = [];
  for (const path of activeNodes) {
    const type = classifyNodeType(path);
    const ind = inDegree.get(path) ?? 0;
    const outd = outDegree.get(path) ?? 0;
    nodes.push({
      id: path,
      path,
      label: path.split("/").pop() ?? path,
      type,
      size: 1,
      inDegree: ind,
      outDegree: outd,
      isHotspot: ind >= hotspotThreshold,
      hasCircularDep: circularFiles.has(path),
      layer: classifyLayer(type),
    });
  }

  return { nodes, edges, dynamicImportCount };
}

export function detectCircularDependencies(
  nodeIds: string[],
  edges: GraphEdge[]
): CircularDep[] {
  const graph = new Map<string, string[]>();
  for (const id of nodeIds) graph.set(id, []);
  for (const { source, target } of edges) {
    graph.get(source)?.push(target);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycles: CircularDep[] = [];

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx !== -1) {
        const cycle = path.slice(idx);
        const key = [...cycle].sort().join("|");
        if (!cycles.find((existingCycle) => [...existingCycle.files].sort().join("|") === key)) {
          cycles.push({ files: cycle });
        }
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    for (const neighbor of graph.get(node) ?? []) {
      dfs(neighbor, [...path, node]);
      if (cycles.length >= 15) return;
    }

    stack.delete(node);
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) dfs(id, []);
    if (cycles.length >= 15) break;
  }

  return cycles;
}
