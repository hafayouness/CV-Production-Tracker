import mapping from "../config/mapping.js";
import { readL160Rows } from "./excelReader.js";
import { normalize, toNumber } from "../utils/excelUtils.js";

const key = (value) => normalize(value);

const ignored = new Set((mapping.ignoredWorkplaces ?? []).map((w) => key(w)));

export async function buildPlanningData(filePath) {
  const { rows, synthesis } = await readL160Rows(filePath); // ✅ récupère synthesis

  console.log("=== buildPlanningData ===");
  console.log("synthesis.size =", synthesis?.size);

  const byWorkplace = new Map();
  mapping.layout.forEach((block, index) => {
    for (const workplace of block.workplaces) {
      byWorkplace.set(key(workplace), index);
    }
  });

  const blocks = mapping.layout.map((block) => ({ ...block, refs: [] }));
  const unmapped = new Map();

  for (const row of rows) {
    const workplaceKey = key(row.workplace);
    if (ignored.has(workplaceKey)) continue;
    const blockIndex = byWorkplace.get(workplaceKey);
    if (blockIndex !== undefined) {
      blocks[blockIndex].refs.push(row);
      continue;
    }
    const used = mapping.dayKeys.some((day) => {
      const p = toNumber(row.days?.[day]?.planned) ?? 0;
      const q = toNumber(row.days?.[day]?.produced) ?? 0;
      return p !== 0 || q !== 0;
    });
    if (used)
      unmapped.set(row.workplace, (unmapped.get(row.workplace) ?? 0) + 1);
  }

  return {
    blocks,
    unmapped: [...unmapped].map(([workplace, refs]) => ({ workplace, refs })),
    synthesis, // ✅✅✅ ESSENTIEL — propagation
  };
}

export const fgWeightForDay = (ref, day) => {
  const cycleTime = toNumber(ref.cycleTime) ?? 0;
  const planned = toNumber(ref.days?.[day]?.planned) ?? 0;
  const produced = toNumber(ref.days?.[day]?.produced) ?? 0;
  const qty = planned === 0 && produced > 0 ? produced : planned;
  return cycleTime * qty;
};

export const fgWeight = (ref) => {
  const cycleTime = toNumber(ref.cycleTime) ?? 0;
  const quantity = mapping.dayKeys.reduce((total, day) => {
    const p = toNumber(ref.days?.[day]?.planned) ?? 0;
    const q = toNumber(ref.days?.[day]?.produced) ?? 0;
    return total + (p === 0 && q > 0 ? q : p);
  }, 0);
  return cycleTime * quantity;
};

export const refDailyL160 = (ref, day) => {
  return toNumber(ref.days?.[day]?.dailyL160) ?? null;
};
