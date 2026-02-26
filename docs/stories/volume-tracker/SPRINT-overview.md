# Sprint — volume-tracker — 2026-02-26

## Feature
Volume Tracker Complet — Sets par muscle par semaine + évolution dans le temps.
Enrichissement de StatsVolumeScreen. Aucune migration de schéma.

## Stories dans l'ordre d'implémentation

| Story | Titre | Estimation | Dépendances |
|-------|-------|-----------|-------------|
| S01 | Helpers sets/muscle dans statsHelpers.ts | S | — |
| S02 | Section "Sets par muscle cette semaine" | S | S01 |
| S03 | Section "Évolution par muscle" (line chart) | M | S01, S02 |

## Estimation totale
S + S + M = ~4h de dev

## Fichiers modifiés
- `mobile/src/model/utils/statsHelpers.ts` (+2 types, +2 fonctions)
- `mobile/src/screens/StatsVolumeScreen.tsx` (+2 sections)

## Aucun nouveau fichier requis

## Résultat attendu
L'écran StatsVolumeScreen affiche, en plus des sections existantes :
1. La répartition des sets par muscle pour la semaine courante (barres)
2. L'évolution des sets par muscle sélectionnable sur 8 semaines (line chart)
