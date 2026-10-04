import mapping from "../config/mapping.js";
import { buildPlanningData } from "./planningService.js";
import { detectWeek } from "./excelReader.js";
import {
  calculateCumulative,
  calculateDifference,
  calculateDifferencePercentage,
  calculateL160,
} from "../utils/calculations.js";

const DAYS = Object.keys(mapping.dayLabels);
const byDay = (fn) => Object.fromEntries(DAYS.map((d) => [d, fn(d)]));

function buildCarouselLines(planned, produced = {}) {
  const objective = byDay((d) => planned[d] ?? null);
  const made = byDay((d) => produced[d] ?? null);
  const sum = (o) => calculateCumulative(DAYS.map((d) => o[d]));
  const cumObj = sum(objective),
    cumMade = sum(made);
  const [tObj, tMade, tDiff, tPct, tL160, tRoot] = mapping.rowTypes;
  return [
    { type: tObj, values: objective, cumul: cumObj },
    { type: tMade, values: made, cumul: cumMade },
    {
      type: tDiff,
      values: byDay((d) => calculateDifference(objective[d], made[d])),
      cumul: calculateDifference(cumObj, cumMade),
    },
    {
      type: tPct,
      values: byDay((d) =>
        calculateDifferencePercentage(objective[d], made[d]),
      ),
      cumul: calculateDifferencePercentage(cumObj, cumMade),
    },
    {
      type: tL160,
      values: byDay((d) => calculateL160(made[d], objective[d])),
      cumul: calculateL160(cumMade, cumObj),
    },
    { type: tRoot, values: byDay(() => null), cumul: null },
  ];
}

export async function transformPlanningToDeclaration(filePath, originalName) {
  const tree = await buildPlanningData(filePath);
  const projects = Object.entries(tree).map(([name, carousels]) => ({
    name,
    carousels: Object.entries(carousels).map(([carousel, node]) => ({
      name: carousel,
      references: [...node.references],
      lines: buildCarouselLines(node.planned),
    })),
  }));
  return {
    week: detectWeek(originalName) || "W00",
    days: DAYS,
    dayLabels: mapping.dayLabels,
    projects,
  };
}
