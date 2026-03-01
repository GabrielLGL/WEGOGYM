# CHORE(exercises) — SQL migration schema exercises + instructions bucket

Date : 2026-03-01 18:00

## Instruction
docs/bmad/prompts/20260301-1800-exercise-db-seeder-A.md

## Rapport source
docs/bmad/prompts/20260301-1800-exercise-db-seeder-A.md

## Classification
Type : chore
Fichiers modifiés :
- `scripts/migrations/001-exercises-schema.sql` (créé)

## Ce qui a été fait

- Créé le dossier `scripts/migrations/`
- Créé `scripts/migrations/001-exercises-schema.sql` avec :
  - `CREATE EXTENSION pg_trgm` (avant l'index gin — ordre important)
  - Table `public.exercises` : id, name, body_part, equipment, target, secondary_muscles, instructions, gif_url, gif_original_url, created_at, updated_at
  - 4 index : body_part, equipment, target, name (gin_trgm_ops pour full-text)
  - RLS activé : SELECT public, INSERT/UPDATE/DELETE service_role uniquement
  - Trigger `updated_at` automatique
  - Commentaire de vérification post-exécution

## Vérification
- TypeScript : N/A (fichier SQL pur)
- Tests : N/A
- Nouveau test créé : non

## Actions manuelles restantes (utilisateur)

1. **Exécuter le SQL** :
   - https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/sql/new
   - Coller + Run le contenu de `scripts/migrations/001-exercises-schema.sql`

2. **Créer le bucket `exercise-gifs`** :
   - https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets
   - New bucket → nom : `exercise-gifs` → cocher Public → file size limit 5 MB → Save

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260301-1800

## Commit
[à remplir]
