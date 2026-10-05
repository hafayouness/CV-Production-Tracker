import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFile, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");

  const pick = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx"))
      return setError("Seuls les fichiers .xlsx sont acceptés.");
    setError("");
    onFile(file);
  };

  return (
    <div>
      <div
        className={over ? "dropzone over" : "dropzone"}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) pick(e.dataTransfer.files[0]);
        }}
      >
        <span className="dropzone-icon">
          <UploadCloud size={30} />
        </span>
        <p className="dropzone-title">Déposez le planning de production ici</p>
        <p className="muted">ou</p>
        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          Choisir un fichier
        </button>
        <input
          ref={input}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <p className="hint">Excel .xlsx uniquement</p>
      </div>
      {error && (
        <p
          role="alert"
          className="alert alert-error"
          style={{ marginTop: "var(--space-3)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
