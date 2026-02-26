# Changelog — volume-tracker — 2026-02-26

## Résumé
Enrichissement de `StatsVolumeScreen` avec le tracking des sets par groupe musculaire. L'utilisateur peut désormais voir combien de sets il a réalisé par muscle cette semaine, et visualiser l'évolution sur 8 semaines pour le muscle de son choix.

## Décisions clés
- **Aucune migration de schéma** — `exercise.muscles` est déjà un getter `string[]` (JSON.parse depuis `_muscles`), pas de CSV à parser
- **Barres custom** plutôt que BarChart horizontal (`react-native-chart-kit` ne propose pas de BarChart horizontal)
- **LineChart bezier** pour une courbe d'évolution lisible
- **effectiveMuscle pattern** : le muscle sélectionné est validé contre la liste réelle → pas de sélection orpheline après un reset de données
- **muscleList depuis sets** : seuls les muscles des exercices réellement entraînés sont proposés

## Stories implémentées

| Story | Statut | Commit |
|-------|--------|--------|
| S01 — Helpers statsHelpers.ts | ✅ | bd903da (session parallèle) |
| S02 — Section sets/muscle/semaine | ✅ | 6ec5ec7 |
| S03 — Section évolution par muscle | ✅ | 6ec5ec7 |

## Résultat QA
- TypeScript : ✅ 0 erreur dans les fichiers modifiés
- Tests existants : ✅ non impactés
- Critères d'acceptation : ✅ tous validés (3/3 stories)
