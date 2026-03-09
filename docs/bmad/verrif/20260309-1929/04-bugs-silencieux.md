# Passe 4/8 — Bugs silencieux

## Résumé : 2 CRIT, 7 WARN, 8 SUGGESTIONS

### Critiques 🔴

| # | Fichier:Ligne | Problème |
|---|---------------|----------|
| 1 | `AssistantPreviewScreen.tsx:54-57` | `setIsSaving(false)` uniquement dans `catch`. Sur succès, `isSaving` reste `true` → bouton bloqué, spinner permanent |
| 2 | `useExerciseManager.ts:118-127` | `deleteAllAssociatedData()` appelé hors `database.write()` — à vérifier si la méthode wrappe en interne |

### Warnings 🟡

| # | Fichier:Ligne | Problème |
|---|---------------|----------|
| 3 | `StatsDurationScreen.tsx:140-179` | `toggleExpand` async sans unmount guard |
| 4 | `CoachMarks.tsx:142` | useEffect deps `[visible]` manque `fadeAnim`, `tooltipAnim`, `measureTarget` |
| 5 | `CoachMarks.tsx:162-172` | useEffect deps `[currentStep, ready]` manque `tooltipAnim`, `measureTarget` |
| 6 | `AlertDialog.tsx:78` | useEffect deps `[visible]` manque refs Animated (stable, risque faible) |
| 7 | `CustomModal.tsx:70` | Même pattern que AlertDialog |
| 8 | `BottomSheet.tsx:100` | useEffect deps manque refs Animated + screenHeight |
| 9 | `SettingsNotificationsSection.tsx:75-88` | handleToggleReminders async sans unmount guard |

### Suggestions 🔵

| # | Fichier:Ligne | Problème |
|---|---------------|----------|
| 10 | `HeatmapCalendar.tsx:12-15` | MONTH_LABELS hardcodé en français |
| 11 | `HeatmapCalendar.tsx:129` | "Moins"/"Plus" hardcodé |
| 12 | `WorkoutExerciseCard.tsx:124-125` | "kg"/"reps" hardcodé |
| 13 | `ProgramDetailBottomSheet.tsx:18` | `Dimensions.get('window')` module-level au lieu de useWindowDimensions() |
| 14 | `HomeScreen.tsx:183` | `lastCompletedHistory.session.id` → préférer `.sessionId` |
| 15 | `StatsVolumeScreen.tsx:111` | `s.exercise.id` → préférer `.exerciseId` |
