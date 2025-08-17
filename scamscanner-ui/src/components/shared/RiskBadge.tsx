import React from "react";
import { RiskLevel } from "@/types";

const colorByRisk: Record<RiskLevel, string> = {
  [RiskLevel.Low]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  [RiskLevel.Medium]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  [RiskLevel.High]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  [RiskLevel.VeryHigh]: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  [RiskLevel.Unknown]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function RiskBadge({ level, className = "" }: { level: RiskLevel; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorByRisk[level]} ${className}`}>
      {level}
    </span>
  );
}

