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
      className="flex items-center gap-[5px] cursor-pointer rounded-[10px] py-[5px] px-[10px] text-[11px] font-semibold font-sans backdrop-blur-[14px] shadow-[0_4px_16px_oklch(0_0_0/30%)] transition-all duration-150"
      style={{
        background: active
          ? `color-mix(in oklch, ${activeColor} 18%, oklch(0.10 0.014 260))`
          : "oklch(0.10 0.014 260 / 94%)",
        border: `1px solid ${active ? `color-mix(in oklch, ${activeColor} 38%, transparent)` : "oklch(1 0 0 / 9%)"}`,
        color: active ? activeColor : "oklch(0.52 0.03 260)",
      }}
    >
      {icon}
      {label}
      {count !== null && count > 0 && (
        <span
          className="text-[9px] font-bold font-mono rounded py-px px-[5px]"
          style={{
            background: active
              ? `color-mix(in oklch, ${activeColor} 25%, transparent)`
              : "oklch(0.18 0.015 260)",
            color: active ? activeColor : "oklch(0.52 0.03 260)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
