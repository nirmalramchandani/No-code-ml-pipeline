"use client";

import { usePipelineStore } from "../../store/usePipelineStore";
import { useState, useEffect } from "react";

export default function ResultsStep() {
  const { setStep, reset } = usePipelineStore();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
      const stored = localStorage.getItem("trainingResults");
      if (stored) {
          setResults(JSON.parse(stored));
      }
  }, []);

  const handleRestart = () => {
      reset();
      localStorage.removeItem("trainingResults");
      // reset() sets step to 1
  };

  if (!results) {
      return (
          <div className="text-center mt-20 text-slate-400">
              Loading results...
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-8 text-center pb-12">
        <div className="space-y-2">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-4xl font-bold text-slate-900">Training Complete!</h2>
             <p className="text-lg text-slate-500">Here is how your model performed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Test Accuracy</h3>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-indigo-600">{(results.accuracy * 100).toFixed(1)}%</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                    Performance on unseen data.
                </p>
                
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${results.accuracy * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Train Accuracy</h3>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-slate-700">{(results.trainAccuracy * 100).toFixed(1)}%</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                    Performance on training data.
                </p>

                 <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="bg-slate-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${results.trainAccuracy * 100}%` }}
                    />
                </div>
            </div>
        </div>

        <div className="pt-8">
            <button 
                onClick={handleRestart}
                className="px-8 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
                Start New Pipeline
            </button>
        </div>
    </div>
  );
}
