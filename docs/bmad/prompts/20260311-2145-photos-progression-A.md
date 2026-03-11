<!-- v1.0 — 2026-03-11 -->
# Rapport — Photos de progression — Groupe A — 20260311-2145

## Objectif
Ajouter le support backend pour stocker les métadonnées des photos de progression : nouvelle table `progress_photos` dans WatermelonDB, modèle TypeScript, migration du schéma v35 → v36.

## Fichiers concernés
- `mobile/src/model/schema.ts` — ajouter table `progress_photos`, incrémenter version à 36
- `mobile/src/model/migrations.ts` — ajouter migration v35 → v36
- `mobile/src/model/models/ProgressPhoto.ts` — **nouveau fichier** : modèle WatermelonDB
- `mobile/src/model/index.ts` — enregistrer le modèle ProgressPhoto

## Contexte technique

### Stack
- WatermelonDB (SQLite/JSI) — schéma actuel v35
- TypeScript strict, `experimentalDecorators: true`, `useDefineForClassFields: false`
- Mutations DB obligatoirement dans `database.write()`

### Table `progress_photos` — colonnes
| Colonne | Type | Optional | Description |
|---------|------|----------|-------------|
| `date` | `number` | non | Timestamp de la photo |
| `photo_uri` | `string` | non | Chemin local du fichier image (dans le dossier app) |
| `category` | `string` | oui | Catégorie : 'front', 'side', 'back', ou null (libre) |
| `note` | `string` | oui | Note utilisateur optionnelle |
| `body_measurement_id` | `string` | oui | Lien optionnel vers un BodyMeasurement |
| `created_at` | `number` | non | Timestamp création |
| `updated_at` | `number` | non | Timestamp mise à jour |

### Pattern existant — exemple BodyMeasurement
Voir `mobile/src/model/models/BodyMeasurement.ts` pour le pattern exact :
- `extends Model`, decorators `@field`, `@text`, `@date`, `@readonly`
- Export default de la classe

### Pattern migration existant
Voir `mobile/src/model/migrations.ts` pour le format des migrations WatermelonDB :
- `schemaMigrations({ migrations: [...] })`
- Chaque migration : `{ toVersion: N, steps: [addColumns/createTable] }`

## Étapes
1. **Créer** `mobile/src/model/models/ProgressPhoto.ts`
   - Classe `ProgressPhoto extends Model`
   - `static table = 'progress_photos'`
   - Decorators pour chaque colonne (cf tableau ci-dessus)
   - `@relation('body_measurements', 'body_measurement_id')` pour le lien optionnel

2. **Modifier** `mobile/src/model/schema.ts`
   - Incrémenter `version` de 35 à 36
   - Ajouter `tableSchema({ name: 'progress_photos', columns: [...] })`

3. **Modifier** `mobile/src/model/migrations.ts`
   - Ajouter migration `{ toVersion: 36, steps: [createTable({ name: 'progress_photos', columns: [...] })] }`

4. **Modifier** `mobile/src/model/index.ts`
   - Importer `ProgressPhoto`
   - Ajouter au tableau `modelClasses`

## Contraintes
- Ne pas casser les tables existantes
- Respecter le sync Schema ↔ Model (chaque @field doit avoir sa colonne et vice versa)
- Les photos ne sont PAS stockées en DB — seulement le chemin URI local
- Pas de `any` TypeScript
- Pas de `console.log` sans `__DEV__`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Le schéma v36 compile et la migration est cohérente
- Le modèle ProgressPhoto a tous les decorators correspondant aux colonnes

## Dépendances
Aucune dépendance — peut être lancé en parallèle avec Groupe B.

## Statut
⏳ En attente
