# Passe 7/8 — Corrections

## 7b — Warnings 🟡 (1 corrigé)

### W1 — Hardcoded locale 'fr-FR' → dateLocale dynamique

**Fichier :** `screens/ExerciseHistoryScreen.tsx:67`
**Avant :** `s.startTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })`
**Après :** `s.startTime.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' })`
**+ ajout** de `dateLocale` dans les dépendances du useMemo (ligne 71)

### Vérifications post-correction

- `npx tsc --noEmit` : ✅ 0 erreurs
- `npx jest --testPathPattern=ExerciseHistory` : ✅ 8/8 tests passent

## Résumé

| Catégorie | Trouvés | Corrigés |
|-----------|---------|----------|
| 🔴 Critiques | 0 | 0 |
| 🟡 Warnings | 1 | 1 |
| 🔵 Suggestions | 0 | 0 |
