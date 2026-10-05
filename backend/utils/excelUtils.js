export const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/**
 * Retourne la vraie valeur d'une cellule ExcelJS.
 *
 * Gère :
 * - nombre
 * - texte
 * - formule avec résultat { formula, result }
 * - formule SANS résultat { formula } → retourne null (le caller gère le fallback)
 * - richText
 * - hyperlink/text
 */
export function cellValue(cell) {
  const value = cell?.value;

  if (value === null || value === undefined) return null;

  if (typeof value === "object" && !(value instanceof Date)) {
    // Formule ExcelJS : { formula, result?, sharedFormula? }
    if ("formula" in value || "sharedFormula" in value) {
      // ✅ Si un result est présent (cache Excel), on le prend
      if (
        "result" in value &&
        value.result !== undefined &&
        value.result !== null
      ) {
        return value.result;
      }
      // ❌ Sinon, on retourne null pour que le caller applique son fallback
      return null;
    }

    if (Array.isArray(value.richText)) {
      return value.richText.map((item) => item?.text ?? "").join("");
    }

    if ("text" in value) {
      return value.text ?? null;
    }

    // Objet inconnu (erreur Excel #REF!, #N/A, etc.)
    if ("error" in value) {
      return null;
    }

    return null;
  }

  return value;
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;

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
    const lastPart = parts[parts.length - 1];

    if (lastPart.length === 3 && parts.length > 1) {
      text = parts.join("");
    } else {
      text = text.replace(",", ".");
    }
  } else if (text.includes(".")) {
    const parts = text.split(".");
    const lastPart = parts[parts.length - 1];

    if (lastPart.length === 3 && parts.length > 1) {
      text = parts.join("");
    }
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/**
 * ✅ Daily L-160 — reproduction exacte de la formule Excel.
 *
 * Formule Excel (colonne I/M/O/R/U/X de L160) :
 *   =IF(ISERROR(ABS(IF(AND(G=0,H=0),"",
 *      IF(AND(G=0,H>0),100%,
 *      IF((ABS(H-G)/G)>100%,100%,ABS(H-G)/G)))-1)),"",
 *      (ABS(IF(...))-1))
 *
 * Règles :
 *   P=0, Q=0  → null (case vide)
 *   P=0, Q>0  → 0
 *   sinon     → |min(|Q-P|/P, 1) - 1|
 */
export const dailyL160 = (planned, produced) => {
  const g = toNumber(planned) ?? 0;
  const h = toNumber(produced) ?? 0;

  if (g === 0 && h === 0) return null;

  const gap = g === 0 ? 1 : Math.min(Math.abs(h - g) / g, 1);

  return Math.abs(gap - 1);
};

export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });
