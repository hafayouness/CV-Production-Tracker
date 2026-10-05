import ExcelJS from "exceljs";
import path from "node:path";
import mapping from "../config/mapping.js";
import {
  normalize,
  cellValue,
  toNumber,
  httpError,
  dailyL160,
} from "../utils/excelUtils.js";

export async function loadWorkbook(filePath) {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(filePath);
  } catch (error) {
    console.error("Erreur lecture Excel :", error);
    throw httpError(400, "Fichier Excel illisible ou corrompu.");
  }
  return wb;
}

export const detectWeek = (fileName = "") =>
  (fileName.match(/W\d{2}/i)?.[0] || "").toUpperCase() || null;

function headerKey(value) {
  return normalize(value).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function matchesHeader(value, variants) {
  const normalized = headerKey(value);
  return variants.some((variant) => normalized === headerKey(variant));
}

function detectL160Header(sheet) {
  const maxRows = Math.min(30, sheet.rowCount);
  for (let rowNumber = 1; rowNumber <= maxRows; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const columns = [];
    row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
      const value = cellValue(cell);
      if (value === null || value === undefined || String(value).trim() === "")
        return;
      columns.push({ column: columnNumber, value, key: headerKey(value) });
    });
    const project = columns.find((i) =>
      matchesHeader(i.value, ["Project", "Projet"]),
    );
    const cpn = columns.find((i) => matchesHeader(i.value, ["CPN", "Cpn"]));
    const workplace = columns.find((i) =>
      matchesHeader(i.value, [
        "Workplace",
        "Work Place",
        "Workplace Name",
        "Poste",
      ]),
    );
    const fg = columns.find((i) => matchesHeader(i.value, ["FG", "F.G."]));
    const planned = columns.filter((i) =>
      matchesHeader(i.value, ["Planned", "Plan"]),
    );
    const produced = columns.filter((i) =>
      matchesHeader(i.value, ["Produced", "Production", "Produit"]),
    );
    if (
      project &&
      cpn &&
      workplace &&
      planned.length >= 6 &&
      produced.length >= 6
    ) {
      return {
        headerRow: rowNumber,
        columns,
        projectColumn: project.column,
        cpnColumn: cpn.column,
        workplaceColumn: workplace.column,
        fgColumn: fg?.column ?? null,
        plannedColumns: planned.map((i) => i.column).sort((a, b) => a - b),
        producedColumns: produced.map((i) => i.column).sort((a, b) => a - b),
      };
    }
  }
  throw httpError(422, "Feuille L160 : impossible de détecter les colonnes.");
}

function buildDayColumns(headerInfo) {
  const { plannedColumns, producedColumns } = headerInfo;
  const requiredDays = mapping.dayKeys.length;
  if (plannedColumns.length < requiredDays) {
    throw httpError(
      422,
      `Feuille L160 : ${requiredDays} colonnes Planned nécessaires.`,
    );
  }
  if (producedColumns.length < requiredDays) {
    throw httpError(
      422,
      `Feuille L160 : ${requiredDays} colonnes Produced nécessaires.`,
    );
  }
  const days = {};
  mapping.dayKeys.forEach((day, index) => {
    const producedCol = producedColumns[index];
    days[day] = {
      planned: plannedColumns[index],
      produced: producedCol,
      dailyL160: producedCol + 1,
    };
  });
  return days;
}

function readQuantity(sheet, rowNumber, columnNumber) {
  if (!columnNumber) return 0;
  const cell = sheet.getRow(rowNumber).getCell(columnNumber);
  return toNumber(cellValue(cell)) ?? 0;
}

function isNumericLikeWorkplace(value) {
  if (value === null || value === undefined) return true;
  const str = String(value).trim();
  if (str === "") return true;
  return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str);
}

function detectSynthesisStartRow(sheet, headerRow) {
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    let hasProject = false,
      hasFamilly = false,
      hasDay = false;
    row.eachCell({ includeEmpty: false }, (cell) => {
      const v = headerKey(cellValue(cell));
      if (v === "project") hasProject = true;
      if (v === "familly" || v === "family") hasFamilly = true;
      if (["monday", "tuesday", "wednesday"].includes(v)) hasDay = true;
    });
    if (hasProject && (hasFamilly || hasDay)) return r;
  }
  return sheet.rowCount + 1;
}

/**
 * ✅ LIT LE BLOC DE SYNTHÈSE (L227 → L242 dans ton fichier)
 * Retourne Map : "Familly" → { monday, tuesday, ..., saturday }
 */
