# Passe 7/8 — Corrections

**Date :** 2026-03-09 00:16

## 7a — Critiques 🔴 (6 corrigés)

| # | Fichier | Correction |
|---|---------|------------|
| 1 | `hooks/useProgramManager.ts` | `duplicateSession` copie maintenant tous les champs : `setsTargetMax`, `restTime`, `notes`, `supersetId`, `supersetType`, `supersetPosition` |
| 2 | `navigation/index.tsx` | Comparaison CGU remplacée par `isVersionOlder()` (comparaison sémantique, pas lexicographique) |
| 3 | `model/constants.ts` | Suppression code mort : `USER_LEVEL_LABELS`, `USER_LEVEL_DESCRIPTIONS`, `USER_GOAL_LABELS`, `USER_GOAL_DESCRIPTIONS`, `PROGRAM_EQUIPMENT`, `ProgramEquipment` |
| 4 | `screens/HistoryDetailScreen.tsx` | Ajout flag `cancelled` dans useEffect fetch exercises (prévient state update after unmount) |
| 5 | `screens/WorkoutScreen.tsx` | `handleConfirmEnd` enveloppé dans try/catch |
| 6 | `CLAUDE.md` + `MEMORY.md` | Schema version mise à jour v32 → v33 |

## 7b — Warnings 🟡 (4 corrigés)

| # | Fichier | Correction |
|---|---------|------------|
| 1 | `components/BadgeCelebration.tsx` | Textes "Nouveau badge !" et "Super !" remplacés par `t.badges.newBadge` / `t.badges.great` |
| 2 | `i18n/fr.ts` + `i18n/en.ts` | Ajout clés `badges.newBadge` et `badges.great` |
| 3 | `screens/LegalScreen.tsx` | `Linking.openURL` enveloppé dans try/catch |
| 4 | `navigation/index.tsx` | `JSON.parse(reminderDays)` enveloppé dans try/catch avec fallback |

## 7c — Suggestions 🔵 (1 corrigée)

| # | Fichier | Correction |
|---|---------|------------|
| 1 | `components/BadgeCelebration.tsx` | `useStyles` mémoïsé avec `useMemo` |

## Vérifications post-correction

- **TypeScript** : ✅ 0 erreur (`npx tsc --noEmit`)
- **Tests** : ✅ 1737 passed, 0 failed (112 suites)

## Non corrigé (par choix)

| # | Problème | Raison |
|---|----------|--------|
| 1 | Double fetch DB dans navigation/index.tsx | Refactor risqué, nécessite restructuration du composant |
| 2 | OnboardingScreen — feedback échec sauvegarde | Nécessite choix UX (Toast vs Alert) |
| 3 | CoachMarks — missing useEffect deps | Refs stables, pas de bug fonctionnel |
| 4 | AnimatedSplash — import statique colors | Affiché avant ThemeProvider, nécessite props |
| 5 | Hardcoded borderRadius (6 fichiers) | Nécessite ajout tokens theme, changement mineur |
| 6 | MilestoneCelebration/RestTimer/HistoryDetailScreen useStyles useMemo | Performance mineure |
