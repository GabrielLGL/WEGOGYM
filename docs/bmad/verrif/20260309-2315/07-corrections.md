# Passe 7/8 — Corrections

**Date :** 2026-03-10

## 7a — Critiques 🔴
Aucun critique trouvé.

## 7b — Warnings 🟡

| # | Fichier | Correction | Statut |
|---|---------|------------|--------|
| 1 | `ExerciseCatalogScreen.tsx:200` | `useDetailStyles()` : ajout `useMemo(() => ..., [colors])` | ✅ Corrigé |

## 7c — Suggestions 🔵
Aucune suggestion nécessitant correction.

## Vérifications post-correction
- TypeScript : ✅ `tsc --noEmit` — 0 erreur
- Tests : ✅ 36/36 passed (ExerciseCatalog)
