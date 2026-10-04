export const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n =
    typeof v === "number"
      ? v
      : Number(String(v).replace(",", ".").replace("%", "").trim());
  return Number.isFinite(n) ? n : null;
};

export const calculateDifference = (objective, produced) => {
  const o = toNumber(objective),
    p = toNumber(produced);
  return o === null || p === null ? null : p - o;
};

/** Retourne un ratio (ex: -0.08). Null si l'objectif est nul ou absent. */
export const calculateDifferencePercentage = (objective, produced) => {
  const o = toNumber(objective),
    p = toNumber(produced);
  return o === null || p === null || o === 0 ? null : (p - o) / o;
};

export const calculateCumulative = (values) =>
  values.reduce((sum, v) => sum + (toNumber(v) ?? 0), 0);

/**
 * L160% — RÈGLE À CONFIRMER (voir docs/transformation-rules.md).
 * Hypothèse : quantité produite / quantité planifiée.
 */
export const calculateL160 = (produced, target) => {
  const p = toNumber(produced),
    t = toNumber(target);
  return p === null || t === null || t === 0 ? null : p / t;
};
