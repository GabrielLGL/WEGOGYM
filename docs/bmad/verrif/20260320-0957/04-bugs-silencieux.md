# Passe 4/8 — Bugs silencieux

## Bugs trouvés

### 🔴 CRITICAL

| # | Fichier | Ligne | Bug | Impact |
|---|---------|-------|-----|--------|
| 1 | `components/WorkoutExerciseCard.tsx` | 66-67 | `localWeight`/`localReps` initialisés via `useState(input.weight)` mais jamais resynchronisés quand `input` change de l'extérieur (ex: progression suggestion) | Les inputs affichent des valeurs obsolètes après une suggestion de progression — l'utilisateur valide des données incorrectes |

### 🟡 WARNING

| # | Fichier | Ligne | Bug | Impact |
|---|---------|-------|-----|--------|
| 1 | `screens/SessionDetailScreen.tsx` | 90-91 | Query histories sans filtre `deleted_at === null` — inclut les séances soft-deleted dans la prédiction de durée | Prédiction de durée faussée par les séances abandonnées/supprimées |
| 2 | `model/utils/exportHelpers.ts` | 6-17 | `TABLE_NAMES` manque 3 tables : `progress_photos`, `friend_snapshots`, `wearable_sync_logs` | Export/import incomplet — perte de données photos et snapshots amis |

## Verdict : 1 CRITICAL + 2 WARNING — tous corrigés en passe 7
