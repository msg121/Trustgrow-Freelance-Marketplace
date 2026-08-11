import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  fullHeight?: boolean;
}

export function LoadingSpinner({ 
  message = "Loading...", 
  className = "",
  fullHeight = false
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? "min-h-[60vh]" : "py-20"} ${className}`}>
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
      {message && <p className="text-slate-400 font-medium animate-pulse">{message}</p>}
    </div>
  );
}
