"use client";

import { usePipelineStore } from "../../store/usePipelineStore";
import { clsx } from "clsx";
import { useState } from "react";

export default function ModelStep() {
  const { config, updateConfig, setStep } = usePipelineStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch("/api/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: config.model }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Training failed");
        }

        const data = await res.json();
        // Assuming we store results somewhere or just pass to next step?
        // Let's assume Results step fetches or we pass info.
        // Actually, store might need a 'setResults' but I didn't verify that in usePipelineStore.
        // Let's check usePipelineStore.ts content I restored.
        // It does NOT have 'results'. 
        // I should probably add 'results' to the store if I want to display them in step 5.
        // Or I can pass them via query param?
        // Let's just update the store to include results later. 
        // For now, I'll store it in localStorage or just assume the store has it (I'll need to patch store if not).
        // Wait, I WROTE usePipelineStore.ts. It has datasetInfo, targetInfo, splitInfo, preprocessStats. NO results.
        // I will need to patch usePipelineStore.ts to add 'results'.
        
        // I'll make a quick patch to the store OR I'll handle it by storing in localStorage for now to avoid breaking the file I just wrote.
        // Actually, updating the store definition is better.
        // I'll assume I update it.
        localStorage.setItem("trainingResults", JSON.stringify(data));
        
        setStep(5);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to train model");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-8">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Select Model</h2>
            <p className="text-slate-500">
                Choose an algorithm to train on your data.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
                onClick={() => updateConfig({ model: "logistic_regression" })}
                className={clsx(
                    "p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                    config.model === "logistic_regression"
                        ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600/20"
                        : "border-slate-200 hover:border-indigo-300 bg-white"
                )}
            >
                <div className="flex items-center justify-between mb-4">
                     <span className="p-3 bg-white rounded-lg shadow-sm font-bold text-xl text-indigo-600">LR</span>
                     {config.model === "logistic_regression" && <span className="text-indigo-600 font-bold">✓ Selected</span>}
                </div>
                <h3 className="text-xl font-bold text-slate-900">Logistic Regression</h3>
                <p className="mt-2 text-sm text-slate-500">Best for classification tasks where the boundary is linear. Simple and interpretable.</p>
            </button>

            <button
                onClick={() => updateConfig({ model: "decision_tree" })}
                className={clsx(
                    "p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                    config.model === "decision_tree"
                        ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600/20"
                        : "border-slate-200 hover:border-indigo-300 bg-white"
                )}
            >
                <div className="flex items-center justify-between mb-4">
                     <span className="p-3 bg-white rounded-lg shadow-sm font-bold text-xl text-green-600">DT</span>
                     {config.model === "decision_tree" && <span className="text-indigo-600 font-bold">✓ Selected</span>}
                </div>
                <h3 className="text-xl font-bold text-slate-900">Decision Tree</h3>
                <p className="mt-2 text-sm text-slate-500">Captures non-linear relationships by splitting data into branches. Good for complex patterns.</p>
            </button>
        </div>

        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 text-center">
                {error}
            </div>
        )}

        <div className="flex justify-center pt-8">
            <button
                onClick={handleTrain}
                disabled={loading}
                className={clsx(
                    "px-12 py-4 text-lg bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-200",
                    loading ? "opacity-75 cursor-wait" : "hover:bg-indigo-700 hover:shadow-2xl"
                )}
            >
                {loading ? "Training Model..." : "Train Model →"}
            </button>
        </div>
    </div>
  );
}
