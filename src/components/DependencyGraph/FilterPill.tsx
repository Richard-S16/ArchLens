"use client";

import type { ReactNode } from "react";

export function FilterPill({
  active,
  onClick,
  label,
  count,
  activeColor,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number | null;
  activeColor: string;
  icon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? `color-mix(in oklch, ${activeColor} 18%, oklch(0.10 0.014 260))`
          : "oklch(0.10 0.014 260 / 94%)",
        backdropFilter: "blur(14px)",
        border: `1px solid ${active ? `color-mix(in oklch, ${activeColor} 38%, transparent)` : "oklch(1 0 0 / 9%)"}`,
        borderRadius: 10,
        padding: "5px 10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        color: active ? activeColor : "oklch(0.52 0.03 260)",
        boxShadow: "0 4px 16px oklch(0 0 0 / 30%)",
        transition: "all 0.15s",
        fontFamily: "var(--font-geist-sans, sans-serif)",
      }}
    >
      {icon}
      {label}
      {count !== null && count > 0 && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 5px",
            borderRadius: 4,
            background: active
              ? `color-mix(in oklch, ${activeColor} 25%, transparent)`
              : "oklch(0.18 0.015 260)",
            color: active ? activeColor : "oklch(0.52 0.03 260)",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
