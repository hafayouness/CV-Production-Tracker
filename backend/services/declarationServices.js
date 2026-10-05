import mapping from "../config/mapping.js";
import {
  buildPlanningData,
  fgWeightForDay,
  refDailyL160,
} from "./planningService.js";
import { detectWeek } from "./excelReader.js";
import {
  calculateCumulative,
  calculateDifference,
  calculateDifferencePercentage,
} from "../utils/calculations.js";
import { toNumber } from "../utils/excelUtils.js";

const DAYS = mapping.dayKeys;
const byDay = (fn) => Object.fromEntries(DAYS.map((d) => [d, fn(d)]));
const EMPTY = mapping.fillEmptyWithZero ? 0 : null;
const blank = (n) => (n ? n : EMPTY);

/**
 * ✅ L160% : LIT EN PRIORITÉ le bloc de synthèse (identique au suivi manuel).
 */
function blockL160(block, refs, synthesis, day) {
  // 1) Synthèse Excel
  if (synthesis && synthesis.size > 0) {
    for (const wp of block.workplaces ?? []) {
      const row = synthesis.get(wp);
      if (row && row[day] !== null && row[day] !== undefined) {
        return row[day];
      }
    }
    const row = synthesis.get(block.label);
    if (row && row[day] !== null && row[day] !== undefined) {
      return row[day];
    }
  }

  // 2) Fallback SUMPRODUCT
  let num = 0,
    den = 0;
  for (const ref of refs) {
    const planned = toNumber(ref.days?.[day]?.planned) ?? 0;
    const daily = refDailyL160(ref, day);
    if (daily === null) continue;
    const fg = fgWeightForDay(ref, day);
    den += fg * planned;
    num += fg * planned * daily;
  }
  return den ? num / den : null;
}

function buildLines(refs, block, synthesis) {
  const sum = (day, field) =>
    refs.reduce((s, r) => s + (toNumber(r.days[day][field]) ?? 0), 0);

  const objective = byDay((d) => blank(sum(d, "planned")));
  const produced = byDay((d) => sum(d, "produced") || EMPTY);

  const diff = byDay((d) =>
    produced[d] ? calculateDifference(objective[d] ?? 0, produced[d]) : null,
  );

  const pct = byDay((d) => {
    const v = calculateDifferencePercentage(objective[d], diff[d]);
    return v === null ? null : diff[d] / objective[d];
  });

  const cumObj = calculateCumulative(DAYS.map((d) => objective[d]));
  const cumProd = calculateCumulative(DAYS.map((d) => produced[d]));
  const cumDiff = cumProd ? cumProd - cumObj : null;

  const [tObj, tProd, tDiff, tPct, tL160] = mapping.rowTypes;

  return [
    { type: tObj, values: objective, cumul: cumObj },
    { type: tProd, values: produced, cumul: cumProd },
    { type: tDiff, values: diff, cumul: cumDiff },
    {
      type: tPct,
      values: pct,
      cumul: cumObj && cumDiff !== null ? cumDiff / cumObj : null,
    },
    {
      type: tL160,
      values: byDay((d) => blockL160(block, refs, synthesis, d)),
      cumul: null,
    },
  ];
}

export async function transformPlanningToDeclaration(filePath, originalName) {
  const { blocks, unmapped, synthesis } = await buildPlanningData(filePath);

  console.log("\n===== TRANSFORM =====");
  console.log("synthesis.size =", synthesis?.size);
  console.log(
    "Carrousel_HRC2 Jeudi =",
    synthesis?.get("Carrousel_HRC2")?.thursday,
  );

  const projects = [];
  for (const b of blocks) {
    if (b.project || !projects.length) {
      projects.push({ name: b.project ?? "VOLVO", carousels: [] });
    }
    projects.at(-1).carousels.push({
      name: b.label,
      references: [...new Set(b.refs.map((r) => String(r.cpn)))],
      lines: buildLines(b.refs, b, synthesis), // ✅ passe synthesis
    });
  }

  const warnings = unmapped.map(
    (u) =>
      `Workplace "${u.workplace}" a des quantités (${u.refs} réf.) mais n'est pas dans la déclaration : ajoutez-le à config/mapping.js.`,
  );

  // ✅ Vérification finale
  const hrC2 = projects
    .flatMap((p) => p.carousels)
    .find((c) => c.name === "Carrousel_C2");
  const l160Line = hrC2?.lines.find((l) => l.type === "L160%");
  console.log("Carrousel_C2 L160% final =", l160Line?.values);
  console.log("=====================\n");

  return {
    week: detectWeek(originalName) || "W00",
    days: DAYS,
    dayLabels: mapping.dayLabels,
    projects,
    warnings,
  };
}
