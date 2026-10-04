import ExcelJS from "exceljs";
import path from "node:path";
import mapping from "../config/mapping.js";
import { normalize, cellValue, httpError } from "../utils/excelUtils.js";

export async function loadWorkbook(filePath) {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(filePath);
  } catch {
    throw httpError(400, "Fichier Excel illisible ou corrompu.");
  }
  return wb;
}

/** Trouve la ligne d'en-tête et renvoie { headerRow, index }. */
export function detectColumns(sheet) {
  const limit = Math.min(mapping.headerScanRows, sheet.rowCount);
  for (let r = 1; r <= limit; r++) {
    const labels = {};
    sheet.getRow(r).eachCell((cell, col) => {
      labels[normalize(cellValue(cell))] = col;
    });
    const find = (aliases) =>
      aliases
        .map(normalize)
        .map((a) => labels[a])
        .find(Boolean);
    const index = {
      project: find(mapping.columns.project),
      cpn: find(mapping.columns.cpn),
      lpn: find(mapping.columns.lpn),
      workplace: find(mapping.columns.workplace),
      cycleTime: find(mapping.columns.cycleTime),
      days: Object.fromEntries(
        Object.entries(mapping.columns.days).map(([d, a]) => [d, find(a)]),
      ),
    };
    if (index.project && index.workplace)
      return {
        headerRow: r,
        index,
        labels: Object.keys(labels).filter(Boolean),
      };
  }
  throw httpError(
    422,
    "Colonnes obligatoires (Project, Workplace) introuvables dans la feuille Planning.",
  );
}

export function getPlanningSheet(wb) {
  const sheet = wb.worksheets.find(
    (s) => normalize(s.name) === normalize(mapping.planningSheet),
  );
  if (!sheet)
    throw httpError(422, `Feuille "${mapping.planningSheet}" introuvable.`);
  return sheet;
}

export const detectWeek = (fileName = "") =>
  (fileName.match(/W\d{2}/i)?.[0] || "").toUpperCase() || null;

function extractRows(sheet) {
  const { headerRow, index, labels } = detectColumns(sheet);
  const rows = [];
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const get = (c) => (c ? cellValue(row.getCell(c)) : null);
    const project = String(get(index.project) ?? "").trim();
    if (!project) continue;
    rows.push({
      project,
      cpn: get(index.cpn),
      lpn: get(index.lpn),
      workplace: String(get(index.workplace) ?? "").trim(),
      cycleTime: get(index.cycleTime),
      days: Object.fromEntries(
        Object.keys(index.days).map((d) => [d, get(index.days[d])]),
      ),
    });
  }
  return { rows, index, labels };
}

export async function readPlanningRows(filePath) {
  const wb = await loadWorkbook(filePath);
  return extractRows(getPlanningSheet(wb)).rows;
}

export async function analyzeWorkbook(
  filePath,
  originalName = path.basename(filePath),
) {
  const wb = await loadWorkbook(filePath);
  const { rows, index, labels } = extractRows(getPlanningSheet(wb));
  return {
    fileName: originalName,
    sheets: wb.worksheets.map((s) => ({
      name: s.name,
      rows: s.rowCount,
      columns: s.columnCount,
    })),
    rowsCount: rows.length,
    columns: labels,
    missingDays: Object.entries(index.days)
      .filter(([, c]) => !c)
      .map(([d]) => d),
    detectedWeek: detectWeek(originalName),
    projects: [...new Set(rows.map((r) => r.project))],
    references: [
      ...new Set(
        rows
          .map((r) => r.cpn)
          .filter(Boolean)
          .map(String),
      ),
    ].slice(0, 200),
  };
}
