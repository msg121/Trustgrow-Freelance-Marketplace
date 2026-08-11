import React, { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  variant?: "default" | "highlight";
}

export function StatCard({ title, value, icon, subtitle, variant = "default" }: StatCardProps) {
  const isHighlight = variant === "highlight";
  
  return (
    <Card 
      className={isHighlight ? "bg-indigo-900/20 border-indigo-500/20" : ""}
      padding="lg"
    >
      <div className={`flex items-center mb-4 ${isHighlight ? "text-indigo-400" : "text-slate-400"}`}>
        <div className="mr-3">{icon}</div>
        <span className="font-semibold text-sm uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-3xl font-bold truncate ${isHighlight ? "text-indigo-300" : "text-white"}`}>
        {value}
      </div>
      {subtitle && (
        <p className={`text-xs mt-2 ${isHighlight ? "text-indigo-400/60" : "text-slate-500"}`}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}
