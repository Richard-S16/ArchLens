import type { NodeType, LayerType } from "@/types/analysis";

export function classifyNodeType(path: string): NodeType {
  const lower = path.toLowerCase();
  const fileName = lower.split("/").pop() ?? "";
  const ext = fileName.split(".").pop() ?? "";

  if (
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.includes("__tests__") ||
    lower.includes("/__test__/") ||
    lower.includes("/test/") ||
    lower.includes("/tests/")
  )
    return "test";

  if (["css", "scss", "sass", "less"].some((cssExt) => ext === cssExt) || lower.includes(".module."))
    return "style";

  if (
    lower.includes(".config.") ||
    lower.endsWith(".config.ts") ||
    lower.endsWith(".config.js") ||
    lower.endsWith(".config.mjs") ||
    lower.endsWith("tsconfig.json") ||
    lower.endsWith(".eslintrc") ||
    lower.includes("jest.config") ||
    lower.includes("vitest.config") ||
    lower.endsWith(".d.ts")
  )
    return "config";

  if (
    lower.includes("/types/") ||
    lower.includes("/type/") ||
    fileName.endsWith(".types.ts") ||
    fileName.endsWith(".types.tsx") ||
    fileName === "types.ts" ||
    fileName === "types.tsx" ||
    (fileName.startsWith("types") && ext === "ts")
  )
    return "type";

  if (
    lower.includes("/hooks/") ||
    lower.includes("/hook/") ||
    (fileName.startsWith("use") &&
      fileName[3] === fileName[3]?.toUpperCase() &&
      (ext === "ts" || ext === "tsx"))
  )
    return "hook";

  if (
    lower.includes("/store/") ||
    lower.includes("/stores/") ||
    lower.includes("/redux/") ||
    lower.includes("/state/") ||
    lower.includes("slice.") ||
    lower.includes(".slice.") ||
    lower.includes("/atoms") ||
    lower.includes("/jotai") ||
    lower.includes("/zustand")
  )
    return "store";

  if (
    lower.includes("/api/") ||
    lower.includes("/services/") ||
    lower.includes("/service/") ||
    lower.includes("/queries/") ||
    lower.includes("/mutations/") ||
    lower.includes("/fetcher") ||
    lower.includes("/client")
  )
    return "api";

  if (
    lower.includes("/context/") ||
    lower.includes("/contexts/") ||
    fileName.includes("context") ||
    fileName.includes("provider")
  )
    return "context";

  if (
    lower.includes("/layouts/") ||
    lower.includes("/layout/") ||
    fileName === "layout.tsx" ||
    fileName === "layout.ts" ||
    fileName === "layout.jsx"
  )
    return "layout";

  if (
    lower.includes("/pages/") ||
    (lower.includes("/app/") &&
      (fileName === "page.tsx" ||
        fileName === "page.ts" ||
        fileName === "page.jsx"))
  )
    return "page";

  if (ext === "tsx" || ext === "jsx") return "component";

  if (
    lower.includes("/utils/") ||
    lower.includes("/util/") ||
    lower.includes("/helpers/") ||
    lower.includes("/lib/") ||
    fileName.startsWith("utils") ||
    fileName.startsWith("helpers")
  )
    return "util";

  return "other";
}

export function classifyLayer(type: NodeType): LayerType {
  switch (type) {
    case "component":
    case "page":
    case "layout":
      return "presentation";
    case "hook":
    case "util":
    case "context":
    case "store":
      return "logic";
    case "api":
      return "data";
    case "config":
    case "type":
      return "config";
    case "test":
      return "test";
    default:
      return "logic";
  }
}
