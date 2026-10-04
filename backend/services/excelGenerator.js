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

export async function generateDeclarationExcel(data, outDir, fileName) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(data.week, {
    views: [{ state: "frozen", ySplit: 3, xSplit: 3 }],
  });
  const nDays = data.days.length,
    firstDay = 4,
    lastDay = 3 + nDays,
    cumulCol = lastDay + 1;
  ws.columns = [
    { width: 14 },
    { width: 18 },
    { width: 16 },
    ...data.days.map(() => ({ width: 11 })),
    { width: 12 },
  ];
  const L = (n) => ws.getColumn(n).letter;

  ws.mergeCells(1, 1, 1, cumulCol);
  const title = ws.getCell("A1");
  title.value = `Déclaration CV - ${data.week}`;
  title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  title.fill = fill(NAVY);
  ws.getRow(1).height = 26;

  [
    "Projet",
    "Carrousel",
    "Type",
    ...data.days.map((d) => data.dayLabels[d]),
    "Cumul",
  ].forEach((h, i) => {
    const c = ws.getRow(3).getCell(i + 1);
    c.value = h;
    c.border = border;
    c.fill = fill(NAVY);
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
  });

  let r = 4;
  for (const project of data.projects) {
    const projectStart = r;
    for (const car of project.carousels) {
      const o = r,
        m = r + 1;
      const a = L(firstDay),
        b = L(lastDay),
        cu = L(cumulCol);
      const ratio = (num, den) =>
        `IF(OR(${num}="",N(${den})=0),"",${num}/${den})`;
      car.lines.forEach((line, i) => {
        const row = ws.getRow(r + i);
        row.getCell(3).value = line.type;
        const cellFor = (cl, isCumul) => {
          const mc = `${cl}${m}`,
            oc = `${cl}${o}`;
          if (line.type === "Ecart")
            return {
              formula: isCumul
                ? `IF(N(${mc})=0,"",${mc}-${oc})`
                : `IF(${mc}="","",${mc}-${oc})`,
            };
          if (line.type === "Ecart en %")
            return {
              formula: `IF(OR(${isCumul ? `N(${mc})=0` : `${mc}=""`},N(${oc})=0),"",(${mc}-${oc})/${oc})`,
            };
          if (line.type === "L160%")
            return {
              formula: isCumul
                ? `IF(OR(N(${mc})=0,N(${oc})=0),"",${mc}/${oc})`
                : ratio(mc, oc),
            };
          return null;
        };
        data.days.forEach((d, k) => {
          const cl = L(firstDay + k);
          row.getCell(firstDay + k).value =
            cellFor(cl, false) ?? line.values[d];
        });
        row.getCell(cumulCol).value = ["Objectif", "Qte produite"].includes(
          line.type,
        )
          ? { formula: `SUM(${a}${r + i}:${b}${r + i})` }
          : cellFor(cu, true);
        for (let c = 1; c <= lastCol(cumulCol); c++) {
          const cell = row.getCell(c);
          cell.border = border;
          if (c >= firstDay) {
            cell.alignment = { horizontal: "center" };
            cell.numFmt = line.type.includes("%") ? "0%" : "0";
          }
          if (line.type === "Objectif") cell.fill = fill(BLUE_SOFT);
          if (c === cumulCol) cell.font = { bold: true };
        }
      });
      ws.mergeCells(o, 2, r + car.lines.length - 1, 2);
      const cc = ws.getCell(o, 2);
      cc.value = car.name;
      cc.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      r += car.lines.length;
    }
    ws.mergeCells(projectStart, 1, r - 1, 1);
    const pc = ws.getCell(projectStart, 1);
    pc.value = project.name;
    pc.font = { bold: true };
    pc.fill = fill(GREY);
    pc.alignment = { vertical: "middle", horizontal: "center" };
  }
  ws.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: cumulCol },
  };
  const full = path.join(outDir, fileName);
  await wb.xlsx.writeFile(full);
  return full;
}
const lastCol = (n) => n;
