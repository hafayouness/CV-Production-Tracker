import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Declaration } from "../types/excel";

const fmt = (type: string, v: number | null) =>
  v === null
    ? ""
    : type.includes("%")
      ? `${Math.round(v * 100)}%`
      : String(Math.round(v * 100) / 100);

const isDiff = (t: string) => t === "Ecart" || t === "Ecart en %";
const isQty = (t: string) => t === "Objectif" || t === "Qte produite";
const tone = (t: string, v: number | null) =>
  isDiff(t) && v ? (v > 0 ? "pos" : "neg") : isQty(t) && v === 0 ? "zero" : "";

function Value({ type, v }: { type: string; v: number | null }) {
  if (type === "L160%" && v !== null) {
    const level = v >= 0.9 ? "ok" : v >= 0.7 ? "mid" : "low";
    return <span className={`pill pill-${level}`}>{fmt(type, v)}</span>;
  }
  return <>{fmt(type, v)}</>;
}

export default function DeclarationTable({ data }: { data: Declaration }) {
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("all");

  const blocks = useMemo(
    () =>
      data.projects
        .filter((p) => project === "all" || p.name === project)
        .flatMap((p) => p.carousels.map((c) => ({ project: p.name, ...c })))
        .filter((c) =>
          `${c.project} ${c.name} ${c.references.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [data, query, project],
  );

  return (
    <div className="panel">
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un carrousel ou une référence"
          />
        </label>
        <select
          className="select"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="all">Tous les projets</option>
          {data.projects.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
        <span className="count">{blocks.length} carrousel(s)</span>
      </div>
      <div className="table-wrap">
        <table className="decl">
          <thead>
            <tr>
              <th>Projet</th>
              <th>
                <span className="count">
                  {blocks.length} carrousel{blocks.length > 1 ? "s" : ""}
                </span>
              </th>
              <th>Type</th>
              {data.days.map((d) => (
                <th key={d}>{data.dayLabels[d]}</th>
              ))}
              <th>Cumul</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) =>
              b.lines.map((l, i) => (
                <tr
                  key={`${b.project}-${b.name}-${l.type}`}
                  className={`${i === 0 ? "block-start" : ""} ${l.type === "Objectif" ? "objectif" : ""}`}
                >
                  {i === 0 && (
                    <td rowSpan={b.lines.length} className="project">
                      {b.project}
                    </td>
                  )}
                  {i === 0 && (
                    <td rowSpan={b.lines.length} className="carousel">
                      {b.name}
                    </td>
                  )}
                  <td className="type">{l.type}</td>
                  {data.days.map((d) => (
                    <td key={d} className={`num ${tone(l.type, l.values[d])}`}>
                      <Value type={l.type} v={l.values[d]} />
                    </td>
                  ))}
                  <td className={`cumul ${tone(l.type, l.cumul)}`}>
                    <Value type={l.type} v={l.cumul} />
                  </td>
                </tr>
              )),
            )}
            {!blocks.length && (
              <tr>
                <td colSpan={data.days.length + 4} className="empty">
                  Aucun carrousel ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
