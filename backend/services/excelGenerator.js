import ExcelJS from "exceljs";
import path from "node:path";

const NAVY = "FF12294A",
  GREY = "FFE8ECF1",
  BLUE_SOFT = "FFDCE6F5";
const thin = { style: "thin", color: { argb: "FFB8C2CF" } };
const border = { top: thin, left: thin, bottom: thin, right: thin };
const fill = (argb) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});
const FIRST_DAY = 4,
  CUMUL = 10,
  ROOT = 13;

/** Reproduit la disposition de la feuille W06 : A projet, B carrousel, C type, D:I jours, J cumul, M root cause. */
export async function generateDeclarationExcel(data, outDir, fileName) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(data.week, {
    views: [{ state: "frozen", ySplit: 2, xSplit: 3 }],
  });
  ws.columns = [
    { width: 14 },
    { width: 28 },
    { width: 14 },
    ...data.days.map(() => ({ width: 11 })),
    { width: 11 },
    { width: 8 },
    { width: 3 },
    { width: 45 },
  ];
  const L = (c) => ws.getColumn(c).letter;

  ws.getCell("D1").value =
    `Suivi de déclaration FG CW ${data.week.replace(/^W/i, "")}`;
  ws.getCell("D1").font = { bold: true, size: 14 };
  const headers = { 3: "Type", 10: "Cumul", 13: "Root cause" };
  data.days.forEach((d, i) => {
    headers[FIRST_DAY + i] = data.dayLabels[d];
  });
  Object.entries(headers).forEach(([c, h]) => {
    const cell = ws.getCell(2, Number(c));
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = fill(NAVY);
    cell.alignment = { horizontal: "center" };
    cell.border = border;
  });

  let r = 3;
  for (const project of data.projects) {
    const projectStart = r;
    for (const car of project.carousels) {
      const [o, p, e, pc, l] = [r, r + 1, r + 2, r + 3, r + 4];
      car.lines.forEach((line, i) => {
        const row = ws.getRow(r + i);
        row.getCell(3).value = line.type;
        data.days.forEach((d, k) => {
          const c = row.getCell(FIRST_DAY + k),
            cl = L(FIRST_DAY + k);
          if (line.type === "Ecart")
            c.value = { formula: `IF(${cl}${p}=0,"-",${cl}${p}-${cl}${o})` };
          else if (line.type === "Ecart en %")
            c.value = { formula: `IFERROR(${cl}${e}/${cl}${o},"")` };
          else c.value = line.values[d];
        });
        const j = row.getCell(CUMUL),
          a = L(FIRST_DAY),
          b = L(FIRST_DAY + data.days.length - 1),
          jl = L(CUMUL);
        if (line.type === "Objectif" || line.type === "Qte produite")
          j.value = { formula: `SUM(${a}${r + i}:${b}${r + i})` };
        if (line.type === "Ecart")
          j.value = { formula: `IF(${jl}${p}=0,"-",${jl}${p}-${jl}${o})` };
        if (line.type === "Ecart en %")
          j.value = { formula: `IFERROR(${jl}${e}/${jl}${o},"")` };
        for (let c = 1; c <= CUMUL; c++) {
          const cell = row.getCell(c);
          cell.border = border;
          if (c >= FIRST_DAY) {
            cell.alignment = { horizontal: "center" };
            cell.numFmt = /%/.test(line.type) ? "0%" : "0";
          }
          if (line.type === "Objectif") cell.fill = fill(BLUE_SOFT);
        }
        row.getCell(CUMUL).font = { bold: true };
      });
      ws.mergeCells(o, 2, l, 2);
      ws.mergeCells(o, ROOT, l, ROOT);
      Object.assign(ws.getCell(o, 2), {
        value: car.name,
        alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      });
      ws.getCell(o, ROOT).alignment = { vertical: "top", wrapText: true };
      r += car.lines.length;
    }
    ws.mergeCells(projectStart, 1, r - 1, 1);
    const pcell = ws.getCell(projectStart, 1);
    pcell.value = project.name;
    pcell.font = { bold: true };
    pcell.fill = fill(GREY);
    pcell.alignment = { vertical: "middle", horizontal: "center" };
  }
  const full = path.join(outDir, fileName);
  await wb.xlsx.writeFile(full);
  return full;
}
