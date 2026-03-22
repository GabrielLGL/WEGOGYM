# Passe 6/8 — Code mort & qualité

**Date :** 2026-03-22

## Résultat

### `any` TypeScript
- ✅ 0 usage de `any` dans le code production
- `any` présent uniquement dans les tests (mocks withObservables) — acceptable

### console.log/warn/error
- ✅ Tous les console.* sont gardés par `if (__DEV__)`

### Couleurs hardcodées (production)
| # | Fichier | Valeur | Correction |
|---|---------|--------|------------|
| 🟡 1 | ExercisesScreen.tsx:490 | `rgba(255, 107, 107, 0.15)` | Utiliser `colors.danger` + opacity |
| 🟡 2 | OnboardingCard.tsx:87 | `rgba(0, 206, 201, 0.2)` | Utiliser `colors.primary` + opacity |
| ✅ | AnimatedSplash.tsx:20-21 | `#181b21`, `#00cec9` | Intentionnel (hors ThemeProvider) |

### Code mort
- ✅ Pas de code mort significatif détecté

### Imports inutilisés
- ✅ TypeScript vérifie déjà ça — 0 erreur TSC
