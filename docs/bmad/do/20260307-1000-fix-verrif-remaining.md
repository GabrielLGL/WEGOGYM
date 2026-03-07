# fix(multi) — 7 verrif remaining issues
Date : 2026-03-07 10:00

## Instruction
docs/bmad/morning/20260307-0900-verrif-remaining.md — 7 issues verrif

## Rapport source
docs/bmad/morning/20260307-0900-verrif-remaining.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/components/BottomSheet.tsx
- mobile/src/screens/HistoryDetailScreen.tsx
- mobile/src/screens/StatsMeasurementsScreen.tsx
- mobile/src/screens/WorkoutScreen.tsx
- mobile/src/hooks/useAssistantWizard.ts
- mobile/src/screens/StatsVolumeScreen.tsx
- mobile/src/screens/ProgramDetailScreen.tsx
- mobile/src/screens/ProgramsScreen.tsx

## Ce qui a été fait

### W6 — BottomSheet.tsx
- Remplacé `Dimensions.get('window').height` au scope module par `useWindowDimensions()` hook à l'intérieur du composant
- Supprimé import `Dimensions`, ajouté import `useWindowDimensions`

### B3 — HistoryDetailScreen.tsx
- Ajouté `if (__DEV__) console.error(...)` dans 5 catch blocks vides (fetchExercises, handleSave, handleAddSet, handleDeleteSet, handleDeleteWorkout)

### B4 — StatsMeasurementsScreen.tsx
- Ajouté `if (__DEV__) console.error(...)` dans 2 catch blocks vides (handleSave, handleDelete)

### B5 — WorkoutScreen.tsx
- Ajouté `isMountedRef` avec cleanup useEffect
- Ajouté 4 guards `if (!isMountedRef.current) return` dans `handleConfirmEnd` après chaque opération async (weekSessionCount, existingBadgeRecords, database.write, buildRecapExercises)

### B6 — useAssistantWizard.ts
- Ajouté `isMountedRef` avec cleanup useEffect
- Guard après `generatePlan()` pour éviter state updates après unmount
- Guards dans catch et finally pour `setErrorAlertMessage/setErrorAlertVisible/setIsGenerating`

### S1 — StatsVolumeScreen.tsx
- Remplacé `useState<string>('Total')` par `useState<string>(t.statsVolume.total)` pour synchroniser avec le système i18n

### Q1 — ProgramDetailScreen.tsx + ProgramsScreen.tsx
- Remplacé tous les hardcoded spacing : `20` → `spacing.lg`, `10` → `spacing.sm`, `15` → `spacing.md`, `5` → `spacing.xs`
- Styles concernés : sectionLabel, moveRow, moveChip, inline Ionicons marginRight, contentContainerStyle

## Vérification
- TypeScript : ✅
- Tests : ✅ 1589 passed (96 suites)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260307-1000

## Commit
6a14311 fix(multi): resolve 7 verrif remaining issues
