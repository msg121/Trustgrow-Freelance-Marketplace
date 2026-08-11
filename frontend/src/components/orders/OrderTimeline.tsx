import React from "react";
import { Check, X, AlertTriangle } from "lucide-react";

interface OrderTimelineProps {
  currentState: number; // 0 to 5
}

export function OrderTimeline({ currentState }: OrderTimelineProps) {
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
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-800 rounded-full"></div>
        
        {/* Active Line */}
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-all duration-700 ease-in-out ${
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
          if (isCurrent) bgColor = "bg-slate-900 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.5)]";
          
          if (isDisputed && index <= activeStep) bgColor = "bg-amber-500 border-amber-500 text-white";
          if (isCancelled && index === 0) bgColor = "bg-rose-500 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]";

          return (
            <div key={step.state} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center transition-all duration-500 ${bgColor}`}
              >
                {isCancelled && index === 0 ? (
                  <X className="w-5 h-5" />
                ) : isCompleted && step.state !== 4 && step.state !== 5 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="absolute top-12 w-28 text-center">
                <span className={`text-sm font-semibold transition-colors duration-300 ${isCurrent || isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {(isCancelled || isDisputed) && (
        <div className="mt-16 p-5 rounded-2xl border bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-lg">
          {isCancelled && (
            <div className="flex flex-col items-center text-rose-400">
              <X className="w-8 h-8 mb-2 opacity-80" />
              <p className="font-bold text-lg text-rose-300">Order Cancelled</p>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">This order was cancelled. Escrowed funds have been safely returned to the client.</p>
            </div>
          )}
          {isDisputed && (
            <div className="flex flex-col items-center text-amber-400">
              <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
              <p className="font-bold text-lg text-amber-300">Order Disputed</p>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">This order is currently under dispute. A platform administrator will review the evidence and resolve it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
