<!-- v1.0 — 2026-03-01 -->
# Rapport — Exercise Catalog — Groupe A — 20260301-1930

## Objectif
Créer le service REST qui interroge la table `exercises` de Supabase depuis l'app mobile,
et exposer la clé anon Supabase via `app.json`.

## Fichiers concernés
- `mobile/app.json` — ajouter `supabaseUrl` + `supabaseAnonKey` dans `extra`
- `mobile/src/services/exerciseCatalog.ts` — **NOUVEAU** : fonctions fetch REST

## Contexte technique

### Table Supabase `exercises` (colonne → type)
```
id                TEXT PRIMARY KEY   (ex: "Alternate_Heel_Kickbacks")
name              TEXT NOT NULL      (nom anglais, ex: "Barbell Squat")
body_part         TEXT NOT NULL      (catégorie free-exercise-db, ex: "strength", "cardio")
equipment         TEXT NOT NULL      (ex: "barbell", "dumbbell", "body only", "other")
target            TEXT NOT NULL      (muscle principal, ex: "glutes", "quads")
secondary_muscles TEXT[]             (muscles secondaires)
instructions      TEXT[]             (étapes d'exécution)
gif_url           TEXT               (URL publique Supabase Storage — fichier .jpg)
gif_original_url  TEXT               (URL GitHub source)
```

### Supabase REST API
- **Base URL** : `https://tcuchypwztvghiywhobo.supabase.co/rest/v1/exercises`
- **Headers requis** :
  - `apikey: <SUPABASE_ANON_KEY>`
  - `Authorization: Bearer <SUPABASE_ANON_KEY>`
- **RLS** : politique publique SELECT `USING (true)` — lecture libre avec anon key
- **pg_trgm activé** : le filtre `ilike` est indexé sur `name`

### Supabase REST query params utiles
- Recherche : `?name=ilike.*squat*` (case-insensitive, trigram indexé)
- Filtre muscle : `&target=eq.quads`
- Filtre equipment : `&equipment=eq.barbell`
- Pagination : `&limit=50&offset=0`
- Ordre : `&order=name.asc`
- Sélection colonnes : `&select=id,name,body_part,equipment,target,gif_url`

### Clé anon Supabase
La clé anon est **publique** (conçue pour être dans le code client).
Elle est différente de la `service_role` (qui est secrète).
**Action manuelle requise** : récupérer dans Supabase Dashboard → Settings → API →
"Project API keys" → **anon / public** (commence par `eyJ...`).

### app.json — structure extra actuelle
```json
"extra": {
  "eas": { "projectId": "2f547162-0beb-4cfa-90c1-e6b8095203ae" },
  "sentryDsn": null
}
```

### Architecture mobile
- Pas de `@supabase/supabase-js` dans `mobile/` — utiliser `fetch` natif
- TypeScript strict, pas de `any`
- Conventions projet : `mobile/src/services/` pour les services externes

## Étapes

### 1. `mobile/app.json` — ajouter les clés Supabase dans `extra`
Ajouter dans `"extra"` :
```json
"supabaseUrl": "https://tcuchypwztvghiywhobo.supabase.co",
"supabaseAnonKey": "PLACEHOLDER_REMPLACER_PAR_LA_VRAIE_CLE_ANON"
```
**Note** : laisser `"PLACEHOLDER_REMPLACER_PAR_LA_VRAIE_CLE_ANON"` — l'utilisateur
remplacera manuellement avec la vraie clé anon depuis le Dashboard Supabase.

### 2. `mobile/src/services/exerciseCatalog.ts` — service REST

Créer le fichier avec :

**Types TypeScript** :
```typescript
export interface CatalogExercise {
  id: string
  name: string
  body_part: string
  equipment: string
  target: string
  secondary_muscles: string[]
  instructions: string[]
  gif_url: string | null
  gif_original_url: string | null
}

export interface CatalogSearchParams {
  query?: string        // recherche par nom (ilike)
  body_part?: string    // filtre catégorie
  equipment?: string    // filtre équipement
  limit?: number        // défaut 50
  offset?: number       // défaut 0
}

export interface CatalogSearchResult {
  exercises: CatalogExercise[]
  hasMore: boolean
}
```

