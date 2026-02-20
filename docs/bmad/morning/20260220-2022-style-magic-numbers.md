# Rapport — Remplacer magic numbers par tokens thème — 2026-02-20

## Problème
~40 magic numbers de spacing/fontSize/borderRadius éparpillés dans 9 composants.
Viole le principe de thème centralisé (CLAUDE.md : "No hardcoded colors/spacing").
Rend les ajustements UI globaux difficiles.

## Fichiers concernés
- `mobile/src/components/CustomModal.tsx`
- `mobile/src/components/ExercisePickerModal.tsx`
- `mobile/src/components/ErrorBoundary.tsx`
- `mobile/src/components/ExerciseTargetInputs.tsx`
- `mobile/src/components/BottomSheet.tsx`
- `mobile/src/components/RestTimer.tsx`
- `mobile/src/components/SessionExerciseItem.tsx`
- `mobile/src/components/SetItem.tsx`
- `mobile/src/components/SessionItem.tsx`

## Commande à lancer
/do Remplacer tous les magic numbers spacing/fontSize/borderRadius par tokens thème (spacing.xs/sm/md/lg/xl, borderRadius.sm/md/lg) dans CustomModal, ExercisePickerModal, ErrorBoundary, ExerciseTargetInputs, BottomSheet, RestTimer, SessionExerciseItem, SetItem, SessionItem — ne pas changer les valeurs visuelles, seulement les sourcer depuis theme/index.ts

## Contexte
- CLAUDE.md : toujours utiliser `colors.*`, `spacing.*`, `borderRadius.*` depuis `theme/index.ts`
- Valeurs typiques : padding 4/8/12/16/20/24 → spacing.xs/sm/md/lg, borderRadius 6/8/12 → borderRadius.sm/md/lg
- NE PAS changer les valeurs numériques actuelles — seulement les remplacer par le token équivalent le plus proche
- Rapport verrif source : `docs/bmad/verrif/20260220-1844/RAPPORT.md` problème #1

## Critères de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 0 fail (tests snapshot peuvent nécessiter mise à jour)
- grep `StyleSheet.create` dans les 9 fichiers → 0 valeurs numériques hardcodées pour spacing/borderRadius

## Statut
⏳ En attente
