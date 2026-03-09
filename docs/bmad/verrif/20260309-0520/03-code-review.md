# Passe 3/8 — Code Review

## Résultat : 4 issues trouvées (0 CRIT, 3 WARN, 1 INFO)

### 🟡 WARN-1 : Hardcoded i18n string in useCalendarDayDetail
- **Fichier** : `hooks/useCalendarDayDetail.ts:185`
- **Problème** : `'Exercice inconnu'` hardcodé au lieu de `t.statsCalendar.unknownExercise`
- **Fix** : Passer `t` en paramètre du hook ou utiliser `useLanguage()`

### 🟡 WARN-2 : Missing error toast in SessionDetailScreen group operations
- **Fichier** : `screens/SessionDetailScreen.tsx:144,155`
- **Problème** : `handleCreateGroup` et `handleUngroup` catch blocks ne montrent qu'un dev console.warn, aucun feedback utilisateur
- **Fix** : Ajouter `setToastMessage(t.common.error)` dans les catch

### 🟡 WARN-3 : Magic numbers in useMonthNavigation gesture thresholds
- **Fichier** : `hooks/useMonthNavigation.ts:46,48,50`
- **Problème** : `15`, `40`, `50` hardcodés pour les seuils de swipe
- **Fix** : Extraire en constantes nommées

### 🔵 INFO-1 : SessionDetailScreen toast animation unmount
- **Fichier** : `screens/SessionDetailScreen.tsx:104`
- **Problème** : `setToastMessage(null)` dans callback d'animation peut fire après unmount
- **Impact** : Mineur — React gère gracieusement, warning potentiel en dev
- **Decision** : Ne pas corriger — risque de régression > bénéfice

### Issues agent rejetées (faux positifs)
- CoachMarks dependency array : deps correctement memoizées avec useCallback, guard `targetLayout !== null` prévient les boucles
- useWorkoutCompletion isMountedRef : check à L159 + L193 suffisant, le write() L176 DOIT persister même si unmount
- handleValidateSet stale state : géré explicitement par `se.id === sessionExercise.id` L274
- unsafeSqlQuery : SQL hardcodé sans input user, pattern acceptable
