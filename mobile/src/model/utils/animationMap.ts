/**
 * animationMap — Mapping animationKey → URL image de démonstration (Supabase Storage)
 *
 * Source    : free-exercise-db (https://github.com/yuhonas/free-exercise-db)
 *             Licence CC0 — 873 exercices, images JPG haute qualité
 * Hébergement : Supabase Storage (bucket public "exercise-animations")
 *   https://tcuchypwztvghiywhobo.supabase.co/storage/v1/object/public/exercise-animations/
 *
 * Régénérer : node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts
 *
 * Fallback  : undefined → ExerciseInfoSheet affiche l'icône barbell
 * Cache     : expo-image cachePolicy="memory-disk" → offline après premier chargement
 *
 * Pour ajouter un exercice custom :
 *   1. Upload le fichier dans Supabase Storage bucket "exercise-animations"
 *   2. Ajouter la clé ici avec l'URL publique
 */

const SUPABASE_BASE =
  'https://tcuchypwztvghiywhobo.supabase.co/storage/v1/object/public/exercise-animations'

export const ANIMATION_MAP: Record<string, string | undefined> = {
  // ── Pectoraux ──────────────────────────────────────────────────────────────
  bench_press_barbell: `${SUPABASE_BASE}/bench_press_barbell.jpg`,
  bench_press_dumbbell: `${SUPABASE_BASE}/bench_press_dumbbell.jpg`,
  incline_bench_press: `${SUPABASE_BASE}/incline_bench_press.jpg`,
  push_ups: `${SUPABASE_BASE}/push_ups.jpg`,
  cable_flyes: `${SUPABASE_BASE}/cable_flyes.jpg`,
  dips_chest: `${SUPABASE_BASE}/dips_chest.jpg`,

  // ── Dos ────────────────────────────────────────────────────────────────────
  pull_ups: `${SUPABASE_BASE}/pull_ups.jpg`,
  barbell_row: `${SUPABASE_BASE}/barbell_row.jpg`,
  lat_pulldown: `${SUPABASE_BASE}/lat_pulldown.jpg`,
  deadlift: `${SUPABASE_BASE}/deadlift.jpg`,
  seated_cable_row: `${SUPABASE_BASE}/seated_cable_row.jpg`,

  // ── Jambes ─────────────────────────────────────────────────────────────────
  back_squat: `${SUPABASE_BASE}/back_squat.jpg`,
  leg_press: `${SUPABASE_BASE}/leg_press.jpg`,
  leg_extension: `${SUPABASE_BASE}/leg_extension.jpg`,
  dumbbell_lunges: `${SUPABASE_BASE}/dumbbell_lunges.jpg`,
  bulgarian_split_squat: undefined, // non disponible dans free-exercise-db
  romanian_deadlift: `${SUPABASE_BASE}/romanian_deadlift.jpg`,
  lying_leg_curl: `${SUPABASE_BASE}/lying_leg_curl.jpg`,
  barbell_hip_thrust: `${SUPABASE_BASE}/barbell_hip_thrust.jpg`,

  // ── Épaules ────────────────────────────────────────────────────────────────
  overhead_press: `${SUPABASE_BASE}/overhead_press.jpg`,
  lateral_raises: `${SUPABASE_BASE}/lateral_raises.jpg`,
  face_pull: `${SUPABASE_BASE}/face_pull.jpg`,

  // ── Biceps ─────────────────────────────────────────────────────────────────
  dumbbell_curl: `${SUPABASE_BASE}/dumbbell_curl.jpg`,
  ez_bar_curl: `${SUPABASE_BASE}/ez_bar_curl.jpg`,
  hammer_curl: `${SUPABASE_BASE}/hammer_curl.jpg`,

  // ── Triceps ────────────────────────────────────────────────────────────────
  triceps_pushdown: `${SUPABASE_BASE}/triceps_pushdown.jpg`,
  skull_crushers: `${SUPABASE_BASE}/skull_crushers.jpg`,

  // ── Abdominaux ─────────────────────────────────────────────────────────────
  crunch: `${SUPABASE_BASE}/crunch.jpg`,
  plank: `${SUPABASE_BASE}/plank.jpg`,
  leg_raises: `${SUPABASE_BASE}/leg_raises.jpg`,
}
