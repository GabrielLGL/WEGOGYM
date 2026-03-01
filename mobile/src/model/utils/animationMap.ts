/**
 * animationMap — Mapping animationKey → URL image de démonstration (wger.de CDN)
 *
 * Source : wger.de (https://wger.de) — projet open-source fitness, images libres de droits.
 * Récupérées via https://wger.de/api/v2/exerciseinfo/{base_id}/?format=json
 *
 * Fallback : undefined → ExerciseInfoSheet affiche l'icône barbell
 * Cache    : expo-image cachePolicy="memory-disk" → offline après premier chargement
 *
 * Pour ajouter un exercice : ajouter la clé animationKey → URL dans ce fichier.
 */
export const ANIMATION_MAP: Record<string, string | undefined> = {
  // ── Pectoraux ──────────────────────────────────────────────────────────────
  bench_press_barbell:
    'https://wger.de/media/exercise-images/192/Bench-press-1.png',
  bench_press_dumbbell:
    'https://wger.de/media/exercise-images/97/Dumbbell-bench-press-1.png',
  incline_bench_press:
    'https://wger.de/media/exercise-images/41/Incline-bench-press-1.png',
  push_ups:
    'https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png',
  cable_flyes:
    'https://wger.de/media/exercise-images/71/Cable-crossover-2.png',
  dips_chest:
    'https://wger.de/media/exercise-images/83/Bench-dips-1.png',

  // ── Dos ────────────────────────────────────────────────────────────────────
  pull_ups:
    'https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg',
  barbell_row:
    'https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png',
  lat_pulldown:    undefined, // pas d'image disponible sur wger.de
  deadlift:
    'https://wger.de/media/exercise-images/184/1709c405-620a-4d07-9658-fade2b66a2df.jpeg',
  seated_cable_row:
    'https://wger.de/media/exercise-images/143/Cable-seated-rows-2.png',

  // ── Jambes ─────────────────────────────────────────────────────────────────
  back_squat:
    'https://wger.de/media/exercise-images/1627/86d0b85a-66b7-4e5f-bf8d-bb4d7eb03f59.webp',
  leg_press:
    'https://wger.de/media/exercise-images/371/d2136f96-3a43-4d4c-9944-1919c4ca1ce1.webp',
  leg_extension:
    'https://wger.de/media/exercise-images/851/4d621b17-f6cb-4107-97c0-9f44e9a2dbc6.webp',
  dumbbell_lunges:
    'https://wger.de/media/exercise-images/113/Walking-lunges-1.png',
  bulgarian_split_squat:
    'https://wger.de/media/exercise-images/988/6283b258-a4d7-4833-84f7-a38987022d3d.png',
  romanian_deadlift: undefined, // pas d'image disponible sur wger.de
  lying_leg_curl:
    'https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png',
  barbell_hip_thrust: undefined, // pas d'image disponible sur wger.de

  // ── Épaules ────────────────────────────────────────────────────────────────
  overhead_press:
    'https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png',
  lateral_raises:
    'https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png',
  face_pull: undefined, // pas d'image disponible sur wger.de

  // ── Biceps ─────────────────────────────────────────────────────────────────
  dumbbell_curl:
    'https://wger.de/media/exercise-images/81/Biceps-curl-1.png',
  ez_bar_curl:
    'https://wger.de/media/exercise-images/94/6dee2f60-aea2-4f2d-9bf6-aef50c4f9483.png',
  hammer_curl:
    'https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png',

  // ── Triceps ────────────────────────────────────────────────────────────────
  triceps_pushdown:
    'https://wger.de/media/exercise-images/659/a60452f1-e2ea-43fe-baa6-c1a2208d060c.png',
  skull_crushers:
    'https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png',

  // ── Abdominaux ─────────────────────────────────────────────────────────────
  crunch:
    'https://wger.de/media/exercise-images/91/Crunches-1.png',
  plank:
    'https://wger.de/media/exercise-images/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png',
  leg_raises:
    'https://wger.de/media/exercise-images/125/Leg-raises-2.png',
}
