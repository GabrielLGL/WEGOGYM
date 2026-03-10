# 06 — Qualité

**Run:** 2026-03-10 23:48
**Résultat:** ✅ 0 critique, 3 moyennes, ~18 mineures

## Points conformes (16+)
- `withObservables` correct partout — pas de `useState` pour DB
- Portal pattern — pas de `<Modal>` natif
- `AlertDialog` pour confirmations de suppression
- `useHaptics()` sémantique (onPress, onDelete, onSelect, onSuccess)
- `useModalState()` pour les modales
- `useColors()` / `useLanguage()` dans tous les composants
- Validation centralisée (`validationHelpers`)
- `database.write()` pour toutes les mutations
- Soft-delete History filtré correctement
- `console.error` gardé par `__DEV__`
- `useMemo`/`useCallback` appliqués correctement
- FlatList performance (initialNumToRender, windowSize, etc.)
- i18n complet (toutes les clés existent en FR et EN)
- `keyboardType="numeric"` pour saisies numériques

## Violations détectées

### 🟡 Moyennes
1. **StatsCalendarScreen:379** — `'PC'` hardcodé au lieu de `t.historyDetail.bodyweight`
2. **StatsDurationScreen:325** — `"Page X / Y"` non i18n
3. **StatsCalendarScreen:540** — `confirmColor={colors.danger}` manquant sur AlertDialog delete

### 🔵 Mineures (~18)
- ~20 magic numbers (marginTop: 2, paddingVertical: 2, etc.) sous `spacing.xs`
- HomeScreen : 3 TouchableOpacity sans `accessibilityLabel`
- ChartsScreen : boutons edit/delete sans `accessibilityLabel`
- HistoryDetailScreen : bouton delete set sans `accessibilityLabel`
- StatsScreen:136 — valeur `60` hardcodée (espace tab bar)
- ChartsScreen:354 — `marginTop: 50` hardcodé
- KpiItem dupliqué dans HomeScreen et StatsScreen (DRY)

## Score : 18/20
