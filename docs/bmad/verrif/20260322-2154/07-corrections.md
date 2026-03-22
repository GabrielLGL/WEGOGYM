# Passe 7/8 — Corrections

**Date :** 2026-03-22

## 7a — Critiques 🔴 (1 corrigé)

| # | Problème | Fichier | Fix |
|---|----------|---------|-----|
| CRIT-1 | Boucle infinie HistoryDetailScreen test (UnitContext mock instable) | `__mocks__/UnitContextMock.ts` | Fonctions extraites en constantes stables hors de `useUnits()` |

## 7b — Warnings 🟡 (3 corrigés)

| # | Problème | Fichier | Fix |
|---|----------|---------|-----|
| WARN-1 | Commentaire schema version obsolète (39 → 42) | `model/schema.ts:4` | Mis à jour en v42 |
| WARN-2 | Couleur hardcodée favChipActive | `screens/ExercisesScreen.tsx:490` | `colors.danger + '26'` |
| WARN-3 | Couleur hardcodée iconContainerSelected | `components/OnboardingCard.tsx:87` | `colors.primary + '33'` |

## 7c — Suggestions 🔵 (1 corrigée)

| # | Problème | Fichier | Fix |
|---|----------|---------|-----|
| SUGG-1 | CLAUDE.md schema v39 → v42 | `CLAUDE.md` | Mis à jour |

## Vérifications post-correction
- TypeScript : ✅ 0 erreur
- Tests : en cours de validation...
