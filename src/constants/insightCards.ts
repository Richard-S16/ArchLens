import { AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ElementType } from "react";
import type { InsightVariant, InsightCategory } from "@/types/analysis";

export const VARIANT_CONFIG: Record<
  InsightVariant,
  { icon: ElementType; border: string; glow: string; badge: string; iconColor: string }
> = {
  danger: {
    icon: AlertCircle,
    border: "border-red-500/25",
    glow: "shadow-red-900/20",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
    iconColor: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/25",
    glow: "shadow-amber-900/20",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    iconColor: "text-amber-400",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/25",
    glow: "shadow-emerald-900/20",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    iconColor: "text-emerald-400",
  },
  info: {
    icon: Info,
    border: "border-(--al-blue)/25",
    glow: "shadow-(--al-blue)/10",
    badge: "bg-(--al-blue)/15 text-(--al-blue) border-(--al-blue)/25",
    iconColor: "text-(--al-blue)",
  },
};

export const CATEGORY_LABELS: Record<InsightCategory, string> = {
  coupling: "Coupling",
  performance: "Performance",
  maintainability: "Maintainability",
  scalability: "Scalability",
  structure: "Structure",
  dependencies: "Dependencies",
  architecture: "Architecture",
};

export const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
