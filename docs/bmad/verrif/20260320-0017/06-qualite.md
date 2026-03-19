# Passe 6/8 — Code Mort & Qualité

**Date :** 2026-03-20

## Résumé

11 problèmes identifiés (0 critique, 5 moyenne, 4 faible, 2 info).

## Points conformes

- `console.log` gardés par `__DEV__` ✓
- Pas de `<Modal>` natif ✓
- Pas de TODO/FIXME/HACK ✓
- Couleurs via `useColors()` dans le code source ✓

## Violations

| # | Fichier | Sévérité | Problème |
|---|---------|----------|----------|
| 1 | `schema.ts` / `CLAUDE.md` | MOYENNE | Version schema désynchronisée (docs v38, code v39) |
| 2 | `workoutSessionUtils.ts:151` | MOYENNE | `getLastSessionDensity` exportée mais jamais importée (dead export) |
| 3 | `ProgressPhotosScreen.tsx:548` | MOYENNE | `rgba(0,0,0,0.5)` hardcodée |
| 4 | `widgets/KoreWidget.tsx:5-9` | MOYENNE | 5 constantes couleur hardcodées désalignées du thème |
| 5 | `widgets/KoreWidget.tsx:49-133` | MOYENNE | 8 chaînes françaises hardcodées non-i18n |
| 6 | `StatsConstellationScreen.tsx` | FAIBLE | Écran mort (retiré de navigation) |
| 7 | `SkillTreeScreen.tsx` | FAIBLE | Écran mort (retiré de navigation) |
| 8-11 | 4 fichiers test (`*Screen.test.tsx`) | FAIBLE | ~13 occurrences de `any` dans les mocks |

## Verdict

Pas de problème bloquant. Code mort et `any` dans les tests à nettoyer progressivement.
