import ExcelJS from "exceljs";
import { cellValue } from "../utils/excelUtils.js";

for (const file of process.argv.slice(2)) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  console.log(`\n=== ${file} ===`);
  for (const ws of wb.worksheets) {
    console.log(
      `\n# Feuille "${ws.name}" — ${ws.rowCount} lignes x ${ws.columnCount} colonnes`,
    );
    for (let r = 1; r <= Math.min(ws.rowCount, 12); r++) {
      const vals = [];
      ws.getRow(r).eachCell((c, i) =>
        vals.push(
          `${c.address}=${JSON.stringify(cellValue(c))}${c.formula ? ` {=${c.formula}}` : ""}`,
        ),
      );
      if (vals.length) console.log(vals.slice(0, 14).join(" | "));
    }
  }
}
