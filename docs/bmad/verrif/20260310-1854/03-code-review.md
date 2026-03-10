# Passe 3/8 — Code Review

**Date :** 2026-03-10 18:54

## Résumé : 0 CRIT, 5 WARN, 3 SUGG

### 🟡 CR-1 — `MUSCLES_FOCUS_OPTIONS` hardcodé en français (i18n)
**Fichier :** `hooks/useAssistantWizard.ts:75`
Seul tableau d'options non traduit. Les utilisateurs EN verront des labels français.

### 🟡 CR-2 — StatsVolumeScreen observe TOUS les sets sans filtre
**Fichier :** `screens/StatsVolumeScreen.tsx:404`
Charge tous les sets en mémoire sans filtre temps ni soft-delete.

### 🟡 CR-3 — ExerciseHistoryScreen observe TOUTES les histories/sessions
**Fichier :** `screens/ExerciseHistoryScreen.tsx:338-341`
Charge l'intégralité des tables au lieu de filtrer par exercice.

### 🟡 CR-4 — ErrorBoundary hardcode du texte français, ignore i18n
**Fichier :** `components/ErrorBoundary.tsx:63-76`
Class component → ne peut pas utiliser useLanguage(). Wrap fonctionnel possible.

### 🟡 CR-5 — Abandon workout : les sets validés persistent en DB
**Fichier :** `screens/WorkoutScreen.tsx:272-279`
L'abandon ne soft-delete pas la history ni ne supprime les sets → données polluent les stats.

### 🔵 CR-6 — WorkoutExerciseCard content pas React.memo
**Fichier :** `components/WorkoutExerciseCard.tsx`

### 🔵 CR-7 — `se.exercise.id` synchrone sur Relation
**Fichier :** `hooks/useWorkoutState.ts:18,63`

### 🔵 CR-8 — `exerciseColors` useMemo dep non-standard
**Fichier :** `components/WorkoutSupersetBlock.tsx:222`
