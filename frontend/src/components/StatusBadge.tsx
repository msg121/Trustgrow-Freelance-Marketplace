import React from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Shield, CheckSquare } from "lucide-react";

interface StatusBadgeProps {
  state: number;
}

export default function StatusBadge({ state }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (state) {
      case 0: // Created
        return {
          label: "Created",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 1: // Accepted
        return {
          label: "In Progress",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: <Shield className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 2: // Submitted
        return {
          label: "Under Review",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: <CheckSquare className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 3: // Completed
        return {
          label: "Completed",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 4: // Cancelled
        return {
          label: "Cancelled",
          color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          icon: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 5: // Disputed
        return {
          label: "Disputed",
          color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />,
        };
      default:
        return {
          label: "Unknown",
          color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
