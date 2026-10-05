// Règles déduites de l'analyse de W06 + Planning (voir docs/transformation-rules.md)
export default {
  sourceSheet: "L160", // contient Planned / Produced / Daily L-160 par référence
  dayKeys: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  dayLabels: {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
  },
  // true : une case sans valeur affiche 0 (Objectif, Qte produite, Cumul). false : case vide, comme dans W06.
  fillEmptyWithZero: true,
  rowTypes: ["Objectif", "Qte produite", "Ecart", "Ecart en %", "L160%"],
  // Ordre et libellés de la déclaration. workplaces = valeurs de la colonne Workplace (insensible à la casse).
  layout: [
    { project: "VOLVO", label: "Carrousel_C1", workplaces: ["Carrousel_C1C2"] },
    { project: null, label: "Carrousel_C2", workplaces: ["Carrousel_HRC2"] },
    { project: null, label: "Carrousel_HCR3", workplaces: ["Carrousel_HRC3"] },
    { project: null, label: "Carrousel_MDEP", workplaces: ["Carrousel_MDEP"] },
    {
      project: null,
      label: "CARROUSEL_STEP E /SB",
      workplaces: ["CARROUSEL_STEP E", "STEP E/SB"],
    },
    { project: null, label: "DAL", workplaces: ["DAL"] },
    {
      project: null,
      label: "MDEPAftermarket / VCE SB",
      workplaces: ["MDEPAftermarket", "VCE /SB"],
    },
    { project: null, label: "Small", workplaces: ["Small"] },
    { project: "VCE Engine", label: "VCE Ligne ", workplaces: ["VCE Ligne"] },
  ],
};
