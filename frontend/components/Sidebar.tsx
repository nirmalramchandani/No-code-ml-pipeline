"use client";

import { usePipelineStore } from "../store/usePipelineStore";
import { clsx } from "clsx";

const STEPS = [
  { id: 1, label: "Upload Data" },
  { id: 2, label: "Preprocess" },
  { id: 3, label: "Split Data" },
  { id: 4, label: "Select Model" },
  { id: 5, label: "Results" },
];

export default function Sidebar() {
  const { currentStep, setStep } = usePipelineStore();

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-lg border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          ML Pipeline
        </h1>
        <p className="text-xs text-slate-400 mt-1">No-Code Platform</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-4 space-y-2">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => setStep(step.id)} // In a real app, might restrict jumping ahead
                disabled={!isCompleted && !isActive && step.id > currentStep}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-indigo-500/20 shadow-md" 
                    : isCompleted 
                      ? "text-indigo-300 hover:bg-slate-800" 
                      : "text-slate-500 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <div 
                  className={clsx(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs border transition-colors",
                    isActive 
                      ? "border-current bg-white/20" 
                      : isCompleted 
                        ? "border-indigo-400 bg-indigo-900/50 text-indigo-300" 
                        : "border-slate-600 bg-transparent text-slate-600"
                  )}
                >
                  {isCompleted ? "✓" : step.id}
                </div>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        User: Agentic User
      </div>
    </aside>
  );
}
