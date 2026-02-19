import type { ExerciseMetadataMap, ExerciseMetadata } from './types'

export const EXERCISE_METADATA: ExerciseMetadataMap = {

  // ─── PECS ─────────────────────────────────────────────────────────────────
  'Développé Couché Barre': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
  },
  'Développé Couché Haltères': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
  },
  'Développé Incliné Barre': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
  },
  'Développé Incliné Haltères': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
  },
  'Écartés Poulie': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
  },
  'Pec Deck (Machine)': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
  },
  'Dips (Bas des pecs)': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
  },
  'Pompes': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps', 'Epaules'],
  },
  'Écartés Haltères': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
  },
  'Développé Décliné Barre': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
  },
  'Développé Décliné Haltères': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
  },
  'Cable Flyes Bas': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
  },
  'Cable Flyes Haut': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: [],
  },
  'Développé Couché Machine': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
  },
  'Pompes Déclinées': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Pecs', secondaryMuscles: ['Triceps'],
  },

  // ─── DOS ──────────────────────────────────────────────────────────────────
  'Tractions': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },
  'Rowing Barre': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Trapèzes', 'Biceps'],
  },
  'Tirage Poitrine': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },
  'Rowing Haltère Unilatéral': {
    type: 'compound', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },
  'Pull Over Poulie': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: [],
  },
  'Tirage Horizontal': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Trapèzes'],
  },
  'Extensions Lombaires': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: [],
  },
  'Soulevé de Terre': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Quadriceps', 'Ischios'],
  },
  'Tirage Nuque': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },
  'Rowing Machine': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },
  'Rowing Poulie Basse': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },
  'Hyperextensions': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: [],
  },
  'Good Morning': {
    type: 'compound', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Ischios'],
  },
  'T-Bar Row': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps', 'Trapèzes'],
  },
  'Tirage Poitrine Prise Serrée': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Dos', secondaryMuscles: ['Biceps'],
  },

  // ─── QUADRICEPS ───────────────────────────────────────────────────────────
  'Squat Arrière': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
  },
  'Presse à Cuisses': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
  },
  'Leg Extension': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Hack Squat': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Fentes Haltères': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
  },
  'Squat Bulgare': {
    type: 'compound', minLevel: 'avancé', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Squat Gobelet': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Squat Avant': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Sissy Squat': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Step Up': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Fentes Marchées': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Fentes Arrières': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },
  'Split Squat': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: true,
    primaryMuscle: 'Quadriceps', secondaryMuscles: [],
  },

  // ─── ISCHIOS ──────────────────────────────────────────────────────────────
  'Soulevé de Terre Roumain': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: ['Dos'],
  },
  'Leg Curl Allongé': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
  },
  'Leg Curl Assis': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
  },
  'Soulevé de Terre Jambes Tendues': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
  },
  'Hip Thrust Barre': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
  },
  'Curl Nordique': {
    type: 'isolation', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
  },
  'Leg Curl Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Ischios', secondaryMuscles: [],
  },

  // ─── MOLLETS ──────────────────────────────────────────────────────────────
  'Extensions Mollets Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
  },
  'Extensions Mollets Assis': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
  },
  'Mollets à la Presse': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
  },
  'Mollets Haltères Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
  },
  'Élévation sur Pointes Debout': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Mollets', secondaryMuscles: [],
  },

  // ─── ÉPAULES ──────────────────────────────────────────────────────────────
  'Développé Militaire': {
    type: 'compound_heavy', minLevel: 'avancé', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
  },
  'Élévations Latérales': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
  },
  'Oiseau (Buste penché)': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Dos'],
  },
  'Développé Haltères Assis': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
  },
  'Face Pull': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Trapèzes'],
  },
  'Développé Arnold': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
  },
  'Élévations Frontales': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
  },
  'Oiseau Poulie': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Dos'],
  },
  'Développé Machine Épaules': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: ['Triceps'],
  },
  'Élévations Latérales Poulie': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
  },
  'Rotation Externe Épaule': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Epaules', secondaryMuscles: [],
  },

  // ─── TRAPÈZES ─────────────────────────────────────────────────────────────
  'Shrugs Barre': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: [],
  },
  'Shrugs Haltères': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: [],
  },
  'Tirage Menton': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: ['Epaules'],
  },
  'Shrugs Machine': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: [],
  },
  'Rowing Menton Haltères': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Trapèzes', secondaryMuscles: ['Epaules'],
  },

  // ─── BICEPS ───────────────────────────────────────────────────────────────
  'Curl Haltères': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Barre EZ': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Marteau': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Pupitre': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Câble': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Concentré': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Barre Droite': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Incliné Haltères': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl Spider': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },
  'Curl 21s': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Biceps', secondaryMuscles: [],
  },

  // ─── TRICEPS ──────────────────────────────────────────────────────────────
  'Extensions Poulie Haute': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },
  'Barre au front': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },
  'Extensions Nuque Haltère': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },
  'Dips (Triceps focus)': {
    type: 'compound', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },
  'Triceps Kickback': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: true,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },
  'Développé Couché Prise Serrée': {
    type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: ['Pecs'],
  },
  'Triceps Machine': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },
  'Diamond Push-ups': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: ['Pecs'],
  },
  'Extensions Poulie Basse': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Triceps', secondaryMuscles: [],
  },

  // ─── ABDOS ────────────────────────────────────────────────────────────────
  'Crunch': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Relevé de jambes': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Planche': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Roulette à abdos': {
    type: 'accessory', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Russian Twist': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Gainage Latéral': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Leg Raises Suspendu': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Crunch Machine': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Crunch Câble': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Crunch Obliques': {
    type: 'isolation', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Mountain Climbers': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: ['Cardio'],
  },
  'Toes to Bar': {
    type: 'isolation', minLevel: 'intermédiaire', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },
  'Dead Bug': {
    type: 'accessory', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Abdos', secondaryMuscles: [],
  },

  // ─── CARDIO ───────────────────────────────────────────────────────────────
  'Tapis de Course': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Vélo Elliptique': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Rameur': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Corde à sauter': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Vélo Stationnaire': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Stepping': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Quadriceps'],
  },
  'Sprint': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Quadriceps'],
  },
  'HIIT': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Battle Ropes': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Epaules'],
  },
  "Vélo d'Appartement": {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Burpees': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: [],
  },
  'Box Jump': {
    type: 'compound', minLevel: 'débutant', isUnilateral: false,
    primaryMuscle: 'Cardio', secondaryMuscles: ['Quadriceps'],
  },
}

export function getExerciseMetadata(name: string): ExerciseMetadata | undefined {
  return EXERCISE_METADATA[name]
}