**Config** (utiliser `expo-constants`) :
```typescript
import Constants from 'expo-constants'

const SUPABASE_URL: string = Constants.expoConfig?.extra?.supabaseUrl ?? ''
const SUPABASE_ANON_KEY: string = Constants.expoConfig?.extra?.supabaseAnonKey ?? ''
const REST_BASE = `${SUPABASE_URL}/rest/v1/exercises`
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}
const PAGE_SIZE = 50
```

**Fonction `searchCatalogExercises`** :
- Construit les query params selon `CatalogSearchParams`
- `query` → `name=ilike.*${encodeURIComponent(query)}*`
- `body_part` → `body_part=eq.${encodeURIComponent(body_part)}`
- `equipment` → `equipment=eq.${encodeURIComponent(equipment)}`
- `limit` → `limit=${limit ?? PAGE_SIZE}`, `offset` → `offset=${offset ?? 0}`
- `order=name.asc`
- Select : `select=id,name,body_part,equipment,target,gif_url,secondary_muscles,instructions`
- Return : `CatalogSearchResult` avec `hasMore = exercises.length === (limit ?? PAGE_SIZE)`
- En cas d'erreur réseau ou HTTP : throw `Error('catalog_fetch_error')`

**Fonction `getCatalogExercise`** :
- Fetch un exercice par ID : `?id=eq.${id}&select=*`
- Return : `CatalogExercise | null`

**Constantes de mapping** (pour importer dans WatermelonDB plus tard) :
```typescript
// Mapping body_part (free-exercise-db) → MUSCLES_LIST (FR)
export const BODY_PART_TO_MUSCLES: Record<string, string> = {
  strength: 'Dos',      // fallback générique
  cardio: 'Cardio',
  plyometrics: 'Quadriceps',
  stretching: 'Dos',
  powerlifting: 'Dos',
  strongman: 'Dos',
  'olympic weightlifting': 'Epaules',
}

// Mapping target muscle (EN) → MUSCLES_LIST (FR)
export const TARGET_TO_MUSCLES: Record<string, string> = {
  glutes: 'Ischios',
  hamstrings: 'Ischios',
  quads: 'Quadriceps',
  quadriceps: 'Quadriceps',
  chest: 'Pecs',
  'upper chest': 'Pecs',
  back: 'Dos',
  lats: 'Dos',
  traps: 'Trapèzes',
  shoulders: 'Epaules',
  'front delts': 'Epaules',
  'rear delts': 'Epaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  abs: 'Abdos',
  calves: 'Mollets',
  cardiovascular: 'Cardio',
}

// Mapping equipment (EN) → EQUIPMENT_LIST (FR)
export const EQUIPMENT_TO_LOCAL: Record<string, string> = {
  barbell: 'Poids libre',
  dumbbell: 'Poids libre',
  kettlebell: 'Poids libre',
  'cable machine': 'Poulies',
  cable: 'Poulies',
  machine: 'Machine',
  'body only': 'Poids du corps',
  'body weight': 'Poids du corps',
  other: 'Poids du corps',
  band: 'Poids du corps',
  'medicine ball': 'Poids libre',
  'exercise ball': 'Machine',
  foam roll: 'Poids du corps',
}
```

**Fonction `mapCatalogToLocal`** :
Prend un `CatalogExercise` et retourne `{ name, muscles, equipment, description }` pour WatermelonDB :
```typescript
export function mapCatalogToLocal(ex: CatalogExercise): {
  name: string
  muscles: string[]
  equipment: string
  description: string
}
```
- `name` : `ex.name`
- `muscles` : tableau avec `TARGET_TO_MUSCLES[ex.target] ?? 'Dos'` (dedupliqué)
- `equipment` : `EQUIPMENT_TO_LOCAL[ex.equipment] ?? 'Poids du corps'`
- `description` : `ex.instructions.slice(0, 3).join(' ')` (max 3 étapes, tronqué)

## Contraintes
- **PAS** de `@supabase/supabase-js` dans mobile/
- **PAS** de `any` TypeScript
- **PAS** de console.log (guard `__DEV__` si nécessaire)
- `expo-constants` est déjà installé dans `mobile/` (dépendance Expo standard)

## Critères de validation
- `npx tsc --noEmit` dans `mobile/` → zéro erreur
- Le fichier `exerciseCatalog.ts` compile sans erreur
- Les types sont corrects (pas de `any`)

## Dépendances
Aucune dépendance sur d'autres groupes — peut être développé en parallèle avec rien.

## Statut
⏳ En attente
