import { create } from 'zustand';

export interface DatasetInfo {
  filename: string;
  columnNames: string[];
  totalRows: number;
}

export interface TargetInfo {
  targetColumn: string;
  uniqueValues: number;
  rows: number;
}

export interface PipelineConfig {
  preprocess: string;
  splitRatio: number;
  model: string;
}

interface PreprocessStats {
  strategy: string;
  featuresUsed: string[];
  rows: number;
}

interface SplitInfo {
  splitRatio: number;
  trainRows: number;
  testRows: number;
}

interface PipelineState {
  currentStep: number;
  datasetInfo: DatasetInfo | null;
  targetInfo: TargetInfo | null;
  splitInfo: SplitInfo | null;
  config: PipelineConfig;
  isPreprocessed: boolean;
  preprocessStats: PreprocessStats | null;
  
  setStep: (step: number) => void;
  setDatasetInfo: (info: DatasetInfo | null) => void;
  setTargetInfo: (info: TargetInfo | null) => void;
  setSplitInfo: (info: SplitInfo | null) => void;
  updateConfig: (partialConfig: Partial<PipelineConfig>) => void;
  setPreprocessed: (status: boolean, stats?: PreprocessStats | null) => void;
  reset: () => void;
}

const DEFAULT_CONFIG: PipelineConfig = {
  preprocess: 'standardization',
  splitRatio: 0.7,
  model: 'logistic_regression',
};

export const usePipelineStore = create<PipelineState>((set) => ({
  currentStep: 1,
  datasetInfo: null,
  targetInfo: null,
  splitInfo: null,
  config: DEFAULT_CONFIG,
  isPreprocessed: false,
  preprocessStats: null,

  setStep: (step) => set({ currentStep: step }),
  setDatasetInfo: (info) => set({ datasetInfo: info }),
  setTargetInfo: (info) => set({ targetInfo: info }),
  setSplitInfo: (info) => set({ splitInfo: info }),
  updateConfig: (partialConfig) => 
    set((state) => ({ 
      config: { ...state.config, ...partialConfig } 
    })),
  setPreprocessed: (status, stats = null) => set({ isPreprocessed: status, preprocessStats: stats }),
  reset: () => set({ 
    currentStep: 1, 
    datasetInfo: null, 
    targetInfo: null,
    splitInfo: null,
    config: DEFAULT_CONFIG,
    isPreprocessed: false,
    preprocessStats: null
  }),
}));
