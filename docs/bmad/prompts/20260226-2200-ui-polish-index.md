<!-- v1.0 — 2026-02-26 -->
# Prompt — ui-polish — 20260226-2200

## Demande originale
Garder le design épuré légèrement neumorphique actuel. Améliorer le contraste entre sections, boutons et
champs de saisie pour que ce soit plus visuel. Corriger le mode light (primary cyan trop clair). Remplacer
les emojis par de vraies icônes vecteur pour un design épuré professionnel.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260226-2200-ui-polish-A.md` | `theme/index.ts` | 1 | ⏳ |
| B | `20260226-2200-ui-polish-B.md` | HomeScreen, SettingsScreen, StatsScreen, StatsCalendarScreen, AssistantScreen | 1 | ⏳ |
| C | `20260226-2200-ui-polish-C.md` | WorkoutSummarySheet, ProgramsScreen, ExercisesScreen, ChartsScreen, StatsMeasurementsScreen, SessionExerciseItem, WorkoutExerciseCard | 1 | ⏳ |

## Ordre d'exécution
**Tous les 3 groupes sont en vague 1 — lancer en parallèle.**

- Groupe A touche uniquement `theme/index.ts` → indépendant
- Groupes B et C touchent des fichiers différents → peuvent tourner en parallèle
- Aucune dépendance entre les groupes

## Décisions techniques
- **Icons** : `Ionicons` de `@expo/vector-icons` (déjà dans Expo, pas d'install)
- **Primary light mode** : `#006d6b` (dark teal, ratio contraste 6.8:1 sur fond clair)
- **Background différencié** : dark `#181b21` / card `#21242b`, light `#d8dde6` / card `#eef1f5`
- **Tests** : ajouter `testID` sur les boutons pour remplacer `getByText(emoji)` dans les tests

## Statut global
⏳ En attente de lancement
