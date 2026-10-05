import axios from "axios";
import type { Analysis, Declaration, UploadResult } from "../types/excel";

const api = axios.create({ baseURL: "/api" });

export const errorMessage = (e: unknown) =>
  axios.isAxiosError(e)
    ? (e.response?.data?.message ?? "Le serveur est injoignable.")
    : "Erreur inattendue.";

export const uploadPlanning = async (file: File): Promise<UploadResult> => {
  const form = new FormData();
  form.append("file", file);
  return (await api.post("/excel/upload", form)).data;
};
export const analyzePlanning = async (r: UploadResult): Promise<Analysis> =>
  (await api.post("/excel/analyze", r)).data.data;
export const transformPlanning = async (
  r: UploadResult,
): Promise<Declaration> => (await api.post("/excel/transform", r)).data.data;
export const generateExcel = async (r: UploadResult): Promise<string> =>
  (await api.post("/excel/generate", r)).data.filename;
export const downloadUrl = (filename: string) =>
  `/api/excel/download/${encodeURIComponent(filename)}`;
