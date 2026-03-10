/**
 * exerciseMetadata.ts — Base de données des métadonnées d'exercices
 *
 * Chaque exercice est décrit par :
 * - `type`           : classification mécanique (compound_heavy | compound | accessory | isolation)
 *                      → détermine l'ordre dans la séance et les paramètres de séries/reps
 * - `minLevel`       : niveau minimum requis ('débutant' | 'intermédiaire' | 'avancé')
 * - `isUnilateral`   : true si l'exercice travaille un côté à la fois
 * - `primaryMuscle`  : muscle principal ciblé (utilisé pour le tri et l'allocation)
 * - `secondaryMuscles`: muscles secondaires recrutés
 * - `sfr`            : Stimulus-to-Fatigue Ratio ('low' | 'medium' | 'high')
 *                      → high = bon rapport stimulus/fatigue, low = très fatiguant
 * - `stretchFocus`   : true si l'exercice travaille le muscle en position étirée
 *                      → l'algorithme garantit min 30% de stretchFocus par séance
 * - `injuryRisk`     : zones à risque — l'algo exclut l'exercice si l'utilisateur a une blessure dans cette zone
 * - `progressionType`: stratégie de progression ('linear' | 'wave' | 'auto')
 *
 * Utilisé par offlineEngine.ts pour la sélection et le paramétrage des exercices.
 */

import type { ExerciseMetadataMap, ExerciseMetadata } from './types'

