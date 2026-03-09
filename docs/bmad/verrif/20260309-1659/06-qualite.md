# Passe 6/8 — Code mort & qualité

**Date :** 2026-03-09 16:59

## Résultat : Codebase propre, quelques points mineurs

### Vérifié OK ✅
- **0 `any` en production** (207 `as any` dans tests uniquement)
- **0 console.log/warn hors `__DEV__`**
- **0 couleur hardcodée en production** (toutes dans theme/index.ts)
- **0 `<Modal>` natif**
- **0 import inutilisé** (TSC strict le détecte)

### WARNING

| # | Fichier | Lignes | Catégorie | Description |
|---|---------|--------|-----------|-------------|
| Q1 | `ProgramDetailBottomSheet.tsx` | 42 | I18N | `'Aucun exercice'` hardcodé au lieu de `t.xxx` |
| Q2 | ~20 fichiers | multiples | MAGIC_NUMBER | Dimensions hardcodées (44, 50, 55, 60, 80, 100, 120, 150, 200) au lieu de tokens theme |
| Q3 | 12 fichiers test | multiples | ANY (tests) | 207 occurrences `as any` pour mocker WatermelonDB |

### SUGGESTION

| # | Description |
|---|-------------|
| S1 | Extraire `ICON_CONTAINER_WIDTH = 30` (dupliqué 8 fois entre ProgramDetailScreen et ProgramsScreen) |
| S2 | Créer des factories de mock typées pour réduire `as any` dans les tests |
