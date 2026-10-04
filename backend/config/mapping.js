export default {
  planningSheet: "Planning",
  headerScanRows: 20,
  columns: {
    project: ["project"],
    cpn: ["cpn"],
    lpn: ["lpn"],
    workplace: ["workplace"],
    cycleTime: ["temps de gamme"],
    days: {
      monday: ["monday", "lundi"],
      tuesday: ["tuesday", "mardi"],
      wednesday: ["wednesday", "mercredi"],
      thursday: ["thursday", "jeudi"],
      friday: ["friday", "vendredi"],
      saturday: ["saturday", "samedi"],
    },
  },
  dayLabels: {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
  },

  rowTypes: [
    "Objectif",
    "Qte produite",
    "Ecart",
    "Ecart en %",
    "L160%",
    "Root Cause",
  ],
};
