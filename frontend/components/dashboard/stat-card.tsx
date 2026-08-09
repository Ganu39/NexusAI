import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "indigo",
}: StatCardProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "border-indigo-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
  };

  const style = colorMap[color] || colorMap.indigo;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.bg} ${style.text} border ${style.border}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
