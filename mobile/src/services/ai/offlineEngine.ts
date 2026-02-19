import type { AIProvider, AIFormData, DBContext, GeneratedPlan, GeneratedExercise, GeneratedSession, ExerciseInfo, AISplit } from './types'

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getWeightTarget(exerciseName: string, prs: Record<string, number>, goal: string, level: string): number {
  const pr = prs[exerciseName] ?? prs[exerciseName.toLowerCase()]
  if (!pr || pr === 0) return 0
  const percentages: Record<string, Record<string, number>> = {
    power:        { 'débutant': 0.75, 'intermédiaire': 0.82, 'avancé': 0.88 },
    bodybuilding: { 'débutant': 0.65, 'intermédiaire': 0.72, 'avancé': 0.78 },
    renfo:        { 'débutant': 0.60, 'intermédiaire': 0.65, 'avancé': 0.70 },
    cardio:       { 'débutant': 0.50, 'intermédiaire': 0.55, 'avancé': 0.60 },
  }
  const pct = percentages[goal]?.[level] ?? 0.70
  return Math.round(pr * pct * 2) / 2 // arrondi au 0.5kg
}

// Muscles composés (exercices poly-articulaires)
const COMPOUND_MUSCLES = ['Quadriceps', 'Dos', 'Pecs', 'Ischios', 'Epaules']

// Séries × reps par objectif
const SETS_REPS: Record<string, { sets: number; reps: string }> = {
  bodybuilding: { sets: 4, reps: '8'  },
  power:        { sets: 5, reps: '5'  },
  renfo:        { sets: 3, reps: '12' },
  cardio:       { sets: 3, reps: '15' },
}

// Nombre d'exercices par séance selon la durée
function exercisesCount(durationMin: number): number {
  if (durationMin <= 30) return 4
  if (durationMin <= 45) return 5
  if (durationMin <= 60) return 6
  return 8
}

// Groupes musculaires par split
const SPLITS: Record<string, string[][]> = {
  fullbody: [['Pecs', 'Dos', 'Quadriceps', 'Epaules', 'Abdos']],
  upperlower: [
    ['Pecs', 'Dos', 'Epaules', 'Biceps', 'Triceps'],
    ['Quadriceps', 'Ischios', 'Mollets', 'Abdos'],
  ],
  ppl: [
    ['Pecs', 'Epaules', 'Triceps'],
    ['Dos', 'Biceps', 'Trapèzes'],
    ['Quadriceps', 'Ischios', 'Mollets', 'Abdos'],
  ],
}

function getSplit(days: number): string[][] {
  if (days <= 3) return SPLITS.fullbody
  if (days <= 4) return SPLITS.upperlower
  return SPLITS.ppl
}

// Noms de séances selon le split
const SESSION_NAMES: Record<string, string[]> = {
  fullbody:   ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D', 'Full Body E', 'Full Body F'],
  upperlower: ['Upper Body', 'Lower Body', 'Upper Body B', 'Lower Body B', 'Upper Body C', 'Lower Body C'],
  ppl:        ['Push', 'Pull', 'Legs', 'Push B', 'Pull B', 'Legs B'],
}

function getSplitName(days: number, split?: AISplit): string {
  if (split && split !== 'auto') return split
  if (days <= 3) return 'fullbody'
  if (days <= 4) return 'upperlower'
  return 'ppl'
}

