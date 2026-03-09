# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-10 00:19

## Points conformes
- Toutes les mutations WatermelonDB dans `database.write()` — aucune violation
- setTimeout/setInterval avec cleanup partout
- subscribe/observe gérés via withObservables
- useWorkoutCompletion/useAssistantWizard utilisent isMountedRef
- WorkoutScreen/HistoryDetailScreen utilisent flag `cancelled`

## Violations

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🟡 WARN | SettingsNotificationsSection.tsx | 75-88 | `handleToggleReminders` async sans try/catch. requestNotificationPermission() peut lancer une exception non capturée. |
| 2 | 🟡 WARN | OnboardingScreen.tsx | 75-78 | `handleSelectLanguage` async sans try/catch autour de `await setLanguage(lang)`. |
| 3 | 🟡 WARN | navigation/index.tsx | 257 | `updateReminders(...)` non await et sans .catch() — unhandled promise rejection possible. |
| 4 | 🟡 WARN | WorkoutScreen.tsx | 200-207 | useEffect setupNotificationChannel sans flag cancelled (écriture ref sur composant démonté — inoffensif mais inconsistant). |
| 5 | 🟡 WARN | HistoryDetailScreen.tsx | 46 | `s.exercise.id` sans optional chaining — crash si relation null (donnée corrompue). |

## Bilan
- 🔴 CRIT : 0
- 🟡 WARN : 5
