import { useState } from "react";
import { Link } from "react-router-dom";
import { FileDown } from "lucide-react";
import DeclarationTable from "../components/DeclarationTable";
import DownloadButton from "../components/DownloadButton";
import { errorMessage, generateExcel } from "../services/excelApi";
import { useCvStore } from "../store/useCvStore";

export default function DeclarationPage() {
  const { upload, declaration, generatedFile, setGeneratedFile } = useCvStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!declaration || !upload) {
    return (
      <div className="card card-center">
        <h2>Aucune déclaration à afficher</h2>
        <p className="muted">
          Importez d'abord un planning pour calculer la déclaration.
        </p>
        <Link to="/upload" className="btn btn-primary">
          Importer un planning
        </Link>
      </div>
    );
  }

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      setGeneratedFile(await generateExcel(upload));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="row row-between">
        <div className="page-head">
          <h1>Déclaration CV - {declaration.week}</h1>
          <p className="muted">
            Vérifiez les valeurs avant de générer le fichier Excel.
          </p>
        </div>
        <div className="row">
          <button
            className="btn btn-ghost"
            onClick={generate}
            disabled={loading}
          >
            <FileDown size={16} />
            {loading ? "Génération..." : "Générer Excel"}
          </button>
          {generatedFile && <DownloadButton filename={generatedFile} />}
        </div>
      </div>
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
      {declaration.warnings?.map((w) => (
        <p key={w} className="alert alert-warn">
          {w}
        </p>
      ))}
      <DeclarationTable data={declaration} />
    </div>
  );
}
