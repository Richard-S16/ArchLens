import { AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ElementType } from "react";
import type { InsightVariant, InsightCategory } from "@/types/analysis";

export const VARIANT_CONFIG: Record<
  InsightVariant,
  { icon: ElementType; border: string; badge: string; iconColor: string }
> = {
  danger: {
    icon: AlertCircle,
    border: "border-red-500/25",
    badge: "bg-red-500/10 text-red-800 border-red-500/25",
    iconColor: "text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/25",
    badge: "bg-amber-500/10 text-amber-900 border-amber-500/25",
    iconColor: "text-amber-900",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/25",
    badge: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25",
    iconColor: "text-emerald-800",
  },
  info: {
    icon: Info,
    border: "border-(--al-blue)/25",
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
