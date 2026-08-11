import React, { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}

export function PageContainer({ 
  children, 
  className = "", 
  maxWidth = "7xl" 
}: PageContainerProps) {
  const maxWidthClass = {
    "sm": "max-w-sm",
    "md": "max-w-md",
    "lg": "max-w-lg",
    "xl": "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
    "full": "w-full",
  }[maxWidth];

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full ${maxWidthClass} ${className}`}>
      {children}
    </div>
  );
}
