# CHORE(exercises) — Création seed-exercises.mjs + mise à jour package.json

Date : 2026-03-01 18:05

## Instruction
docs/bmad/prompts/20260301-1800-exercise-db-seeder-B.md

## Rapport source
docs/bmad/prompts/20260301-1800-exercise-db-seeder-B.md

## Classification
Type : chore
Fichiers modifiés :
- `seed-exercises.mjs` (créé à la racine)
- `package.json` (racine — 3 dépendances ajoutées)

## Ce qui a été fait

### `package.json` racine
Ajout dans `"dependencies"` :
- `@supabase/supabase-js": "^2.47.10`
- `"dotenv": "^16.4.7"`
- `"node-fetch": "^3.3.2"`

### `seed-exercises.mjs`
Script de seeding complet (~180 lignes) :
- Chargement `.env.local` manuel (même pattern que `build-exercise-animations.mjs`)
- Fallback `SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_KEY`
- `SUPABASE_URL` hardcodé en fallback (`tcuchypwztvghiywhobo.supabase.co`)
- Fetch `https://exercisedb.dev/api/v1/exercises?limit=0&offset=0`
- Traitement batch de 5, délai 300ms
- **Idempotent** : check `gifExistsInStorage()` avant chaque upload
- Upload GIF dans bucket `exercise-gifs` (upsert)
- Upsert métadonnées dans table `exercises` (onConflict: 'id')
- Log `[X/N] nom ✅ / ⏭ déjà en Storage / ⚠ pas de gifUrl / ❌ erreur`
- JSDoc sur toutes les fonctions helper

## Vérification
- TypeScript : N/A (script Node .mjs, pas dans mobile/src/)
- Syntaxe Node : ✅ (`node --check seed-exercises.mjs` → OK)
- package.json : ✅ (JSON valide)
- Tests : N/A
- Nouveau test créé : non

## Note d'exécution
`npm install` doit être lancé manuellement avant `node seed-exercises.mjs`.
Le script nécessite aussi le Groupe A (table + bucket) complété.

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260301-1805

## Commit
[à remplir]
