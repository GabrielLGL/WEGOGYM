# FEAT(exercises) — Service REST catalogue exercises + config Supabase

Date : 2026-03-01 19:35

## Instruction
docs/bmad/prompts/20260301-1930-exercise-catalog-A.md

## Rapport source
docs/bmad/prompts/20260301-1930-exercise-catalog-A.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/app.json` (supabaseUrl + supabaseAnonKey dans extra)
- `mobile/src/services/exerciseCatalog.ts` (créé)

## Ce qui a été fait

### `mobile/app.json`
Ajout dans `"extra"` :
- `supabaseUrl` : `https://tcuchypwztvghiywhobo.supabase.co`
- `supabaseAnonKey` : clé anon publique (fournie par l'utilisateur)

### `mobile/src/services/exerciseCatalog.ts` (nouveau)
Service REST complet pour la table `exercises` Supabase :

**Types exportés** :
- `CatalogExercise` — structure de la table Supabase
- `CatalogSearchParams` — paramètres de recherche (query, body_part, equipment, limit, offset)
- `CatalogSearchResult` — `{ exercises, hasMore }`

**Fonctions exportées** :
- `searchCatalogExercises(params)` — liste paginée avec ilike + filtres (50/page)
- `getCatalogExercise(id)` — fetch un exercice par ID

**Mappings exportés** :
- `BODY_PART_TO_MUSCLES` — catégorie EN → MUSCLES_LIST FR
- `TARGET_TO_MUSCLES` — muscle EN → MUSCLES_LIST FR
- `EQUIPMENT_TO_LOCAL` — équipement EN → EQUIPMENT_LIST FR
- `mapCatalogToLocal(ex)` — convertit un CatalogExercise en champs WatermelonDB FR

**Technique** :
- Plain fetch (pas de `@supabase/supabase-js`)
- Config via `expo-constants` (`Constants.expoConfig?.extra`)
- Headers : `apikey` + `Authorization: Bearer`
- URLSearchParams pour construire les query params PostgREST
- Gestion erreur : throw `Error('catalog_fetch_error')` sur échec réseau/HTTP

## Vérification
- TypeScript : ✅ `npx tsc --noEmit` → EXIT 0
- Tests : ✅ passWithNoTests (pas de test pour ce service)
- Nouveau test créé : non (service réseau — mock complexe, hors scope)

## Documentation mise à jour
Aucune (JSDoc complet dans le fichier)

## Statut
✅ Résolu — 20260301-1935

## Commit
À remplir
