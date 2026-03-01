-- ============================================================
-- Migration 001 — Table exercises + bucket exercise-gifs
-- Projet Kore — exercisedb.dev open-source dataset
-- À exécuter via : Supabase Dashboard → SQL Editor
-- URL : https://supabase.com/dashboard/project/tcuchypwztvghiywhobo/sql/new
-- ============================================================

-- ── Extension trigram (pour la recherche full-text) ──────────
-- Doit être créée AVANT l'index gin_trgm_ops
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

-- ── Vérification ─────────────────────────────────────────────
-- Après exécution, vérifier :
--   SELECT count(*) FROM public.exercises;  → doit retourner 0 (table vide)
--   \d public.exercises                     → affiche les colonnes
