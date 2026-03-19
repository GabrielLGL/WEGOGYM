# Passe 6/8 — Code mort & qualité

## Résultat : 8 problèmes trouvés (0 CRIT, 4 WARN, 4 SUGG)

| # | Sévérité | Type | Fichier | Ligne |
|---|----------|------|---------|-------|
| 1 | WARN | `any` TypeScript | HomeScreen.tsx | 288 |
| 2 | WARN | `any` TypeScript | LeaderboardScreen.tsx | 615 |
| 3 | WARN | Hardcoded color | StatsDurationScreen.tsx | 569 |
| 4 | WARN | Hardcoded string FR | HomeNavigationGrid.tsx | 46 |
| 5 | SUGG | Unused import | HomeHeroAction.tsx | 10 |
| 6 | SUGG | Hardcoded color splash | AnimatedSplash.tsx | 20-21 |
| 7 | SUGG | Hardcoded fallback | HomeInsightsCarousel.tsx | 116 |
| 8 | SUGG | Hardcoded fallback | HomeInsightsSection.tsx | 225 |

### Détail

**#1-2 WARN — `props: any` dans les deferred mount wrappers**
HomeScreen et LeaderboardScreen utilisent `props: any` dans les wrappers ajoutés cette session.

**#3 WARN — Hardcoded color #F59E0B20 dans StatsDurationScreen**
Couleur amber avec alpha hardcodée au lieu d'un token theme.

**#4 WARN — "ami/amis" hardcodé dans HomeNavigationGrid**
Texte français non i18n.

**#5 SUGG — Import Program inutilisé dans HomeHeroAction**

**#6 SUGG — AnimatedSplash couleurs hardcodées**
Acceptable car hors ThemeProvider, mais pourrait être exporté du theme.

**#7-8 SUGG — Fallback 'intermediate' hardcodé**
Devrait être une constante.

### Patterns OK
- console.log tous gardés par __DEV__ ✅
- Pas de code mort majeur détecté ✅
