"use client";

import { useState } from "react";
import { usePipelineStore } from "../../store/usePipelineStore";
import { clsx } from "clsx";

export default function UploadStep() {
  const { setStep, setDatasetInfo } = usePipelineStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload failed");
      }

      const data = await res.json();
      // Auto-fetch preview to get column names and stats
      const previewRes = await fetch("/api/preview-data?limit=1");
      const previewData = await previewRes.json();

      setDatasetInfo({
          filename: data.filename,
          columnNames: previewData.columns,
          totalRows: previewData.totalRows
      });

      setStep(2); // Move to Preprocess
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center pt-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Upload Dataset</h2>
        <p className="text-slate-500">
          Upload a CSV or Excel file to begin building your pipeline.
        </p>
      </div>

      <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-slate-50 transition-all cursor-pointer relative group">
        <input 
            type="file" 
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="space-y-4 pointer-events-none">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-indigo-100 transition-colors">
                 <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                 </svg>
            </div>
            {file ? (
                <div>
                     <p className="text-lg font-medium text-indigo-600">{file.name}</p>
                     <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
            ) : (
                <div>
                     <p className="text-lg font-medium text-slate-700">Click to upload or drag and drop</p>
                     <p className="text-sm text-slate-400">CSV or Excel (Max 5MB)</p>
                </div>
            )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={clsx(
          "w-full py-4 text-lg bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-200",
          loading ? "opacity-75 cursor-wait" : "hover:bg-indigo-700 transform hover:-translate-y-1"
        )}
      >
        {loading ? "Uploading..." : "Start Pipeline →"}
      </button>
    </div>
  );
}
