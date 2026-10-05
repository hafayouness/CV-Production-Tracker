export const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value)
    .trim()
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace("%", "");

  if (!text) return null;

  if (text.includes(",") && text.includes(".")) {
    const lastComma = text.lastIndexOf(",");

    const lastDot = text.lastIndexOf(".");

    if (lastComma > lastDot) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      text = text.replace(/,/g, "");
    }
  } else if (text.includes(",")) {
    const parts = text.split(",");
    const last = parts[parts.length - 1];

    if (last.length === 3 && parts.length > 1) {
      text = parts.join("");
    } else {
      text = text.replace(",", ".");
    }
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
};

export const calculateDifference = (objective, produced) => {
  const o = toNumber(objective);
  const p = toNumber(produced);

  return o === null || p === null ? null : p - o;
};

export const calculateDifferencePercentage = (objective, produced) => {
  const o = toNumber(objective);
  const p = toNumber(produced);

  return o === null || p === null || o === 0 ? null : (p - o) / o;
};

export const calculateCumulative = (values) =>
  values.reduce((sum, value) => sum + (toNumber(value) ?? 0), 0);

export const calculateL160 = (produced, target) => {
  const p = toNumber(produced);
  const t = toNumber(target);

  return p === null || t === null || t === 0 ? null : p / t;
};

export const dailyL160 = (planned, produced) => {
  const g = toNumber(planned) ?? 0;
  const h = toNumber(produced) ?? 0;

  if (g === 0 && h === 0) {
    return null;
  }

  const gap = g === 0 ? 1 : Math.min(Math.abs(h - g) / g, 1);

  return Math.abs(gap - 1);
};
