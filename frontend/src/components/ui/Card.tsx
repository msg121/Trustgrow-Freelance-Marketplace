import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverEffect?: boolean;
}

export function Card({ 
  children, 
  className = "", 
  padding = "md",
  hoverEffect = false 
}: CardProps) {
  const paddingClass = {
    "none": "p-0",
    "sm": "p-4",
    "md": "p-6",
    "lg": "p-8",
  }[padding];

  const hoverClass = hoverEffect 
    ? "hover:border-slate-700 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.05)]" 
    : "";

  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl ${paddingClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
