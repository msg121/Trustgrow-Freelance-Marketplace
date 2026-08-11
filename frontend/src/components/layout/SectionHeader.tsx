import React, { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
        {description && <p className="text-slate-400 mt-2 text-lg">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
