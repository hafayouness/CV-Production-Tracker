export const normalize = (v) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** Valeur "simple" d'une cellule ExcelJS (formules => résultat, texte riche => texte). */
export function cellValue(cell) {
  let v = cell?.value;
  if (v && typeof v === "object" && !(v instanceof Date)) {
    if ("result" in v) v = v.result;
    else if (v.richText) v = v.richText.map((t) => t.text).join("");
    else if (v.text) v = v.text;
    else v = null;
  }
  return v ?? null;
}

export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });
