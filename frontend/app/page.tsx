"use client";

import Sidebar from "../components/Sidebar";
import UploadStep from "../components/steps/UploadStep";
import PreprocessStep from "../components/steps/PreprocessStep";
import SplitStep from "../components/steps/SplitStep";
import ModelStep from "../components/steps/ModelStep";
import ResultsStep from "../components/steps/ResultsStep";
import { usePipelineStore } from "../store/usePipelineStore";

export default function Home() {
  const { currentStep } = usePipelineStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <UploadStep />;
      case 2:
        return <PreprocessStep />;
      case 3:
        return <SplitStep />;
      case 4:
        return <ModelStep />;
      case 5:
        return <ResultsStep />;
      default:
        return <UploadStep />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header / Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between shadow-sm z-10">
           <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                Step {currentStep} of 5
           </h2>
           <div className="flex items-center gap-2 text-sm text-slate-400">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               System Ready
           </div>
        </header>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             <div className="relative z-0 max-w-5xl mx-auto py-8">
                {renderStep()}
             </div>
        </div>
      </main>
    </div>
  );
}