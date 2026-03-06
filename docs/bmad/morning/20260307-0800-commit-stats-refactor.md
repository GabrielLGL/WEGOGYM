# Rapport — Commit stats refactor (split modules + i18n) — 2026-03-07

## Probleme
16 fichiers modifies non commites issus du refactor stats : split des modules (statsKPIs, statsMuscle, statsPRs, statsVolume, statsContext), i18n des ecrans Stats, et ajout de cles i18n.

## Fichiers concernes
- `mobile/src/model/utils/statsKPIs.ts`
- `mobile/src/model/utils/statsMuscle.ts`
- `mobile/src/model/utils/statsPRs.ts`
- `mobile/src/model/utils/statsVolume.ts`
- `mobile/src/model/utils/statsContext.ts` (new)
- `mobile/src/model/utils/__tests__/statsMuscle.test.ts`
- `mobile/src/model/utils/__tests__/statsVolume.test.ts`
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/screens/StatsExercisesScreen.tsx`
- `mobile/src/screens/StatsMeasurementsScreen.tsx`
- `mobile/src/screens/StatsVolumeScreen.tsx`
- `mobile/src/screens/__tests__/StatsVolumeScreen.test.tsx`
- `mobile/src/i18n/en.ts`
- `mobile/src/i18n/fr.ts`

## Commande a lancer
/do docs/bmad/morning/20260307-0800-commit-stats-refactor.md

## Contexte
- Le refactor a split les utils stats monolithiques en modules dedies
- Les ecrans stats utilisent maintenant `useLanguage()` + `t()` pour l'i18n
- Build OK (0 erreurs TS), Tests OK (1558/1558)
- Les rapports morning deja resolus (raw-unsafe, usecallback, i18n-hardcoded) ont aussi des diffs dans leur fichier .md
- Ne PAS stager : `package-lock.json`, `scripts/build-log.txt`, `docs/bmad/do/*`
- Faire 2 commits : 1) refactor stats utils + screens, 2) docs morning resolus

## Criteres de validation
- `git status` montre uniquement `package-lock.json`, `scripts/build-log.txt`, `docs/bmad/do/*` comme non commites
- Build + tests toujours OK apres commit

## Statut
En attente
