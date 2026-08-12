import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-24 px-4 bg-slate-900/60 rounded-3xl border border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.05)] text-center ${className}`}>
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-extrabold text-white mb-3">{title}</h3>
      <p className="text-blue-100/80 max-w-md mx-auto mb-8 leading-relaxed font-medium">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
