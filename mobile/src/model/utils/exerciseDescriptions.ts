import { Database, Q } from '@nozbe/watermelondb'
import Exercise from '../models/Exercise'

interface ExerciseDescriptionData {
  animationKey: string
  description: string
}

/**
 * Mapping nom d'exercice → données (animation_key + description).
 * Les noms DOIVENT correspondre exactement aux noms dans BASIC_EXERCISES (seed.ts).
 * Descriptions en français, 2-4 phrases, cues d'exécution actionables.
 */
export const EXERCISE_DESCRIPTIONS: Record<string, ExerciseDescriptionData> = {
  // --- Pecs ---
  'Développé Couché Barre': {
    animationKey: 'bench_press_barbell',
    description: 'Allongé sur le banc, pieds au sol. Descends la barre vers le milieu de la poitrine en contrôlant. Pousse vers le haut en expirant. Garde les épaules collées au banc.',
  },
  'Développé Couché Haltères': {
    animationKey: 'bench_press_dumbbell',
    description: 'Allongé sur le banc, un haltère dans chaque main. Descends les haltères de chaque côté de la poitrine. Pousse vers le haut en rapprochant les haltères. Contrôle la descente.',
  },
  'Développé Incliné Barre': {
    animationKey: 'incline_bench_press',
    description: 'Banc incliné à 30-45°. Descends la barre vers le haut de la poitrine. Pousse vers le haut en expirant. Cible le haut des pectoraux.',
  },
  'Pompes': {
    animationKey: 'push_ups',
    description: 'Mains au sol, légèrement plus larges que les épaules. Corps gainé en ligne droite. Descends jusqu\'à ce que la poitrine frôle le sol. Pousse en expirant.',
  },
  'Écartés Poulie': {
    animationKey: 'cable_flyes',
    description: 'Debout entre deux poulies hautes. Bras légèrement fléchis. Ramène les mains devant la poitrine en serrant les pectoraux. Contrôle le retour.',
  },
  'Dips (Bas des pecs)': {
    animationKey: 'dips_chest',
    description: 'Sur les barres parallèles, penche le buste légèrement en avant. Descends jusqu\'à ce que les épaules soient au niveau des coudes. Pousse en expirant.',
  },

  // --- Dos ---
  'Tractions': {
    animationKey: 'pull_ups',
    description: 'Mains en pronation, écartées plus large que les épaules. Tire le menton au-dessus de la barre en serrant les omoplates. Descends en contrôlant.',
  },
  'Rowing Barre': {
    animationKey: 'barbell_row',
    description: 'Buste penché à 45°, dos plat. Tire la barre vers le nombril en serrant les omoplates. Descends en contrôlant. Ne cambres pas le dos.',
  },
  'Tirage Poitrine': {
    animationKey: 'lat_pulldown',
    description: 'Assis face à la poulie haute. Tire la barre vers le haut de la poitrine en sortant les pectoraux. Serre les omoplates en bas du mouvement.',
  },
  'Soulevé de Terre': {
    animationKey: 'deadlift',
    description: 'Pieds écartés largeur des hanches, barre au-dessus des pieds. Dos plat, pousse le sol avec les jambes. Verrouille les hanches en haut. Ne tire jamais avec le dos arrondi.',
  },
  'Tirage Horizontal': {
    animationKey: 'seated_cable_row',
    description: 'Assis face à la poulie basse, pieds calés. Tire la poignée vers le nombril en serrant les omoplates. Garde le dos droit, ne bascule pas en arrière.',
  },

  // --- Jambes ---
  'Squat Arrière': {
    animationKey: 'back_squat',
    description: 'Barre sur les trapèzes, pieds écartés largeur des épaules. Descends en poussant les fesses en arrière. Genoux dans l\'axe des pieds. Remonte en poussant le sol.',
  },
  'Presse à Cuisses': {
    animationKey: 'leg_press',
    description: 'Pieds sur la plateforme, écartés largeur des épaules. Fléchis les genoux à 90°. Pousse la plateforme sans verrouiller les genoux en haut. Garde le bas du dos collé.',
  },
  'Leg Extension': {
    animationKey: 'leg_extension',
    description: 'Assis sur la machine, chevilles sous le boudin. Tends les jambes en contractant les quadriceps. Redescends en contrôlant. Ne verrouille pas en haut.',
  },
  'Fentes Haltères': {
    animationKey: 'dumbbell_lunges',
    description: 'Debout, un haltère dans chaque main. Fais un grand pas en avant, genou arrière vers le sol. Le genou avant ne dépasse pas les orteils. Pousse pour revenir.',
  },
  'Squat Bulgare': {
    animationKey: 'bulgarian_split_squat',
    description: 'Un pied sur un banc derrière toi. Descends le genou arrière vers le sol. Garde le buste droit. Pousse avec la jambe avant pour remonter.',
  },
  'Soulevé de Terre Roumain': {
    animationKey: 'romanian_deadlift',
    description: 'Debout, barre à bout de bras. Pousse les fesses en arrière, dos plat. Descends la barre le long des cuisses jusqu\'à sentir l\'étirement des ischio-jambiers. Remonte en serrant les fessiers.',
  },
  'Leg Curl Allongé': {
    animationKey: 'lying_leg_curl',
    description: 'Allongé face vers le bas, chevilles sous le boudin. Fléchis les genoux en amenant les talons vers les fessiers. Redescends en contrôlant.',
  },
  'Hip Thrust Barre': {
    animationKey: 'barbell_hip_thrust',
    description: 'Dos appuyé contre un banc, barre sur les hanches. Pousse les hanches vers le plafond en serrant les fessiers. Descends en contrôlant. Menton vers la poitrine en haut.',
  },

  // --- Épaules ---
  'Développé Militaire': {
    animationKey: 'overhead_press',
    description: 'Debout, barre sur les clavicules. Pousse la barre au-dessus de la tête. Verrouille les bras en haut. Garde les abdos gainés pour protéger le dos.',
  },
  'Élévations Latérales': {
    animationKey: 'lateral_raises',
    description: 'Debout, haltères le long du corps. Monte les bras sur les côtés jusqu\'à l\'horizontale. Coudes légèrement fléchis. Descends en contrôlant, pas d\'élan.',
  },
  'Face Pull': {
    animationKey: 'face_pull',
    description: 'Face à la poulie haute avec corde. Tire vers le visage en écartant les mains. Serre les omoplates en fin de mouvement. Excellent pour la posture.',
  },

  // --- Bras ---
  'Curl Haltères': {
    animationKey: 'dumbbell_curl',
    description: 'Debout, haltères le long du corps, paumes vers l\'avant. Monte les haltères en fléchissant les coudes. Garde les coudes collés au corps. Descends en contrôlant.',
  },
  'Curl Barre EZ': {
    animationKey: 'ez_bar_curl',
    description: 'Debout, barre EZ en prise supination. Monte la barre en fléchissant les coudes. Garde les coudes fixes le long du corps. Ne balance pas le buste.',
  },
  'Extensions Poulie Haute': {
    animationKey: 'triceps_pushdown',
    description: 'Face à la poulie haute, coudes collés au corps. Pousse la barre vers le bas en tendant les bras. Serre les triceps en bas. Remonte en contrôlant.',
  },
  'Barre au front': {
    animationKey: 'skull_crushers',
    description: 'Allongé sur un banc, barre bras tendus au-dessus. Fléchis les coudes pour descendre la barre vers le front. Remonte en contractant les triceps. Coudes fixes.',
  },
  'Curl Marteau': {
    animationKey: 'hammer_curl',
    description: 'Debout, haltères le long du corps, paumes face à face. Monte les haltères sans tourner les poignets. Cible le brachial et le brachio-radial.',
  },

  // --- Abdos ---
  'Crunch': {
    animationKey: 'crunch',
    description: 'Allongé, genoux fléchis, mains derrière la tête. Enroule le buste en décollant les épaules. Expire en montant. Ne tire pas sur la nuque.',
  },
  'Planche': {
    animationKey: 'plank',
    description: 'Sur les avant-bras et les pointes de pieds. Corps en ligne droite de la tête aux talons. Serre les abdos et les fessiers. Respire normalement, tiens la position.',
  },
  'Relevé de jambes': {
    animationKey: 'leg_raises',
    description: 'Allongé, mains sous les fessiers. Monte les jambes tendues à la verticale. Redescends en contrôlant sans toucher le sol. Garde le bas du dos plaqué.',
  },
}

/**
 * Met à jour les exercices existants en base avec les descriptions et animation_keys.
 * Idempotent : ne ré-écrit pas si les données sont déjà présentes.
 * @returns Le nombre d'exercices mis à jour
 */
export async function seedExerciseDescriptions(db: Database): Promise<number> {
  const exercisesCollection = db.get<Exercise>('exercises')
  const allExercises = await exercisesCollection.query().fetch()

  const toUpdate: Exercise[] = []

  for (const exercise of allExercises) {
    const data = EXERCISE_DESCRIPTIONS[exercise.name]
    if (!data) continue
    // Idempotent : ne met à jour que si les champs sont vides
    if (exercise.animationKey && exercise.description) continue
    toUpdate.push(exercise)
  }

  if (toUpdate.length === 0) return 0

  await db.write(async () => {
    const batch = toUpdate.map(exercise => {
      const data = EXERCISE_DESCRIPTIONS[exercise.name]
      return exercise.prepareUpdate(e => {
        if (!e.animationKey) e.animationKey = data.animationKey
        if (!e.description) e.description = data.description
      })
    })
    await db.batch(...batch)
  })

  return toUpdate.length
}
