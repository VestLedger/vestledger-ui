import { BarChart3, Layers, Users, type LucideIcon } from "lucide-react";

export const WATERFALL_CHART_OPTIONS: Array<{
  id: "waterfall" | "scenario" | "lp";
  label: string;
  icon: LucideIcon;
}> = [
  { id: "waterfall", label: "Waterfall Flow", icon: BarChart3 },
  { id: "scenario", label: "Scenario Comparison", icon: Layers },
  { id: "lp", label: "LP Detail", icon: Users },
];
