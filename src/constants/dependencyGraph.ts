import type { NodeType, LayerType } from "@/types/analysis";

export const NODE_W = 178;
export const NODE_H = 70;
export const H_GAP = 30;
export const V_GAP = 90;
export const ROW_GAP = 14;
export const NODES_PER_ROW = 8;
export const MAX_NODES = 220;

export const TYPE_CONFIG: Record<NodeType, { color: string; label: string }> = {
  component: { color: "oklch(0.62 0.22 240)", label: "Component" },
  hook:      { color: "oklch(0.60 0.20 290)", label: "Hook" },
  page:      { color: "oklch(0.65 0.18 155)", label: "Page" },
  api:       { color: "oklch(0.65 0.18 55)",  label: "API Route" },
  util:      { color: "oklch(0.58 0.08 220)", label: "Util" },
  config:    { color: "oklch(0.65 0.18 85)",  label: "Config" },
  test:      { color: "oklch(0.58 0.16 340)", label: "Test" },
  style:     { color: "oklch(0.60 0.16 325)", label: "Style" },
  type:      { color: "oklch(0.55 0.10 200)", label: "Type" },
  store:     { color: "oklch(0.65 0.18 200)", label: "Store" },
  layout:    { color: "oklch(0.60 0.14 165)", label: "Layout" },
  context:   { color: "oklch(0.60 0.20 265)", label: "Context" },
  other:     { color: "oklch(0.45 0.04 260)", label: "Other" },
};

export const LAYER_ORDER: LayerType[] = ["presentation", "logic", "data", "config", "test"];

export const LAYER_LABELS: Record<string, string> = {
  presentation: "Presentation",
  logic:        "Logic",
  data:         "Data",
  config:       "Config",
  test:         "Tests",
  other:        "Other",
};

export const LAYER_COLORS: Record<string, string> = {
  presentation: "oklch(0.65 0.18 155)",
  logic:        "oklch(0.62 0.22 240)",
  data:         "oklch(0.65 0.18 55)",
  config:       "oklch(0.65 0.18 85)",
  test:         "oklch(0.58 0.16 340)",
  other:        "oklch(0.45 0.04 260)",
};
