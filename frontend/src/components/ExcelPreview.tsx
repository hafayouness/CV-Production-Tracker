import type { Analysis } from "../types/excel";

export default function ExcelPreview({ analysis }: { analysis: Analysis }) {
  const items: [string, string | number][] = [
    ["Semaine", analysis.detectedWeek ?? "Non détectée"],
    ["Projets", analysis.projects.join(", ") || "-"],
    ["Lignes", analysis.rowsCount],
    ["Références", analysis.references.length],
  ];
  return (
    <dl className="grid-4">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
      <div className="full">
        <dt>Feuilles détectées</dt>
        <dd>
          {analysis.sheets.map((s) => (
            <span key={s.name} className="tag">
              {s.name}
            </span>
          ))}
        </dd>
      </div>
      {analysis.missingDays.length > 0 && (
        <p className="alert alert-warn full">
          Colonnes de jours absentes : {analysis.missingDays.join(", ")}
        </p>
      )}
    </dl>
  );
}