// Construit une séance avec N exercices depuis la liste disponible
function buildSession(
  name: string,
  availableExercises: ExerciseInfo[],
  count: number,
  goal: string,
  level: string,
  usedExercises: Set<string>,
  prs: Record<string, number>,
  musclesFocus?: string[]
): GeneratedSession {
  const { sets, reps } = SETS_REPS[goal] ?? SETS_REPS.bodybuilding
  const pool = availableExercises.filter(e => !usedExercises.has(e.name))
  const source = pool.length >= count ? pool : availableExercises
  // Compound-first ou biais musclesFocus
  let sorted: ExerciseInfo[]
  if (musclesFocus && musclesFocus.length > 0) {
    const focusPool       = shuffleArray(source.filter(e => e.muscles.some(m => musclesFocus.includes(m))))
    const otherCompounds  = shuffleArray(source.filter(e =>
      !e.muscles.some(m => musclesFocus.includes(m)) &&
      e.muscles.some(m => COMPOUND_MUSCLES.includes(m))
    ))
    const otherIsolations = shuffleArray(source.filter(e =>
      !e.muscles.some(m => musclesFocus.includes(m)) &&
      !e.muscles.some(m => COMPOUND_MUSCLES.includes(m))
    ))
    sorted = [...focusPool, ...otherCompounds, ...otherIsolations]
  } else {
    const compounds  = shuffleArray(source.filter(e => e.muscles.some(m => COMPOUND_MUSCLES.includes(m))))
    const isolations = shuffleArray(source.filter(e => !e.muscles.some(m => COMPOUND_MUSCLES.includes(m))))
    sorted = [...compounds, ...isolations]
  }
  const picked: GeneratedExercise[] = []
  for (let i = 0; i < count && i < sorted.length; i++) {
    const ex = sorted[i]
    usedExercises.add(ex.name)
    const weight = getWeightTarget(ex.name, prs, goal, level)
    picked.push({ exerciseName: ex.name, setsTarget: sets, repsTarget: reps, weightTarget: weight })
  }

  return { name, exercises: picked }
}

// Génération programme
function generateProgram(form: AIFormData, context: DBContext): GeneratedPlan {
  const days = form.daysPerWeek ?? 3
  const splitName = getSplitName(days, form.split)
  const splitGroups = getSplit(days)
  const sessionNames = SESSION_NAMES[splitName]
  const count = exercisesCount(form.durationMin)
  const usedExercises = new Set<string>()

  const sessions: GeneratedSession[] = []
  for (let i = 0; i < days; i++) {
    const groupIndex = i % splitGroups.length
    const sessionName = sessionNames[i] ?? `Séance ${i + 1}`
    // Filtrer les exercices par muscles du split courant
    const muscles = splitGroups[groupIndex]
    const pool = context.exercises.length > 0
      ? context.exercises.filter(ex => ex.muscles.some(m => muscles.includes(m)))
      : muscles.map(m => ({ name: m, muscles: [m] }))
    const fallbackPool = context.exercises.length > 0 ? context.exercises : muscles.map(m => ({ name: m, muscles: [m] }))
    const finalPool = pool.length >= 2 ? pool : fallbackPool
    sessions.push(buildSession(sessionName, finalPool, count, form.goal, form.level, usedExercises, context.prs, form.musclesFocus))
  }

  const goalLabels: Record<string, string> = {
    bodybuilding: 'Bodybuilding',
    power:        'Power',
    renfo:        'Renfo',
    cardio:       'Cardio',
  }
  const levelLabels: Record<string, string> = {
    'débutant':      'Débutant',
    'intermédiaire': 'Intermédiaire',
    'avancé':        'Avancé',
  }

  return {
    name: `${goalLabels[form.goal] ?? form.goal} ${levelLabels[form.level] ?? form.level} ${days}J`,
    sessions,
  }
}

// Génération séance unique
function generateSession(form: AIFormData, context: DBContext): GeneratedPlan {
  const count = exercisesCount(form.durationMin)
  const usedExercises = new Set<string>()
  const muscle = form.muscleGroup ?? 'Full Body'
  const pool = context.exercises.length > 0 ? context.exercises : [{ name: muscle, muscles: [muscle] }]
  const session = buildSession(`${muscle}`, pool, count, form.goal, form.level, usedExercises, context.prs)

  return {
    name: `Séance ${muscle}`,
    sessions: [session],
  }
}

export const offlineEngine: AIProvider = {
  async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
    if (form.mode === 'program') {
      return generateProgram(form, context)
    }
    return generateSession(form, context)
  },
}
