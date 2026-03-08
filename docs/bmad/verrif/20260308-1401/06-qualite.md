# Passe 6/8 — Code mort & Qualité

**Date :** 2026-03-08 14:01

## Résumé

- 🟡 Warnings : 2
- 🔵 Suggestions : 7

## Points conformes

- ✅ Zéro `any` dans le code de production
- ✅ Tous les `console.log/warn` gardés par `__DEV__`
- ✅ Toutes les couleurs centralisées dans le thème
- ✅ Portal pattern respecté partout
- ✅ Haptics utilisé systématiquement

## Violations détectées

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🟡 | WorkoutHeader.tsx | 35 | Chaîne française hardcodée "séries" |
| 2 | 🟡 | AlertDialog.tsx | 49-50 | Defaults hardcodés FR ('Confirmer', 'Annuler') au lieu de i18n |
| 3 | 🔵 | CustomModal.tsx | 51 | Magic number `marginBottom: 20` |
| 4 | 🔵 | WorkoutExerciseCard.tsx | 383,388,557 | Magic numbers `marginBottom: 2`, `marginLeft: 2` |
| 5 | 🔵 | WorkoutScreen.tsx | 424,435 | Magic numbers `paddingBottom: 120`, `bottom: 80` |
| 6 | 🔵 | SessionDetailScreen.tsx | 447 | Magic number `borderRadius: 22` |
| 7 | 🔵 | ProgramsScreen.tsx | 201 | Magic number `paddingBottom: 150` |
| 8 | 🔵 | WorkoutSummarySheet.tsx | 391 | Magic number `paddingVertical: 1` |
| 9 | 🔵 | ExercisesScreen.tsx | 331-344 | 14 constantes magiques locales au lieu des tokens du thème |
