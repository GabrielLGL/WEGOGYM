<!-- v1.0 — 2026-03-11 -->
# Prompt — Photos de progression (before/after) — 20260311-2145

## Demande originale
`FINAL` Photos de progression (before/after)

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260311-2145-photos-progression-A.md` | schema.ts, migrations.ts, ProgressPhoto.ts, model/index.ts | 1 | ⏳ |
| B | `20260311-2145-photos-progression-B.md` | package.json, progressPhotoService.ts | 1 | ⏳ |
| C | `20260311-2145-photos-progression-C.md` | ProgressPhotosScreen.tsx, navigation/index.tsx, HomeScreen.tsx, fr.ts, en.ts | 2 | ⏳ |

## Ordre d'exécution

### Vague 1 — Parallèle
- **Groupe A** (Backend) : Schema v36 + modèle ProgressPhoto + migration
- **Groupe B** (Infra) : Install expo-image-picker + service de gestion photos

A et B sont indépendants — aucun fichier en commun.

### Vague 2 — Séquentiel (après vague 1)
- **Groupe C** (UI) : Écran ProgressPhotosScreen + navigation + HomeScreen
  - Dépend de A (modèle DB) et B (service photos)
  - Ne peut démarrer que quand A et B sont validés

## Résumé technique
- **Nouvelle table** : `progress_photos` (7 colonnes)
- **Nouvelle dépendance** : `expo-image-picker`
- **Nouveaux fichiers** : ProgressPhoto.ts, progressPhotoService.ts, ProgressPhotosScreen.tsx
- **Fichiers modifiés** : schema.ts (v36), migrations.ts, model/index.ts, navigation/index.tsx, HomeScreen.tsx, fr.ts, en.ts
- **Schema** : v35 → v36
