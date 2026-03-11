<!-- v1.0 — 2026-03-11 -->
# Prompt — Widget Android (streak + prochain workout) — 20260311-1835

## Demande originale
`FINAL` Widget Android (streak, prochain workout)

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260311-1835-widget-android-A.md` | package.json, app.json, index.js, KoreWidget.tsx (placeholder), KoreWidgetTaskHandler.tsx (placeholder) | 1 | ⏳ |
| B | `20260311-1835-widget-android-B.md` | widgetDataService.ts, HomeScreen.tsx | 1 | ⏳ |
| C | `20260311-1835-widget-android-C.md` | KoreWidget.tsx (final), KoreWidgetTaskHandler.tsx (final) | 2 | ⏳ |

## Ordre d'exécution
- **Vague 1** : A et B en parallèle (indépendants)
  - A installe le package et crée les fichiers squelettes du widget
  - B crée le service de données et branche HomeScreen
- **Vague 2** : C après A+B (dépend des deux)
  - C finalise l'UI avec les vraies données du service B

## Contexte projet
- Expo 52 managed workflow, EAS Build, New Architecture (Fabric)
- WatermelonDB v35 — streak dans `users.current_streak`, next workout calculé depuis `histories` + `sessions`
- Aucun widget Android préexistant dans le projet
- Package à installer : `react-native-android-widget`
- Données streak déjà disponibles dans User model
- "Prochain workout" = session suivante après la dernière history complétée dans le même programme