export const EXERCISE_METADATA: ExerciseMetadataMap = {

  // ─── PECS ─────────────────────────────────────────────────────────────────
  'Développé Couché Barre': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'poignets'], progressionType: 'linear',
  },
  'Développé Couché Haltères': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Développé Incliné Barre': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'poignets'], progressionType: 'wave',
  },
  'Développé Incliné Haltères': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Écartés Poulie': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Pec Deck (Machine)': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Dips (Bas des pecs)': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules', 'poignets'], progressionType: 'wave',
  },
  'Pompes': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps', 'Epaules'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules', 'poignets'], progressionType: 'auto',
  },
  'Écartés Haltères': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Développé Décliné Barre': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'poignets'], progressionType: 'linear',
  },
  'Développé Décliné Haltères': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Cable Flyes Bas': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Cable Flyes Haut': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Développé Couché Machine': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Pompes Déclinées': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules', 'poignets'], progressionType: 'auto',
  },

  // ─── DOS ──────────────────────────────────────────────────────────────────
  'Tractions': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'linear',
  },
  'Rowing Barre': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Trapèzes', 'Biceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'linear',
  },
  'Tirage Poitrine': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Rowing Haltère Unilatéral': {
    type: 'compound', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'wave',
  },
  'Pull Over Poulie': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Tirage Horizontal': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Trapèzes'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Extensions Lombaires': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Soulevé de Terre': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Quadriceps', 'Ischios'],
    sfr: 'low', stretchFocus: false, injuryRisk: ['bas_dos', 'nuque'], progressionType: 'linear',
  },
  'Tirage Nuque': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules', 'nuque'], progressionType: 'wave',
  },
  'Rowing Machine': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'wave',
  },
  'Rowing Poulie Basse': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'wave',
  },
  'Hyperextensions': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Good Morning': {
    type: 'compound', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Ischios'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['bas_dos', 'nuque'], progressionType: 'wave',
  },
  'T-Bar Row': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps', 'Trapèzes'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'linear',
  },
  'Tirage Poitrine Prise Serrée': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'wave',
  },

  // ─── QUADRICEPS ───────────────────────────────────────────────────────────
  'Squat Arrière': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
    sfr: 'low', stretchFocus: false, injuryRisk: ['genoux', 'bas_dos'], progressionType: 'linear',
  },
  'Presse à Cuisses': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Leg Extension': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'auto',
  },
  'Hack Squat': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Fentes Haltères': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Squat Bulgare': {
    type: 'compound', minLevel: 'avancé', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux', 'bas_dos'], progressionType: 'wave',
  },
  'Squat Gobelet': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Squat Avant': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'low', stretchFocus: false, injuryRisk: ['genoux', 'bas_dos', 'poignets'], progressionType: 'linear',
  },
  'Sissy Squat': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'auto',
  },
  'Step Up': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Fentes Marchées': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Fentes Arrières': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'wave',
  },
  'Split Squat': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'wave',
  },

  // ─── ISCHIOS ──────────────────────────────────────────────────────────────
  'Soulevé de Terre Roumain': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: ['Dos'],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['bas_dos'], progressionType: 'linear',
  },
  'Leg Curl Allongé': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Leg Curl Assis': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Soulevé de Terre Jambes Tendues': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['bas_dos'], progressionType: 'wave',
  },
  'Hip Thrust Barre': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['bas_dos'], progressionType: 'wave',
  },
  'Curl Nordique': {
    type: 'isolation', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Leg Curl Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['none'], progressionType: 'auto',
  },

  // ─── MOLLETS ──────────────────────────────────────────────────────────────
  'Extensions Mollets Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Extensions Mollets Assis': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Mollets à la Presse': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['genoux'], progressionType: 'auto',
  },
  'Mollets Haltères Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Élévation sur Pointes Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['none'], progressionType: 'auto',
  },

  // ─── ÉPAULES ──────────────────────────────────────────────────────────────
  'Développé Militaire': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'nuque'], progressionType: 'linear',
  },
  'Élévations Latérales': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Oiseau (Buste penché)': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Dos'],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Développé Haltères Assis': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Face Pull': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Trapèzes'],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Développé Arnold': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'wave',
  },
  'Élévations Frontales': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Oiseau Poulie': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Dos'],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Développé Machine Épaules': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Élévations Latérales Poulie': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  'Rotation Externe Épaule': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },

  // ─── TRAPÈZES ─────────────────────────────────────────────────────────────
  'Shrugs Barre': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Shrugs Haltères': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Tirage Menton': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: ['Epaules'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'nuque'], progressionType: 'wave',
  },
  'Shrugs Machine': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Rowing Menton Haltères': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: ['Epaules'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'nuque'], progressionType: 'wave',
  },

  // ─── BICEPS ───────────────────────────────────────────────────────────────
  'Curl Haltères': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Barre EZ': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Marteau': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Pupitre': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Câble': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Concentré': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Barre Droite': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl Incliné Haltères': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['poignets'], progressionType: 'wave',
  },
  'Curl Spider': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Curl 21s': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['poignets'], progressionType: 'auto',
  },

  // ─── TRICEPS ──────────────────────────────────────────────────────────────
  'Extensions Poulie Haute': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Barre au front': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['poignets', 'nuque'], progressionType: 'auto',
  },
  'Extensions Nuque Haltère': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules', 'nuque'], progressionType: 'auto',
  },
  'Dips (Triceps focus)': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules', 'poignets'], progressionType: 'wave',
  },
  'Triceps Kickback': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Développé Couché Prise Serrée': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: ['Pecs'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules', 'poignets'], progressionType: 'linear',
  },
  'Triceps Machine': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Diamond Push-ups': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: ['Pecs'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Extensions Poulie Basse': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'auto',
  },

  // ─── ABDOS ────────────────────────────────────────────────────────────────
  'Crunch': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Relevé de jambes': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Planche': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets', 'bas_dos'], progressionType: 'auto',
  },
  'Roulette à abdos': {
    type: 'accessory', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: true, injuryRisk: ['bas_dos', 'poignets'], progressionType: 'auto',
  },
  'Russian Twist': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Gainage Latéral': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Leg Raises Suspendu': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Crunch Machine': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Crunch Câble': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Crunch Obliques': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['nuque'], progressionType: 'auto',
  },
  'Mountain Climbers': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: ['Cardio'],
    sfr: 'high', stretchFocus: false, injuryRisk: ['poignets'], progressionType: 'auto',
  },
  'Toes to Bar': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Dead Bug': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
    sfr: 'high', stretchFocus: false, injuryRisk: ['none'], progressionType: 'auto',
  },

  // ─── CARDIO ───────────────────────────────────────────────────────────────
  'Tapis de Course': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'auto',
  },
  'Vélo Elliptique': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Rameur': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'auto',
  },
  'Corde à sauter': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux', 'poignets'], progressionType: 'auto',
  },
  'Vélo Stationnaire': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Stepping': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Quadriceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'auto',
  },
  'Sprint': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Quadriceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux', 'bas_dos'], progressionType: 'auto',
  },
  'HIIT': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'auto',
  },
  'Battle Ropes': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Epaules'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['epaules'], progressionType: 'auto',
  },
  "Vélo d'Appartement": {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['none'], progressionType: 'auto',
  },
  'Burpees': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux', 'poignets'], progressionType: 'auto',
  },
  'Box Jump': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Quadriceps'],
    sfr: 'medium', stretchFocus: false, injuryRisk: ['genoux'], progressionType: 'auto',
  },
}

/** Récupère les métadonnées d'un exercice par son nom exact (sensible à la casse) */
export function getExerciseMetadata(name: string): ExerciseMetadata | undefined {
  return EXERCISE_METADATA[name]
}
