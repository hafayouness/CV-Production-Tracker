import { readPlanningRows } from "./excelReader.js";
import { toNumber } from "../utils/calculations.js";

/** Agrège les quantités planifiées par projet > carrousel > jour. */
export async function buildPlanningData(filePath) {
  const rows = await readPlanningRows(filePath);
  const tree = {};
  for (const row of rows) {
    const carousel = row.workplace || "Sans carrousel";
    const node = ((tree[row.project] ??= {})[carousel] ??= {
      planned: {},
      references: new Set(),
    });
    if (row.cpn) node.references.add(String(row.cpn));
    for (const [day, v] of Object.entries(row.days)) {
      const n = toNumber(v);
      if (n !== null) node.planned[day] = (node.planned[day] ?? 0) + n;
    }
  }
  return tree;
}
