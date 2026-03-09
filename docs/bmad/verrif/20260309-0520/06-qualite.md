# Passe 6/8 — Code mort & qualité

## Résultat : 4 issues (0 CRIT, 3 WARN, 1 INFO)

### ✅ Clean
- **TypeScript `any`** : 0
- **console.log hors `__DEV__`** : 0
- **Hardcoded colors** : 0
- **Dead imports** : 0
- **Dead code / code commenté** : 0

### 🟡 WARN — Magic numbers (repris de passe 3)
1. `useMonthNavigation.ts:46,48,50` — gesture thresholds (15, 40, 50)

### 🟡 WARN — Missing i18n (repris de passe 3)
2. `useCalendarDayDetail.ts:185` — `'Exercice inconnu'` hardcodé

### 🟡 WARN — Missing error feedback (repris de passe 3)
3. `SessionDetailScreen.tsx:144,155` — catch sans feedback user

### 🔵 INFO — eslint-disable-line
4. 3 fichiers avec `eslint-disable-line react-hooks/exhaustive-deps` — intentionnels et documentés
