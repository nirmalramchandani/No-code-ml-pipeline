"use client";

import { usePipelineStore } from "../../store/usePipelineStore";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import DataPreview from "../Pipeline/DataPreview";

export default function PreprocessStep() {
  const { 
      config, 
      updateConfig, 
      setStep, 
      isPreprocessed, 
      setPreprocessed, 
      preprocessStats,
      datasetInfo,
      targetInfo,
      setTargetInfo
  } = usePipelineStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
      columns: string[];
      rows: any[];
      totalRows: number;
      totalColumns: number;
  } | null>(null);

  // Target Selection State
  const [selectedColumn, setSelectedColumn] = useState<string>(targetInfo?.targetColumn || "");
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState<string | null>(null);

  // Effect: Fetch preview if already processed (e.g. navigating back)
  useEffect(() => {
    if (isPreprocessed && !previewData) {
        fetchProcessedPreview();
    }
  }, [isPreprocessed]);

  useEffect(() => {
      if (targetInfo?.targetColumn) {
          setSelectedColumn(targetInfo.targetColumn);
      }
  }, [targetInfo]);

  const fetchProcessedPreview = async () => {
      try {
          const res = await fetch("/api/preview-processed?limit=50");
          if (!res.ok) throw new Error("Failed to load preview");
          const data = await res.json();
          setPreviewData(data);
      } catch (err) {
          console.error(err);
          setError("Failed to load processed data preview.");
      }
  };

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/preprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preprocess: config.preprocess })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Preprocessing failed");
      }

      const data = await res.json();
      setPreprocessed(true, data); // Store stats
      await fetchProcessedPreview(); // Fetch Table

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to apply preprocessing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
      setLoading(true);
      setError(null);
      try {
          const res = await fetch("/api/revert-preprocess", { method: "POST" });
          if (!res.ok) throw new Error("Revert failed");
          
          setPreprocessed(false, null);
          setPreviewData(null);
      } catch (err: any) {
          console.error(err);
          setError("Failed to revert. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const handleSelectTarget = async () => {
    if (!selectedColumn) return;

    setTargetLoading(true);
    setTargetError(null);

    try {
      const res = await fetch("/api/select-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetColumn: selectedColumn }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to select target");
      }

      const data = await res.json();
      setTargetInfo(data); 
    } catch (err: any) {
      console.error(err);
      setTargetError(err.message || "An unexpected error occurred.");
    } finally {
      setTargetLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Preprocessing & Target</h2>
        <p className="text-slate-500">
            Scale your features and (optionally) select the target column.
        </p>
        
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm inline-block">{error}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Preprocessing Config */}
        <div className="lg:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                    Feature Scaling
                </h3>
                
                {!isPreprocessed ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                        onClick={() => updateConfig({ preprocess: "standardization" })}
                        className={clsx(
                            "p-4 rounded-lg border text-left transition-all hover:shadow-sm",
                            config.preprocess === "standardization"
                            ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600/20"
                            : "border-slate-200 hover:border-indigo-300 bg-white"
                        )}
                        >
                        <div className="font-semibold text-slate-900 mb-1">Standardization</div>
                        <div className="text-xs text-slate-500">Z-Score (0 mean, 1 std)</div>
                        </button>
                
                        <button
                        onClick={() => updateConfig({ preprocess: "normalization" })}
                        className={clsx(
                            "p-4 rounded-lg border text-left transition-all hover:shadow-sm",
                            config.preprocess === "normalization"
                            ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600/20"
                            : "border-slate-200 hover:border-indigo-300 bg-white"
                        )}
                        >
                        <div className="font-semibold text-slate-900 mb-1">Normalization</div>
                        <div className="text-xs text-slate-500">Min-Max [0, 1]</div>
                        </button>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">✓</div>
                             <div>
                                 <p className="font-medium">Data Scaled ({preprocessStats?.strategy})</p>
                                 <p className="text-xs text-green-600">{preprocessStats?.rows} rows processed</p>
                             </div>
                        </div>
                        <button
                            onClick={handleRevert}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm bg-white border border-green-200 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            {loading ? "..." : "Undo"}
                        </button>
                    </div>
                )}

                {!isPreprocessed && (
                    <div className="pt-2">
                        <button
                            onClick={handleApply}
                            disabled={loading}
                            className={clsx(
                                "w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium transition-all shadow-md hover:bg-indigo-700",
                                loading && "opacity-70 cursor-wait"
                            )}
                        >
                            {loading ? "Applying Transformation..." : "Apply Scaling"}
                        </button>
                    </div>
                )}
             </div>

             {/* PREVIEW AREA */}
             {isPreprocessed && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-800 mb-4 text-sm">Processed Data Preview</h3>
                      {previewData ? (
                           <DataPreview 
                                columns={previewData.columns} 
                                rows={previewData.rows} 
                                totalRows={previewData.totalRows} 
                                totalColumns={previewData.totalColumns} 
                           />
                      ) : (
                          <div className="h-40 flex items-center justify-center text-slate-400 text-sm animate-pulse">
                              Loading preview...
                          </div>
                      )}
                  </div>
             )}
        </div>

        {/* RIGHT COLUMN: Target Selection */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                    Target Selection <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </h3>
                
                <p className="text-xs text-slate-500">
                    Select the column you want to predict. You can do this now or later, but it is required before splitting.
                </p>

                <div>
                    <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                        disabled={targetLoading}
                    >
                        <option value="" disabled>-- Select Target --</option>
                        {datasetInfo?.columnNames.map((col) => (
                        <option key={col} value={col}>
                            {col}
                        </option>
                        ))}
                    </select>
                </div>

                {targetError && (
                    <p className="text-xs text-red-600">{targetError}</p>
                )}

                <button
                    onClick={handleSelectTarget}
                    disabled={!selectedColumn || targetLoading || (targetInfo?.targetColumn === selectedColumn)}
                    className={clsx(
                        "w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                        targetInfo?.targetColumn === selectedColumn
                        ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    )}
                >
                    {targetLoading ? "Setting..." : targetInfo?.targetColumn === selectedColumn ? "Target Set ✓" : "Set Target"}
                </button>
            </div>
            
            {/* NEXT BUTTON */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-4">
                 <p className="text-xs text-slate-400">
                     Proceed when you are ready.
                 </p>
                 <button
                    onClick={() => setStep(3)} // Proceed to Split
                    disabled={!isPreprocessed} // Only require preprocessing to move on? Or allow skipping scaling too? Let's enforce scaling for now as per flow.
                    className={clsx(
                        "w-full py-3 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center gap-2",
                        isPreprocessed
                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200" 
                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    )}
                 >
                    Next Step (Split) →
                 </button>
            </div>
        </div>
      
      </div>
    </div>
  );
}
