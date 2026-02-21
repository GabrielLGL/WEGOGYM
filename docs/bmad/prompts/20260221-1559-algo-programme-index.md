<!-- v1.0 — 2026-02-21 -->
# Prompt — Amélioration algo programme — 20260221-1559

## Demande originale
"donne moi d'autre axes d'amélioration pour l'algo de création du programme questions utilisateurs en plus, variables en plus"

## Axes identifiés

### Nouvelles questions utilisateur (Groupe A)
| Question | Variable | Options | Condition |
|----------|----------|---------|-----------|
| Phase d'entraînement | `phase` | prise_masse / seche / recomposition / maintien | mode=program |
| Récupération | `recovery` | rapide / normale / lente | mode=program |
| Zones sensibles | `injuries` | none / epaules / genoux / bas_dos / poignets / nuque | mode=program |
| Tranche d'âge | `ageGroup` | 18-25 / 26-35 / 36-45 / 45+ | mode=program |

### Nouvelles variables algorithme (Groupe B — métadonnées)
| Propriété | Impact |
|-----------|--------|
| `sfr` | Prioriser exercices à fort ratio stimulus/fatigue |
| `stretchFocus` | Équilibrer étirement vs contraction dans chaque séance |
| `injuryRisk` | Exclure exercices à risque pour les zones blessées |
| `progressionType` | Schéma de progression recommandé |

### Nouvelles variables moteur (Groupe C — algorithme)
| Variable | Impact |
|----------|--------|
| Volume multiplier (recovery + age) | Réduit/augmente sets selon capacité |
| Phase adjustment (reps/RPE) | Adapte fourchette de reps selon objectif métabolique |
| Injury filter | Élimine exercices incompatibles avec blessures |
| stretchFocus balance | 30% minimum d'exercices en étirement par muscle |
| Rest recommendations | Temps de repos adapté au goal + phase |
| RPE cible | Intensité subjective guidée |
| Deload flag | Signal semaine de décharge pour profils avancés/seniors |

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260221-1559-algo-programme-A.md` | types.ts, AssistantScreen.tsx | 1 | ⏳ |
| B | `20260221-1559-algo-programme-B.md` | exerciseMetadata.ts | 1 | ⏳ |
| C | `20260221-1559-algo-programme-C.md` | offlineEngine.ts | 2 | ⏳ |

## Ordre d'exécution
1. **Vague 1** — A et B peuvent être lancés en parallèle (fichiers indépendants)
2. **Vague 2** — C dépend de A (nouveaux types) et B (nouvelles métadonnées)

## Statut
⏳ En attente
