# 03 — Code Review (37 fichiers modifiés)

**Date :** 2026-03-08 14:52

## Résumé

Review adversarial des 37 fichiers modifiés sur `develop`. Code globalement propre avec de bonnes pratiques établies.

## Findings

### 🔵 Suggestion — AlertDialog: missing deps dans useEffect
**Fichier :** `components/AlertDialog.tsx:78`
Le useEffect d'animation omet `fadeAnim` et `scaleAnim` du tableau de dépendances. Ce sont des `Animated.Value` refs stables, donc pas de bug réel, mais ESLint pourrait avertir.

### 🔵 Suggestion — BottomSheet: animation deps
**Fichier :** `components/BottomSheet.tsx:100`
`slideAnim`, `fadeAnim`, `screenHeight` ne sont pas dans le tableau de dépendances du useEffect. `screenHeight` pourrait changer si l'écran est redimensionné (multi-window Android).

### 🔵 Suggestion — WorkoutExerciseCard: hardcoded opacity suffixes
**Fichier :** `components/WorkoutExerciseCard.tsx:432-433`
Utilisation de `colors.primary + '40'`, `colors.border + '60'`, `colors.primary + '18'`, `colors.border + '30'`, `colors.primary + '25'`, `colors.border + '50'`. Ces suffixes d'opacité sont cohérents mais pourraient être centralisés dans le thème pour une meilleure maintenance.

### 🔵 Suggestion — useAssistantWizard: MUSCLES_FOCUS_OPTIONS non traduit
**Fichier :** `hooks/useAssistantWizard.ts:58`
`MUSCLES_FOCUS_OPTIONS` contient des strings FR hardcodées (`'Équilibré'`, `'Pecs'`, etc.) au lieu d'utiliser le système i18n. Pas critique car c'est cohérent avec les valeurs DB, mais incomplet pour l'i18n EN.

### 🔵 Suggestion — notificationService: default params en français
**Fichier :** `services/notificationService.ts:43-44,99-100`
Les paramètres par défaut des fonctions `scheduleRestEndNotification` et `scheduleWeeklyReminders` sont en français hardcodé. Cependant, les appelants passent systématiquement les valeurs i18n, donc pas de bug en pratique.

### 🟡 Warning — WorkoutSummarySheet: StatBlock recrée styles à chaque render
**Fichier :** `components/WorkoutSummarySheet.tsx:44`
`StatBlock` appelle `useMemo(() => createStyles(colors), [colors])` mais puisque `colors` est passé en prop, chaque render du parent provoque un re-render de `StatBlock` avec un nouveau `styles` object. Impact minimal car `useMemo` protège.

## Conclusion

✅ **Aucun problème critique.** Architecture respectée, patterns WatermelonDB corrects, Portal utilisé pour tous les modals, tous les `database.write()` en place, haptics intégrés, i18n cohérent.
