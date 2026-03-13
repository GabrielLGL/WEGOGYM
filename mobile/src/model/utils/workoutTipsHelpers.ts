// Tips par groupe musculaire — clés plates pour i18n (workoutTips.xxx)
const MUSCLE_TIPS: Record<string, string[]> = {
  Pecs:       ['pecs_0', 'pecs_1'],
  Dos:        ['dos_0', 'dos_1'],
  Quadriceps: ['quads_0', 'quads_1'],
  Ischios:    ['ischios_0'],
  Epaules:    ['epaules_0', 'epaules_1'],
  Biceps:     ['biceps_0'],
  Triceps:    ['triceps_0'],
  'Trapèzes': ['trapezes_0'],
  Abdos:      ['abdos_0'],
  Mollets:    ['mollets_0'],
  Cardio:     ['cardio_0'],
}

const GENERIC_TIPS = ['generic_0', 'generic_1', 'generic_2']

/**
 * Retourne la clé i18n plate (workoutTips[key]) pour un exercice donné.
 * Sélection déterministe basée sur le hash de l'exerciseId.
 */
export function getTipKeyForExercise(
  exerciseId: string,
  muscles: string[],
): string {
  const candidates: string[] = []
  for (const muscle of muscles) {
    const tips = MUSCLE_TIPS[muscle]
    if (tips) candidates.push(...tips)
  }
  const hash = exerciseId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  if (candidates.length === 0) {
    return GENERIC_TIPS[hash % GENERIC_TIPS.length]
  }
  return candidates[hash % candidates.length]
}
