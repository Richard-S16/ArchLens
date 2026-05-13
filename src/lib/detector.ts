import type { FileNode } from "@/types/github";
import type { ArchitecturePattern, ArchitectureMetadata } from "@/types/analysis";

export function detectFramework(
  tree: FileNode[],
  deps: Record<string, string>
): { framework: string | null; frameworkVersion: string | null } {
  const paths = tree.map((node) => node.path.toLowerCase());

  const checks: [string, RegExp | null, string | null][] = [
    ["Next.js", null, "next"],
    ["Nuxt", null, "nuxt"],
    ["Remix", null, "@remix-run/react"],
    ["Astro", null, "astro"],
    ["SvelteKit", null, "@sveltejs/kit"],
    ["Vite + React", null, "vite"],
    ["Create React App", null, "react-scripts"],
    ["Angular", null, "@angular/core"],
    ["Vue", null, "vue"],
    ["Svelte", null, "svelte"],
    ["Solid", null, "solid-js"],
  ];

  if (paths.some((path) => path === "next.config.ts" || path === "next.config.js" || path === "next.config.mjs"))
    return { framework: "Next.js", frameworkVersion: deps["next"] ?? null };
  if (paths.some((path) => path === "nuxt.config.ts" || path === "nuxt.config.js"))
    return { framework: "Nuxt", frameworkVersion: deps["nuxt"] ?? null };
  if (paths.some((path) => path === "astro.config.mjs" || path === "astro.config.ts"))
    return { framework: "Astro", frameworkVersion: deps["astro"] ?? null };
  if (paths.some((path) => path.includes("svelte.config")))
    return { framework: "SvelteKit", frameworkVersion: deps["@sveltejs/kit"] ?? null };
  if (paths.some((path) => path === "remix.config.js" || path === "remix.config.ts"))
    return { framework: "Remix", frameworkVersion: deps["@remix-run/react"] ?? null };
  if (paths.some((path) => path === "vite.config.ts" || path === "vite.config.js"))
    return { framework: "Vite", frameworkVersion: deps["vite"] ?? null };

  for (const [name, , dep] of checks) {
    if (dep && dep in deps) {
      return { framework: name, frameworkVersion: deps[dep] ?? null };
    }
  }

  return { framework: null, frameworkVersion: null };
}

export function detectArchitecturePattern(tree: FileNode[]): ArchitecturePattern {
  const dirs = new Set<string>();
  for (const node of tree) {
    const parts = node.path.split("/");
    if (parts.length > 1) dirs.add(parts[0]);
    if (parts.length > 2) dirs.add(`${parts[0]}/${parts[1]}`);
  }

  const dirStr = [...dirs].join(" ").toLowerCase();

  const featureIndicators = ["features", "modules", "domains", "slices", "feature"].filter(
    (dir) => dirStr.includes(dir)
  ).length;
  const atomicIndicators = ["atoms", "molecules", "organisms", "templates"].filter(
    (dir) => dirStr.includes(dir)
  ).length;
  const layerIndicators = ["components", "hooks", "services", "utils", "store", "api", "types"].filter(
    (dir) => dirStr.includes(dir)
  ).length;

  if (atomicIndicators >= 2) return "atomic";
  if (featureIndicators >= 1) return "feature-based";
  if (layerIndicators >= 3) return "layer-based";
  if (layerIndicators >= 1) return "mixed";

  const deepFiles = tree.filter((node) => (node.path.match(/\//g) ?? []).length >= 2).length;
  const totalFiles = tree.filter((node) => node.type === "blob").length;
  if (totalFiles > 0 && deepFiles / totalFiles < 0.3) return "flat";

  return "unknown";
}

export function detectTechStack(
  deps: Record<string, string>,
  devDeps: Record<string, string>
): string[] {
  const all = { ...deps, ...devDeps };
  const stack: string[] = [];

  const checks: [string, string][] = [
    ["React", "react"],
    ["TypeScript", "typescript"],
    ["Tailwind CSS", "tailwindcss"],
    ["shadcn/ui", "shadcn"],
    ["Framer Motion", "framer-motion"],
    ["Zustand", "zustand"],
    ["Redux Toolkit", "@reduxjs/toolkit"],
    ["React Query", "@tanstack/react-query"],
    ["Prisma", "prisma"],
    ["tRPC", "@trpc/server"],
    ["Zod", "zod"],
    ["React Hook Form", "react-hook-form"],
    ["Radix UI", "radix-ui"],
    ["Vitest", "vitest"],
    ["Jest", "jest"],
    ["Testing Library", "@testing-library/react"],
    ["Storybook", "@storybook/react"],
    ["ESLint", "eslint"],
    ["Prettier", "prettier"],
    ["Valtio", "valtio"],
    ["Jotai", "jotai"],
    ["SWR", "swr"],
    ["Axios", "axios"],
    ["GSAP", "gsap"],
    ["Three.js", "three"],
    ["D3", "d3"],
    ["Recharts", "recharts"],
    ["Chart.js", "chart.js"],
    ["Lucide", "lucide-react"],
    ["Supabase", "@supabase/supabase-js"],
    ["Firebase", "firebase"],
    ["NextAuth", "next-auth"],
    ["Clerk", "@clerk/nextjs"],
    ["Drizzle ORM", "drizzle-orm"],
  ];

  for (const [label, pkg] of checks) {
    if (pkg in all) stack.push(label);
  }

  return stack;
}

export function detectPackageManager(tree: FileNode[]): ArchitectureMetadata["packageManager"] {
  const paths = tree.map((node) => node.path);
  if (paths.includes("bun.lockb")) return "bun";
  if (paths.includes("pnpm-lock.yaml")) return "pnpm";
  if (paths.includes("yarn.lock")) return "yarn";
  if (paths.includes("package-lock.json")) return "npm";
  return "unknown";
}
