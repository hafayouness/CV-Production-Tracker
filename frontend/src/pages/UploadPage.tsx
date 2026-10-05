import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import ExcelPreview from "../components/ExcelPreview";
import ProcessingStatus, { Step } from "../components/ProcessingStatus";
import {
  analyzePlanning,
  errorMessage,
  transformPlanning,
  uploadPlanning,
} from "../services/excelApi";
import { useCvStore } from "../store/useCvStore";

const LABELS = [
  "Import du fichier",
  "Analyse du planning",
  "Calcul de la déclaration",
];

export default function UploadPage() {
  const nav = useNavigate();
  const { upload, analysis, setUpload, setAnalysis, setDeclaration } =
    useCvStore();
  const [progress, setProgress] = useState(-1);
  const [error, setError] = useState("");

  const run = async (file: File) => {
    setError("");
    try {
      setProgress(0);
      const up = await uploadPlanning(file);
      const ref = { fileId: up.fileId, originalName: file.name };
      setUpload(ref);
      setProgress(1);
      setAnalysis(await analyzePlanning(ref));
      setProgress(2);
      setDeclaration(await transformPlanning(ref));
      setProgress(3);
    } catch (e) {
      setError(errorMessage(e));
      setProgress(-1);
    }
  };

  const steps: Step[] = LABELS.map((label, i) => ({
    label,
    state: progress > i ? "done" : progress === i ? "running" : "todo",
  }));
  const busy = progress >= 0 && progress < 3;

  return (
    <div className="narrow stack">
      <div className="page-head">
        <h1>Importer un planning</h1>
        <p className="muted">
          Fichier Excel du planning de production (.xlsx).
        </p>
      </div>
      <FileUpload onFile={run} disabled={busy} />
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
      {progress >= 0 && (
        <div className="card">
          <ProcessingStatus steps={steps} />
        </div>
      )}
      {upload && analysis && (
        <div className="card stack">
          <h2>{upload.originalName}</h2>
          <ExcelPreview analysis={analysis} />
          <div>
            <button
              className="btn btn-primary"
              disabled={progress < 3}
              onClick={() => nav("/declaration")}
            >
              Voir la déclaration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
