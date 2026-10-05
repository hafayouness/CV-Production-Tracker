import { create } from "zustand";
import type { Analysis, Declaration, UploadResult } from "../types/excel";

interface State {
  upload: UploadResult | null;
  analysis: Analysis | null;
  declaration: Declaration | null;
  generatedFile: string | null;
  setUpload: (u: UploadResult | null) => void;
  setAnalysis: (a: Analysis | null) => void;
  setDeclaration: (d: Declaration | null) => void;
  setGeneratedFile: (f: string | null) => void;
  reset: () => void;
}

export const useCvStore = create<State>((set) => ({
  upload: null,
  analysis: null,
  declaration: null,
  generatedFile: null,
  setUpload: (upload) =>
    set({ upload, analysis: null, declaration: null, generatedFile: null }),
  setAnalysis: (analysis) => set({ analysis }),
  setDeclaration: (declaration) => set({ declaration, generatedFile: null }),
  setGeneratedFile: (generatedFile) => set({ generatedFile }),
  reset: () =>
    set({
      upload: null,
      analysis: null,
      declaration: null,
      generatedFile: null,
    }),
}));
