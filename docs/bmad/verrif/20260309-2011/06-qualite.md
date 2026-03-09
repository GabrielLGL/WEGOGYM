# Passe 6/8 — Code mort & qualité

**Date :** 2026-03-09 20:11

## Points conformes

- 0 `any` dans le code de production
- 0 `console.*` sans guard `__DEV__` en production
- 0 couleur hardcodée hors `theme/index.ts`
- 0 `fontSize` hardcodé en production
- 0 `<Modal>` natif React Native
- `withObservables`, `useHaptics()`, `useModalState()`, `validationHelpers` correctement utilisés

## Violations détectées

| # | Sévérité | Fichier | Ligne(s) | Problème |
|---|----------|---------|----------|----------|
| 1 | WARN | `hooks/__tests__/useWorkoutCompletion.test.ts` | 85+ (x10) | `let output: any` — 10 occurrences |
| 2 | WARN | 12 fichiers `__tests__/` | (multiples) | 197 occurrences de `as any` dans les mocks de test |
| 3 | SUGG | `screens/ChartsScreen.tsx` | 348, 352 | `marginBottom: 6`, `marginTop: 50` — valeurs magiques mineures (contextual, gardées) |
| 4 | SUGG | `screens/ExerciseCatalogScreen.tsx` | 623 | `paddingTop: 80` — valeur magique layout |
| 5 | SUGG | `screens/ProgramsScreen.tsx` | 211 | `paddingBottom: 150` — valeur magique scroll |
| 6 | SUGG | `screens/ProgramDetailScreen.tsx` | 289 | `paddingBottom: 100` — valeur magique scroll |

## Recommandations

1. **Priorité moyenne** : Créer des factories de mock typées pour remplacer les `as any` dans les tests
2. **Priorité basse** : Extraire les constantes de padding scroll en constantes nommées
3. **Bilan** : code de production propre et conforme, améliorations possibles uniquement dans les tests
