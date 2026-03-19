# Passe 7/8 — Corrections

**Date :** 2026-03-20

## 7a — Corrections critiques

| # | Fichier | Correction |
|---|---------|-----------|
| 1 | `HomeHeroAction.tsx:85-92` | Ajout `try/catch` autour de `handleQuickStart` avec `console.error` gardé par `__DEV__` |
| 2 | `workoutSessionUtils.ts:198-220` | Fusion des 2 `database.write()` en un seul bloc atomique dans `createQuickStartSession` |

## 7b — Corrections warnings

| # | Fichier | Correction |
|---|---------|-----------|
| 3 | `schema.ts:4` | Commentaire "Version actuelle" mis à jour de v38 → v39 |
| 4 | `CLAUDE.md:20` | "Schema: v38" → "Schema: v39" |
| 5 | `workoutSessionUtils.ts:174` | Remplacement `endTime!.getTime()` par `endTime?.getTime() ?? startTime.getTime()` (null-safe) |
| 6 | `ProgressPhotosScreen.tsx:548` | Remplacement `rgba(0,0,0,0.5)` par `colors.bottomSheetOverlay` |

## 7c — Non corrigés (suggestions / dette technique)

| # | Raison |
|---|--------|
| DRY `getLastSessionVolume` / `getLastSessionDensity` | Refactoring plus large, pas de bug |
| Écrans morts (StatsConstellation, SkillTree) | Nettoyage séparé recommandé |
| `any` dans tests | Cosmétique, pas de risque runtime |
| Widget couleurs désalignées | Le widget Android ne peut pas importer le thème dynamique |
| `fetchCurrentUser()` double appel | Optimisation, pas de bug |

## Vérification post-corrections

| Check | Résultat |
|-------|----------|
| `npx tsc --noEmit` | **0 erreurs** ✓ |
| `npm test` | **2231/2231 passent** ✓ |
