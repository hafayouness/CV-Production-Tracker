// debug.js
import ExcelJS from "exceljs";

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile("./uploads/356c8bf076fef55c88f632b506dfb9f0.xlsx"); // ⚠️ remplace par ton vrai chemin

const ws = wb.worksheets.find((s) => s.name === "L160");
if (!ws) {
  console.log(
    "❌ Feuille L160 introuvable. Feuilles :",
    wb.worksheets.map((s) => s.name),
  );
  process.exit(1);
}

console.log("=== FEUILLE L160 ===");
console.log("rowCount:", ws.rowCount, "columnCount:", ws.columnCount);

// Affiche les 30 premières lignes non vides
console.log("\n=== 30 PREMIÈRES LIGNES ===");
for (let r = 1; r <= 30; r++) {
  const row = ws.getRow(r);
  const vals = [];
  row.eachCell({ includeEmpty: false }, (cell, c) => {
    const v = cell.value;
    let display = v;
    if (v && typeof v === "object" && "formula" in v) {
      display = `{f: ${v.formula.slice(0, 30)}..., result: ${v.result}}`;
    }
    vals.push(`[${c}]${String(display).slice(0, 40)}`);
  });
  if (vals.length) console.log(`L${r}:`, vals.join(" | "));
}

// Cherche TOUTES les lignes qui contiennent "Project" ou "Familly"
console.log("\n=== LIGNES CONTENANT 'Project' ou 'Familly' ===");
for (let r = 1; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  let found = [];
  row.eachCell({ includeEmpty: false }, (cell, c) => {
    const v = String(cell.value?.result ?? cell.value ?? "").toLowerCase();
    if (v === "project" || v === "familly" || v === "family") {
      found.push(`col${c}=${v}`);
    }
  });
  if (found.length) console.log(`L${r}:`, found.join(" | "));
}

// Affiche les 20 dernières lignes
console.log("\n=== 20 DERNIÈRES LIGNES ===");
const start = Math.max(1, ws.rowCount - 20);
for (let r = start; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  const vals = [];
  row.eachCell({ includeEmpty: false }, (cell, c) => {
    const v = cell.value;
    let display = v;
    if (v && typeof v === "object" && "formula" in v) {
      display = `{f:${String(v.result).slice(0, 15)}}`;
    }
    vals.push(`[${c}]${String(display).slice(0, 30)}`);
  });
  if (vals.length) console.log(`L${r}:`, vals.join(" | "));
}
