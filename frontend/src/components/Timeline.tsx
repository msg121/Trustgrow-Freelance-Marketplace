import React from "react";
import { Check } from "lucide-react";

interface TimelineProps {
  currentState: number; // 0 to 5
}

export default function Timeline({ currentState }: TimelineProps) {
  // We handle Cancelled (4) and Disputed (5) as special terminal states 
  // that don't fit linearly, but we show them alongside the main flow.
  
  const steps = [
    { state: 0, label: "Created" },
    { state: 1, label: "Accepted" },
    { state: 2, label: "Submitted" },
    { state: 3, label: "Completed" },
  ];

  const isCancelled = currentState === 4;
  const isDisputed = currentState === 5;
  const activeStep = isCancelled ? 0 : isDisputed ? 2 : currentState;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full"></div>
        
        {/* Active Line */}
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-500 ${
            isCancelled ? "bg-rose-500 w-0" : 
            isDisputed ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index <= activeStep && !isCancelled;
          const isCurrent = index === activeStep && !isCancelled && !isDisputed;
          
          let bgColor = "bg-slate-900 border-slate-700 text-slate-500";
          if (isCompleted) bgColor = "bg-indigo-500 border-indigo-500 text-white";
          if (isCurrent) bgColor = "bg-slate-900 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)]";
          
          if (isDisputed && index <= activeStep) bgColor = "bg-amber-500 border-amber-500 text-white";
          if (isCancelled && index === 0) bgColor = "bg-rose-500 border-rose-500 text-white";

          return (
            <div key={step.state} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${bgColor}`}
              >
                {isCompleted && step.state !== 4 && step.state !== 5 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <div className="absolute top-10 w-24 text-center">
                <span className={`text-xs font-medium ${isCurrent || isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {(isCancelled || isDisputed) && (
        <div className="mt-12 p-4 rounded-xl border bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-center">
          {isCancelled && (
            <div className="text-rose-400 border-rose-500/20">
              <p className="font-bold">Order Cancelled</p>
              <p className="text-sm text-slate-400 mt-1">This order was cancelled and funds were refunded.</p>
            </div>
          )}
          {isDisputed && (
            <div className="text-amber-400 border-amber-500/20">
              <p className="font-bold">Order Disputed</p>
              <p className="text-sm text-slate-400 mt-1">This order is under dispute and awaiting resolution.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
