import { GraphEdgeComponent } from "@/components/DependencyGraph/GraphEdgeComponent";
import { GraphNodeComponent } from "@/components/DependencyGraph/GraphNodeComponent";
import { LayerLabelNode } from "@/components/DependencyGraph/LayerLabelNode";

export const edgeTypes = { graphEdge: GraphEdgeComponent };
export const nodeTypes = { graphNode: GraphNodeComponent, layerLabel: LayerLabelNode };
