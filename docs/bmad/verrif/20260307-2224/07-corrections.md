# Passe 7/8 — Corrections

**Date :** 2026-03-07 22:24

## 7a — Critiques 🔴

### Fix 1 : TSC errors — buildRecapExercises.test.ts
- **Fichier :** `src/model/utils/__tests__/buildRecapExercises.test.ts`
- **Problème :** 4 erreurs TS2345 — `isPr` manquant dans les données de test
- **Correction :** Ajout `isPr: false` à toutes les entrées `validatedSets`
- **Vérification :** `tsc --noEmit` → 0 erreurs ✅

### Fix 2 : OnboardingSheet.tsx i18n
- **Fichiers modifiés :**
  - `src/components/OnboardingSheet.tsx` — ajout `useLanguage()`, 4 strings → `t()` calls
  - `src/i18n/fr.ts` — ajout `onboarding.programChoice` (title, sessions, importing, skip)
  - `src/i18n/en.ts` — ajout traductions anglaises correspondantes
- **Vérification :** `tsc --noEmit` → 0 erreurs, `jest` → 1687/1687 ✅

## 7b — Warnings 🟡

Aucun warning trouvé nécessitant correction.

## 7c — Suggestions 🔵

Aucune suggestion nécessitant correction.

## Résumé

| Niveau | Trouvé | Corrigé |
|--------|--------|---------|
| 🔴 Critique | 2 | 2 |
| 🟡 Warning | 0 | 0 |
| 🔵 Suggestion | 0 | 0 |

**Post-fix :** `tsc` 0 errors, `jest` 106/106 suites, 1687/1687 tests ✅
