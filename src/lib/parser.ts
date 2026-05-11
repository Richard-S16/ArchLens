export function extractImports(
  content: string
): { path: string; isDynamic: boolean }[] {
  const seen = new Set<string>();
  const results: { path: string; isDynamic: boolean }[] = [];

  const patterns: [RegExp, boolean][] = [
    [/\bimport\s+(?:type\s+)?(?:[^'";\n]*?\s+from\s+)?['"]([^'"]+)['"]/g, false],
    [/\bexport\s+(?:type\s+)?(?:[^'";\n]*?\s+from\s+)?['"]([^'"]+)['"]/g, false],
    [/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, false],
    [/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, true],
  ];

  for (const [regex, isDynamic] of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const p = match[1];
      if (p && !seen.has(p)) {
        seen.add(p);
        results.push({ path: p, isDynamic });
      }
    }
  }
  return results;
}

export function isLocalImport(importPath: string): boolean {
  return (
    importPath.startsWith(".") ||
    importPath.startsWith("@/") ||
    importPath.startsWith("~/")
  );
}

export function resolveImportPath(
  importPath: string,
  fromFile: string,
  fileSet: Set<string>
): string | null {
  if (!isLocalImport(importPath)) return null;

  let base: string;

  if (importPath.startsWith("@/")) {
    base = `src/${importPath.slice(2)}`;
  } else if (importPath.startsWith("~/")) {
    base = importPath.slice(2);
  } else {
    const dir = fromFile.includes("/")
      ? fromFile.split("/").slice(0, -1).join("/")
      : "";
    base = joinPosix(dir, importPath);
  }

  base = base.replace(/\/\.\//g, "/").replace(/^\.\//, "");

  if (fileSet.has(base)) return base;

  const exts = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs", ".cjs"];
  for (const ext of exts) {
    if (fileSet.has(base + ext)) return base + ext;
  }

  for (const ext of exts) {
    const idx = `${base}/index${ext}`;
    if (fileSet.has(idx)) return idx;
  }

  return null;
}

function joinPosix(dir: string, rel: string): string {
  const parts = dir ? dir.split("/") : [];
  for (const seg of rel.split("/")) {
    if (seg === "..") {
      parts.pop();
    } else if (seg !== ".") {
      parts.push(seg);
    }
  }
  return parts.join("/");
}
