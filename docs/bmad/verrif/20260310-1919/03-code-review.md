# Passe 3/8 — Code Review

**Date :** 2026-03-10 19:19

## Résumé : 2 CRIT, 5 WARN, 1 SUGG

### 🔴 CR-1 — StatsScreen + StatsExercisesScreen : sets query sans filtre soft-delete
**Fichiers :** `screens/StatsScreen.tsx:213`, `screens/StatsExercisesScreen.tsx:289`
Sets de histories supprimées inclus dans les stats (PRs, volume).

### 🔴 CR-2 — PR detection échoue pour le premier set d'un exercice
**Fichier :** `hooks/useWorkoutState.ts:112`
`maxWeight > 0 && weight > maxWeight` → le tout premier set n'est jamais détecté comme PR.
**Fix :** `weight > 0 && weight > maxWeight`

### 🟡 CR-3 — MUSCLES_FOCUS_OPTIONS hardcodé en français
**Fichier :** `hooks/useAssistantWizard.ts:75`
Labels affichés en français même en mode EN. WizardStepContent traduit via `t.assistant.musclesFocus[muscle]` mais les keys sont françaises.

### 🟡 CR-4 — ExerciseHistoryScreen setsForExercise sans filtre soft-delete
**Fichier :** `screens/ExerciseHistoryScreen.tsx:332-335`

### 🟡 CR-5 — se.exercise.id sans null guard
**Fichier :** `hooks/useWorkoutState.ts:18,63`

### 🟡 CR-6 — recalculateSetPrsBatch concurrent database.write()
**Fichier :** `model/utils/workoutSetUtils.ts:194`
Devrait être un seul batch write.

### 🟡 CR-7 — HistoryDetailScreen.handleSave sans validation inputs
**Fichier :** `screens/HistoryDetailScreen.tsx:162`
parseFloat/parseInt sans validateSetInput → valeurs hors limites possibles.

### 🔵 CR-8 — MUSCLES_FOCUS_OPTIONS mutable + non-i18n pattern
**Fichier :** `hooks/useAssistantWizard.ts:75`
