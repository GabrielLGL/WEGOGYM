# 03 — Code Review

**Run:** 2026-03-10 23:48
**Résultat:** ✅ 0 critique, 3 moyennes, ~12 faibles

## Points conformes
- Pas de `<Modal>` natif — Portal pattern respecté partout
- `withObservables` HOC pour toutes les données DB
- Pas de `any` explicite en TypeScript
- Mutations DB dans `database.write()` — toutes encapsulées
- Soft-delete sur History avec filtres corrects
- Couleurs centralisées via `useColors()`
- `useHaptics()` utilisé systématiquement
- `useModalState()` pour les modales
- Validation centralisée via `validationHelpers`
- Composants fonctionnels (sauf ErrorBoundary documenté)
- Navigation Native Stack uniquement
- i18n via `useLanguage()` partout
- `__DEV__` guard sur tous les logs

## Violations détectées

### 🟡 Moyennes (DRY)
1. **Filtre History actif dupliqué 25+ fois** : `Q.where('deleted_at', null), Q.or(...)` et `h.deletedAt === null && !h.isAbandoned` → Extraire helpers `ACTIVE_HISTORY_CLAUSES` et `isActiveHistory(h)`
2. **Date locale dupliquée 7 fois** : `language === 'fr' ? 'fr-FR' : 'en-US'` → Extraire `getDateLocale(language)`
3. **ExerciseProgressChart** : ChartsScreen et ExerciseHistoryScreen dupliquent la logique chart → Composant partagé

### 🔵 Faibles
- `as never` dans navigation.navigate (StatsScreen:85, HomeScreen:214)
- `==` au lieu de `===` dans statsDuration.ts:11
- `eslint-disable-line` dans StatsDurationScreen.tsx:137
- `as unknown as string[]` cast dans StatsCalendarScreen:230
- Style inline dans StatsCalendarScreen:375
- Missing deps commentaire dans WorkoutScreen:217

## Score : 18/20
