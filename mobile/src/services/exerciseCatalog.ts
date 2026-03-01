/**
 * exerciseCatalog.ts
 *
 * Service REST pour interroger la table `exercises` de Supabase.
 * Utilise plain fetch (pas de @supabase/supabase-js) via l'API REST PostgREST.
 *
 * Table Supabase : exercises (873 exercices, free-exercise-db dataset)
 * RLS : lecture publique avec anon key (USING true)
 * Trigram index sur `name` → ilike performant
 */

import Constants from 'expo-constants'

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL: string = Constants.expoConfig?.extra?.supabaseUrl ?? ''
const SUPABASE_ANON_KEY: string = Constants.expoConfig?.extra?.supabaseAnonKey ?? ''
const REST_BASE = `${SUPABASE_URL}/rest/v1/exercises`
const HEADERS: Record<string, string> = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}
const PAGE_SIZE = 50

// ── Types ─────────────────────────────────────────────────────────────────────

/** Exercice tel que retourné par la table Supabase `exercises`. */
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

/** Paramètres de recherche pour `searchCatalogExercises`. */
export interface CatalogSearchParams {
  /** Recherche par nom (ilike, trigram indexé) */
  query?: string
  /** Filtre sur body_part (ex: "strength", "cardio") */
  body_part?: string
  /** Filtre sur equipment (ex: "barbell", "dumbbell") */
  equipment?: string
  /** Nombre max de résultats (défaut: 50) */
  limit?: number
  /** Décalage pour la pagination (défaut: 0) */
  offset?: number
}

/** Résultat paginé de `searchCatalogExercises`. */
export interface CatalogSearchResult {
  exercises: CatalogExercise[]
  /** true si une page suivante existe (exercises.length === limit) */
  hasMore: boolean
}

// ── Mappings ──────────────────────────────────────────────────────────────────

/**
 * Mapping body_part (free-exercise-db, EN) → MUSCLES_LIST (FR).
 * Utilisé comme fallback quand `target` n'est pas mappé.
 */
export const BODY_PART_TO_MUSCLES: Record<string, string> = {
  strength: 'Dos',
  cardio: 'Cardio',
  plyometrics: 'Quadriceps',
  stretching: 'Dos',
  powerlifting: 'Dos',
  strongman: 'Dos',
  'olympic weightlifting': 'Epaules',
}

/**
 * Mapping target muscle (EN) → MUSCLES_LIST (FR).
 * Couvre les muscles principaux du dataset free-exercise-db.
 */
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

/**
 * Mapping equipment (EN) → EQUIPMENT_LIST (FR).
 * Couvre les équipements du dataset free-exercise-db.
 */
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
  'foam roll': 'Poids du corps',
}

// ── Fonctions fetch ───────────────────────────────────────────────────────────

/**
 * Recherche des exercices dans le catalogue Supabase avec filtres et pagination.
 *
 * @param params - Paramètres de recherche (query, body_part, equipment, limit, offset)
 * @returns Liste paginée d'exercices + indicateur `hasMore`
 * @throws Error('catalog_fetch_error') en cas d'échec réseau ou HTTP
 */
export async function searchCatalogExercises(
  params: CatalogSearchParams = {}
): Promise<CatalogSearchResult> {
  const { query, body_part, equipment, limit = PAGE_SIZE, offset = 0 } = params

  const searchParams = new URLSearchParams()
  searchParams.set(
    'select',
    'id,name,body_part,equipment,target,gif_url,secondary_muscles,instructions'
  )
  searchParams.set('order', 'name.asc')
  searchParams.set('limit', String(limit))
  searchParams.set('offset', String(offset))

  if (query && query.trim().length > 0) {
    searchParams.set('name', `ilike.*${query.trim()}*`)
  }
  if (body_part) {
    searchParams.set('body_part', `eq.${body_part}`)
  }
  if (equipment) {
    searchParams.set('equipment', `eq.${equipment}`)
  }

  const url = `${REST_BASE}?${searchParams.toString()}`

  let res: Response
  try {
    res = await fetch(url, { headers: HEADERS })
  } catch {
    throw new Error('catalog_fetch_error')
  }

  if (!res.ok) {
    throw new Error('catalog_fetch_error')
  }

  const exercises = (await res.json()) as CatalogExercise[]
  return {
    exercises,
    hasMore: exercises.length === limit,
  }
}

/**
 * Récupère un exercice du catalogue par son ID.
 *
 * @param id - ID de l'exercice (ex: "Alternate_Heel_Kickbacks")
 * @returns L'exercice complet ou null si non trouvé
 * @throws Error('catalog_fetch_error') en cas d'échec réseau ou HTTP
 */
export async function getCatalogExercise(id: string): Promise<CatalogExercise | null> {
  const url = `${REST_BASE}?id=eq.${encodeURIComponent(id)}&select=*`

  let res: Response
  try {
    res = await fetch(url, { headers: HEADERS })
  } catch {
    throw new Error('catalog_fetch_error')
  }

  if (!res.ok) {
    throw new Error('catalog_fetch_error')
  }

  const results = (await res.json()) as CatalogExercise[]
  return results[0] ?? null
}

// ── Mapping vers WatermelonDB ─────────────────────────────────────────────────

/**
 * Convertit un exercice du catalogue Supabase (EN) vers le format WatermelonDB local (FR).
 * Utilisé lors de l'import d'un exercice dans la bibliothèque personnelle.
 *
 * @param ex - Exercice catalogue (anglais, free-exercise-db)
 * @returns Champs prêts à insérer dans WatermelonDB
 */
export function mapCatalogToLocal(ex: CatalogExercise): {
  name: string
  muscles: string[]
  equipment: string
  description: string
} {
  const mappedMuscle =
    TARGET_TO_MUSCLES[ex.target.toLowerCase()] ??
    BODY_PART_TO_MUSCLES[ex.body_part.toLowerCase()] ??
    'Dos'

  return {
    name: ex.name,
    muscles: [mappedMuscle],
    equipment: EQUIPMENT_TO_LOCAL[ex.equipment.toLowerCase()] ?? 'Poids du corps',
    description: ex.instructions.slice(0, 3).join(' '),
  }
}
