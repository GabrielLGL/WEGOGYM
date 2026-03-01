<!-- v1.0 — 2026-03-01 -->
# Rapport — Exercise DB Seeder — Groupe A — SQL Schema — 20260301-1800

## Objectif

Créer le fichier `scripts/migrations/001-exercises-schema.sql` contenant :
- La table `exercises` dans Supabase (métadonnées des exercices)
- Les index pour les recherches fréquentes
- Les policies RLS (Row Level Security) — lecture publique, écriture service_role
- Un bucket Supabase Storage `exercise-gifs` public (instructions — pas d'exécution directe)

## Fichiers concernés

- `scripts/migrations/001-exercises-schema.sql` (à créer)

## Contexte technique

Ce pipeline est **distinct** du pipeline `exercise-animations` (WebP/free-exercise-db).
Il s'agit ici d'importer les ~1300 exercices complets depuis **exercisedb.dev** (open-source, sans clé API) avec leurs GIFs dans un bucket **`exercise-gifs`** dédié.

### Source de données
- API : `https://exercisedb.dev/api/v1/exercises?limit=0&offset=0` (open-source, pas de clé API)
- ~1300 exercices avec : id, name, bodyPart, equipment, target, secondaryMuscles, instructions, gifUrl

### Supabase
- URL projet : `https://tcuchypwztvghiywhobo.supabase.co`
- Dashboard SQL : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/sql/new
- Dashboard Storage : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets

## Étapes

### 1. Créer le dossier migrations s'il n'existe pas

```bash
mkdir -p scripts/migrations
```

### 2. Créer `scripts/migrations/001-exercises-schema.sql` avec ce contenu exact

```sql
-- ============================================================
-- Migration 001 — Table exercises + bucket exercise-gifs
-- Projet Kore — exercisedb.dev open-source dataset
-- À exécuter via : Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Table exercises ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercises (
  id                TEXT PRIMARY KEY,           -- ex: "0001" (id exercisedb.dev)
  name              TEXT NOT NULL,
  body_part         TEXT NOT NULL,              -- ex: "back", "chest"
  equipment         TEXT NOT NULL,              -- ex: "barbell", "dumbbell"
  target            TEXT NOT NULL,              -- muscle cible principal
  secondary_muscles TEXT[] DEFAULT '{}',        -- muscles secondaires
  instructions      TEXT[] DEFAULT '{}',        -- étapes de l'exercice
  gif_url           TEXT,                       -- URL publique Supabase Storage
  gif_original_url  TEXT,                       -- URL GIF source exercisedb.dev (backup)
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exercises_body_part  ON public.exercises (body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment  ON public.exercises (equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_target     ON public.exercises (target);
CREATE INDEX IF NOT EXISTS idx_exercises_name_trgm
  ON public.exercises USING gin (name gin_trgm_ops);

-- Activer l'extension trigram pour la recherche full-text (si pas déjà active)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── RLS — Row Level Security ──────────────────────────────────
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Lecture publique (anon + authenticated)
CREATE POLICY "exercises_select_public"
  ON public.exercises FOR SELECT
  USING (true);

-- Écriture réservée au service_role (seed script)
CREATE POLICY "exercises_insert_service_role"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "exercises_update_service_role"
  ON public.exercises FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "exercises_delete_service_role"
  ON public.exercises FOR DELETE
  USING (auth.role() = 'service_role');

-- ── Trigger updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### 3. Instructions pour créer le bucket Storage (action manuelle)

Le bucket **ne peut pas** être créé via SQL — utiliser le Dashboard Supabase :

1. Aller sur : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/storage/buckets
2. Cliquer **New bucket**
3. Nom : `exercise-gifs`
4. Cocher **Public** (accès public en lecture)
5. File size limit : `5 MB` (les GIFs exercicedb font ~1-3 MB)
6. Cliquer **Save**

### 4. Exécuter le SQL dans Supabase Dashboard

1. Aller sur : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/sql/new
2. Coller le contenu de `scripts/migrations/001-exercises-schema.sql`
3. Cliquer **Run**
4. Vérifier : message "Success" + table `exercises` visible dans Table Editor

## Contraintes

- Ne pas mettre de vraies clés dans le fichier SQL
- Le fichier SQL est versioned (commitable) — pas de secrets
- L'index `gin_trgm_ops` nécessite l'extension `pg_trgm` (activée dans le SQL)
- Le bucket `exercise-gifs` est distinct de `exercise-animations` (WebP/free-exercise-db)

## Critères de validation

- `scripts/migrations/001-exercises-schema.sql` existe et est lisible
- Dans Supabase Dashboard → Table Editor → table `exercises` visible avec les colonnes
- Bucket `exercise-gifs` visible dans Storage → Buckets (statut Public)
- `SELECT count(*) FROM public.exercises;` retourne 0 (table vide — le seed vient après)

## Dépendances

Aucune dépendance sur d'autres groupes. Peut être exécuté en parallèle avec le Groupe B.

## Statut

✅ Résolu — 20260301-1800

## Résolution
Rapport do : docs/bmad/do/20260301-1800-chore-exercises-schema.md
