import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useCvStore } from "../store/useCvStore";

export default function Dashboard() {
  const { upload, analysis, declaration, generatedFile } = useCvStore();
  const stats: [string, string, boolean?][] = [
    ["Semaine", analysis?.detectedWeek ?? "-"],
    ["Projets", analysis ? String(analysis.projects.length) : "-"],
    ["Lignes de planning", analysis ? String(analysis.rowsCount) : "-"],
    [
      "Carrousels",
      declaration
        ? String(
            declaration.projects.reduce((n, p) => n + p.carousels.length, 0),
          )
        : "-",
    ],
  ];
  const rows: [string, string][] = [
    ["Planning importé", upload ? upload.originalName : "Aucun fichier"],
    ["Projets détectés", analysis?.projects.join(", ") || "-"],
    ["Fichier Excel généré", generatedFile ?? "-"],
  ];
  return (
    <div className="stack">
      <section className="hero">
        <h1>Du planning à la déclaration CV</h1>
        <p>
          Importez le planning de production hebdomadaire, vérifiez la
          déclaration calculée, puis téléchargez le fichier Excel prêt à
          l'emploi.
        </p>
        <div className="row">
          <Link to="/upload" className="btn btn-primary">
            Importer un planning
          </Link>
          <Link
            to="/declaration"
            className={declaration ? "btn btn-ghost" : "btn btn-ghost disabled"}
          >
            Voir la déclaration
          </Link>
        </div>
      </section>

      <section className="stats">
        {stats.map(([label, value]) => (
          <div key={label} className="stat">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
        <div className="stat">
          <div className="stat-label">Déclaration</div>
          <div className="stat-value small">
            {declaration ? (
              <span className="badge badge-ok">
                <CheckCircle2 size={14} />
                Prête
              </span>
            ) : (
              <span className="badge badge-idle">Non calculée</span>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Détails</h2>
        <dl className="kv" style={{ marginTop: ".5rem" }}>
          {rows.map(([k, v]) => (
            <div key={k} className="kv-row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
