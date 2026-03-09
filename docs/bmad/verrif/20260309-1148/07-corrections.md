# Passe 7/8 — Corrections

## 7a — Critiques 🔴
Aucun critique à corriger.

## 7b — Warnings 🟡
| # | Fichier | Correction |
|---|---------|-----------|
| 1 | ProgramsScreen.tsx | Suppression import inutilisé `Platform` |
| 2 | AssistantScreen.tsx | Suppression imports inutilisés `useState`, `useEffect` |
| 3 | CoachMarks.tsx | `Dimensions.get('window')` → `useWindowDimensions()` (réactif aux changements taille) |
| 4 | CoachMarks.tsx | MAX_MEASURE_RETRIES et MEASURE_RETRY_DELAY déplacés au niveau module |

## 7c — Suggestions 🔵
Aucune suggestion à appliquer.

## Vérification post-correction
- `npx tsc --noEmit` : ✅ 0 erreur
- `npm test` : ✅ 112 suites, 1737 tests passed
