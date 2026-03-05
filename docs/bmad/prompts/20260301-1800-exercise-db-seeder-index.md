<!-- v1.0 — 2026-03-01 -->
# Prompt — Exercise DB Seeder — 20260301-1800

## Demande originale

> Importer ~1300 exercices complets depuis exercisedb.dev (open-source, sans clé API)
> dans Supabase — métadonnées dans la table `exercises` + GIFs dans le bucket `exercise-gifs`.

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Bloqué par | Statut |
|--------|---------|----------|-------|------------|--------|
| A | [seeder-A.md](./20260301-1800-exercise-db-seeder-A.md) | `scripts/migrations/001-exercises-schema.sql` | 1 | — | ⏳ |
| B | [seeder-B.md](./20260301-1800-exercise-db-seeder-B.md) | `seed-exercises.mjs`, `package.json` | 1 | — (préparation) | ⏳ |

## Actions manuelles (hors Claude Code)

Ces étapes doivent être faites **par l'utilisateur** dans des interfaces web :

### 1. Supabase — exécuter le SQL (Groupe A)
- URL : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/sql/new
- Coller + exécuter `scripts/migrations/001-exercises-schema.sql`

### 2. Supabase — créer le bucket `exercise-gifs`
- URL : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets
- Nouveau bucket : `exercise-gifs` → **Public** → Save

### 3. `.env.local` — vérifier les clés
- `SUPABASE_URL` = `https://tcuchypwztvghiywhobo.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = clé JWT `eyJ...` (depuis Dashboard → Settings → API)

## Ordre d'exécution

```
Vague 1 — PARALLÈLE :
  /do docs/bmad/prompts/20260301-1800-exercise-db-seeder-A.md   → SQL + SQL bucket instructions
  /do docs/bmad/prompts/20260301-1800-exercise-db-seeder-B.md   → seed-exercises.mjs + package.json

Actions manuelles (utilisateur) :
  1. Exécuter le SQL dans Supabase Dashboard
  2. Créer le bucket exercise-gifs dans Storage
  3. Vérifier .env.local (clé JWT service_role)

Vague 2 — Terminal :
  npm install           (racine — installe les nouvelles dépendances)
  node seed-exercises.mjs   (5-15 min pour ~1300 exercices)
```

## Différences avec `exercise-animations`

| Aspect | exercise-animations | exercise-gifs (ce pipeline) |
|--------|--------------------|-----------------------------|
| Source | free-exercise-db (GitHub) | exercisedb.dev API |
| Format | WebP animé 2 frames (ffmpeg) | GIF original |
| Exercices | ~30 exercices clés | ~1300 exercices complets |
| Bucket | `exercise-animations` | `exercise-gifs` |
| Table DB | Aucune (animationMap.ts) | `public.exercises` |
| Clé API | Aucune | Aucune |

## Références

- Script : `seed-exercises.mjs` (racine)
- SQL : `scripts/migrations/001-exercises-schema.sql`
- Bucket Supabase : `exercise-gifs` @ `tcuchypwztvghiywhobo.supabase.co`
- API source : https://exercisedb.dev/api/v1/exercises
