# Règles de transformation Planning → Déclaration CV

> Statut : **BROUILLON**. Les fichiers Excel de référence n'ont pas encore été analysés.
> Lancer `npm run analyze -- "Planning_Off Road_W06_volvo.xlsx" "Copie de suivi de Déclaration CV Agadir final2026 1.xlsx"`
> puis confirmer / corriger chaque ligne. Les hypothèses sont isolées dans `config/mapping.js`.

| Sujet          | Règle implémentée                                                                                                   | Statut                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Feuille source | `Planning`                                                                                                          | À confirmer                                  |
| Colonnes       | Project, CPN, LPN, Workplace, Temps de gamme, Monday…Saturday (détection par nom, insensible casse/espaces/accents) | OK (technique)                               |
| Semaine        | Extraite du nom de fichier (`W06`)                                                                                  | À confirmer                                  |
| Carrousel      | = valeur de `Workplace`                                                                                             | **INCERTAIN**                                |
| Objectif jour  | Somme des quantités du jour par (projet, carrousel)                                                                 | **INCERTAIN** (EQNT/EQM/EQS non utilisés)    |
| Qte produite   | Vide (à saisir)                                                                                                     | **INCERTAIN** : peut venir de `Planning_day` |
| Ecart          | Produit − Objectif (formule Excel)                                                                                  | Standard                                     |
| Ecart en %     | (Produit − Objectif) / Objectif, vide si objectif = 0                                                               | Standard                                     |
| Cumul          | Somme Lundi→Samedi                                                                                                  | Standard                                     |
| L160%          | Produit / Objectif (placeholder)                                                                                    | **INCERTAIN** : feuille `L160` à analyser    |
| Root Cause     | Ligne vide, saisie manuelle                                                                                         | À confirmer                                  |
| Ignoré         | Lignes sans Project ; feuilles autres que Planning                                                                  | À confirmer                                  |
