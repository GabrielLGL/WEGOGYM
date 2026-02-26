<!-- v1.0 — 2026-02-26 -->
# Prompt — Neumorphisme : reliefs + toggle dark/light — 20260226

## Demande originale
> "il n'y a pas assez de reliefs d'ombre et il faut une option dans les settings avec dark mode ou light mode qui change le theme"

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260226-theme-A.md | `theme/index.ts` | 1 | ⏳ |
| B | 20260226-theme-B.md | `theme/index.ts`, `contexts/ThemeContext.tsx` (nouveau), `schema.ts`, `User.ts` | 1 | ⏳ |
| C | 20260226-theme-C.md | `navigation/index.tsx`, `SettingsScreen.tsx` | 2 | ⏳ |
| D | 20260226-theme-D.md | 40 composants/écrans | 2 | ⏳ |

## Ordre d'exécution

**Vague 1** (A et B en parallèle — indépendants) :
- A ne touche que `neuShadow` dans le theme
- B crée le ThemeContext + ajoute lightColors + migre le schema

**Vague 2** (C et D en parallèle — après B) :
- C wire le toggle dans Settings + Navigation (dépend de ThemeContext de B)
- D migre tous les composants vers `useColors()` (dépend de ThemeContext de B)

## Note architecturale

Le principe technique clé : `StyleSheet.create({ color: colors.text })` est évalué
UNE FOIS au chargement du module. Pour que le theme toggle fonctionne visuellement,
tous les composants doivent adopter le pattern `useStyles(colors)` (Groupe D).

Sans le Groupe D, le toggle dans Settings change la navigation et les écrans
migrés dans C, mais les composants gardent les styles dark. Le Groupe D est la
migration complète qui rend tout dynamique.