function readSynthesisBlock(sheet, synthesisStartRow) {
  const result = new Map();
  if (!synthesisStartRow || synthesisStartRow > sheet.rowCount) return result;

  // 1. Trouver la ligne d'en-tête (contient "Familly" ou "Monday")
  let headerRow = null;
  for (
    let r = synthesisStartRow;
    r <= Math.min(synthesisStartRow + 10, sheet.rowCount);
    r++
  ) {
    const row = sheet.getRow(r);
    let hasFamilly = false,
      hasMonday = false;
    row.eachCell({ includeEmpty: false }, (cell) => {
      const v = headerKey(cellValue(cell));
      if (v === "familly" || v === "family") hasFamilly = true;
      if (v === "monday" || v === "lundi") hasMonday = true;
    });
    if (hasFamilly || hasMonday) {
      headerRow = r;
      break;
    }
  }
  if (!headerRow) return result;

  // 2. Repérer les colonnes
  const headerRowObj = sheet.getRow(headerRow);
  let famillyCol = null,
    firstDayCol = null;
  headerRowObj.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const v = headerKey(cellValue(cell));
    if (v === "familly" || v === "family") famillyCol = colNumber;
    if (!firstDayCol && ["monday", "lundi"].includes(v))
      firstDayCol = colNumber;
  });
  if (!famillyCol || !firstDayCol) return result;

  // 3. Colonnes des 6 jours = firstDayCol, firstDayCol+1, ..., firstDayCol+5
  const dayCols = {};
  mapping.dayKeys.forEach((day, i) => {
    dayCols[day] = firstDayCol + i;
  });

  // 4. Parcours des lignes de données
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const familly = String(cellValue(row.getCell(famillyCol)) ?? "").trim();
    if (!familly) continue;
    const values = {};
    for (const day of mapping.dayKeys) {
      values[day] = toNumber(cellValue(row.getCell(dayCols[day])));
    }
    if (!result.has(familly)) {
      result.set(familly, values);
    }
  }
  return result;
}

export async function readL160Rows(filePath) {
  const wb = await loadWorkbook(filePath);
  const sheet = wb.worksheets.find(
    (s) => normalize(s.name) === normalize(mapping.sourceSheet),
  );
  if (!sheet)
    throw httpError(422, `Feuille "${mapping.sourceSheet}" introuvable.`);

  const headerInfo = detectL160Header(sheet);
  const { headerRow, projectColumn, cpnColumn, workplaceColumn, fgColumn } =
    headerInfo;
  const days = buildDayColumns(headerInfo);

  let cycleTimeColumn = null;
  const headerRowObject = sheet.getRow(headerRow);
  headerRowObject.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    const value = headerKey(cellValue(cell));
    if (
      ["temps de gamme", "cycle time", "cycle time (s)", "gamme"].includes(
        value,
      )
    ) {
      cycleTimeColumn = columnNumber;
    }
  });

  // ✅ Détecter la ligne de début du bloc de synthèse
  const synthesisStartRow = detectSynthesisStartRow(sheet, headerRow);
  const lastDataRow = synthesisStartRow - 1;

  // ✅ LIRE LE BLOC DE SYNTHÈSE
  const synthesis = readSynthesisBlock(sheet, synthesisStartRow);

  console.log("\n===== LECTURE L160 =====");
  console.log("headerRow         =", headerRow);
  console.log("lastDataRow       =", lastDataRow);
  console.log("synthesisStartRow =", synthesisStartRow);
  console.log("synthesis.size    =", synthesis.size);
  console.log("synthesis keys    =", [...synthesis.keys()]);
  console.log(
    "Carrousel_HRC2 Jeudi    =",
    synthesis.get("Carrousel_HRC2")?.thursday,
  );
  console.log(
    "Carrousel_HRC2 Vendredi =",
    synthesis.get("Carrousel_HRC2")?.friday,
  );
  console.log("========================\n");

  const rows = [];
  const skipped = [];

  for (let rowNumber = headerRow + 1; rowNumber <= lastDataRow; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const project = String(cellValue(row.getCell(projectColumn)) ?? "").trim();
    const cpn = String(cellValue(row.getCell(cpnColumn)) ?? "").trim();
    const workplace = String(
      cellValue(row.getCell(workplaceColumn)) ?? "",
    ).trim();
    if (!cpn || !workplace) continue;
    if (isNumericLikeWorkplace(workplace)) {
      skipped.push({ rowNumber, workplace, cpn, project });
      continue;
    }
    const cycleTime = readQuantity(sheet, rowNumber, cycleTimeColumn);
    const rowDays = {};
    for (const day of mapping.dayKeys) {
      const columns = days[day];
      const planned = readQuantity(sheet, rowNumber, columns.planned);
      const produced = readQuantity(sheet, rowNumber, columns.produced);
      let daily = toNumber(
        cellValue(sheet.getRow(rowNumber).getCell(columns.dailyL160)),
      );
      if (daily === null) daily = dailyL160(planned, produced);
      rowDays[day] = { planned, produced, dailyL160: daily };
    }
    rows.push({
      excelRow: rowNumber,
      project,
      cpn,
      workplace,
      cycleTime,
      days: rowDays,
    });
  }

  console.log(`✅ ${rows.length} lignes détail lues.`);

  return {
    rows,
    synthesis, // ✅✅✅ ESSENTIEL
    sheets: wb.worksheets.map((s) => ({
      name: s.name,
      rows: s.rowCount,
      columns: s.columnCount,
    })),
    headers: headerInfo.columns.map((item) => item.value),
    detected: {
      headerRow,
      lastDataRow,
      synthesisStartRow,
      columns: {
        project: projectColumn,
        cpn: cpnColumn,
        workplace: workplaceColumn,
        fg: fgColumn,
        cycleTime: cycleTimeColumn,
      },
      days,
    },
  };
}

export async function analyzeWorkbook(
  filePath,
  originalName = path.basename(filePath),
) {
  const { rows, sheets, headers, detected } = await readL160Rows(filePath);
  return {
    fileName: originalName,
    sheets,
    rowsCount: rows.length,
    columns: headers,
    missingDays: [],
    detectedWeek: detectWeek(originalName),
    projects: [...new Set(rows.map((row) => row.project).filter(Boolean))],
    references: [...new Set(rows.map((row) => String(row.cpn)))],
    detected,
  };
}
