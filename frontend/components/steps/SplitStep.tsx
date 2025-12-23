"use client";

import { usePipelineStore } from "../../store/usePipelineStore";
import { clsx } from "clsx";
import { useState } from "react";

export default function SplitStep() {
  const { config, updateConfig, setStep, setSplitInfo, splitInfo, targetInfo } = usePipelineStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!targetInfo?.targetColumn) {
      return (
          <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 animate-fade-in">
              <div className="p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 shadow-sm">
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-bold">Target Column Not Selected</h3>
                  <p className="mt-2 text-yellow-700">
                      You must select a target column (the value you want to predict) before splitting the data.
                  </p>
              </div>
              <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
              >
                  ← Go Back to Select Target
              </button>
          </div>
      );
  }

  const handleSplit = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch("/api/split", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ splitRatio: config.splitRatio }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Split failed");
        }

        const data = await res.json();
        setSplitInfo(data);
        setStep(4); // Move to Model
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to split data");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pt-8">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Train-Test Split</h2>
            <p className="text-slate-500">
                Divide your data into training and testing sets.
            </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>Train Ratio: {(config.splitRatio * 100).toFixed(0)}%</span>
                    <span>Test Ratio: {((1 - config.splitRatio) * 100).toFixed(0)}%</span>
                </div>
                <input
                    type="range"
                    min="0.5"
                    max="0.9"
                    step="0.1"
                    value={config.splitRatio}
                    onChange={(e) => updateConfig({ splitRatio: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-center">
                    <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Training Set</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{(config.splitRatio * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Testing Set</p>
                    <p className="text-2xl font-bold text-slate-600 mt-1">{((1 - config.splitRatio) * 100).toFixed(0)}%</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <button
                onClick={handleSplit}
                disabled={loading}
                className={clsx(
                    "w-full py-3 bg-indigo-600 text-white rounded-lg font-medium transition-all shadow-lg hover:bg-indigo-700",
                    loading && "opacity-70 cursor-wait"
                )}
            >
                {loading ? "Splitting Data..." : "Apply Split →"}
            </button>
        </div>
    </div>
  );
}
