# Règles de transformation Planning → Déclaration CV (vérifiées sur W06)

Source : feuille **L160** du planning (une ligne par référence : Planned / Produced / Daily L-160 pour chaque jour).
Cible : feuille **W06** (blocs de 5 lignes par carrousel : Objectif, Qte produite, Ecart, Ecart en %, L160%).

| Donnée       | Règle                                                                                                                                                         | Vérification sur W06                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Carrousel    | Regroupement des références par `Workplace` (insensible à la casse), via `config/mapping.js > layout`                                                         | OK (ex. Carrousel_HRC2 → "Carrousel_C2")                                                   |
| Qte produite | Σ `Produced` des références du carrousel, par jour                                                                                                            | Identique : HCR3, MDEP, STEP E, VCE Ligne. Écarts : voir ci-dessous                        |
| Objectif     | Σ `Planned` des références du carrousel, par jour                                                                                                             | Identique : C1, HCR3, MDEPAftermarket/VCE SB. **Différent : C2, MDEP, STEP E, DAL, Small** |
| Ecart        | `IF(produit=0,"-",produit-objectif)`                                                                                                                          | Formule identique à W06                                                                    |
| Ecart en %   | `IFERROR(ecart/objectif,"")`                                                                                                                                  | Formule identique à W06                                                                    |
| Cumul        | Somme Lundi→Samedi (objectif, produit)                                                                                                                        | Identique                                                                                  |
| L160%        | Σ(Planned×FG×Daily) / Σ(FG×Planned) par carrousel et par jour, avec FG = Temps de gamme × Σ quantités ; Daily = 1 − min(abs(Produit−Planifié)/Planifié, 100%) | Identique : C2, HCR3, MDEP, STEP E, DAL, Small                                             |
| Root cause   | Colonne M, laissée vide (saisie manuelle)                                                                                                                     | —                                                                                          |

## Points NON résolus (écarts constatés entre le planning et W06)

1. **Objectif saisi à la main** dans W06 pour C2 (144 vs 120/144), MDEP (90 vs 70/110), STEP E, DAL (60 vs 108/96…), Small (1100 vs 1222/1048…). Aucune formule ne relie ces valeurs au planning : à valider avec le métier.
2. **Qte produite corrigée à la main** dans W06 pour Small, DAL, C2 samedi (144 vs 136), C1 samedi (60 vs 63), MDEPAftermarket/VCE SB.
3. **L160%** de "VCE Ligne" et de "MDEPAftermarket / VCE SB" : W06 utilise des plages de lignes différentes ou des valeurs saisies (0.81, 0.62…).
4. Les blocs MAN, JCB, IVECO, VCE HAULER, CLAAS, JD de W06 ne sont pas dans ce planning (autres plannings).
