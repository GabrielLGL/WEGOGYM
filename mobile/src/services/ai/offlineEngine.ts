import type {
  AIProvider, AIFormData, DBContext, GeneratedPlan, GeneratedExercise,
  GeneratedSession, ExerciseInfo, AISplit, AIGoal, AILevel, ExerciseType, ExerciseMetadata,
} from './types'
import { getExerciseMetadata } from './exerciseMetadata'

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
  return Math.round(pr * pct * 2) / 2
}

function exercisesCount(durationMin: number): number {
  if (durationMin <= 45) return 5
  if (durationMin <= 60) return 6
  if (durationMin <= 90) return 8
  return 10
}

// ─── Splits & noms de séances ─────────────────────────────────────────────────

const SPLITS: Record<string, string[][]> = {
  fullbody:   [['Pecs', 'Dos', 'Quadriceps', 'Epaules', 'Abdos']],
  upperlower: [
    ['Pecs', 'Dos', 'Epaules', 'Biceps', 'Triceps'],
    ['Quadriceps', 'Ischios', 'Mollets', 'Abdos'],
  ],
  ppl: [
    ['Pecs', 'Epaules', 'Triceps'],
    ['Dos', 'Biceps', 'Trapèzes'],
    ['Quadriceps', 'Ischios', 'Mollets', 'Abdos'],
  ],
  brosplit: [
    ['Pecs'],
    ['Dos', 'Trapèzes'],
    ['Epaules'],
    ['Quadriceps', 'Ischios', 'Mollets'],
    ['Biceps', 'Triceps'],
  ],
  arnold: [
    ['Pecs', 'Dos'],
    ['Epaules', 'Biceps', 'Triceps'],
    ['Quadriceps', 'Ischios', 'Mollets', 'Abdos'],
  ],
  phul: [
    ['Pecs', 'Dos', 'Epaules'],
    ['Quadriceps', 'Ischios', 'Mollets'],
    ['Pecs', 'Dos', 'Biceps', 'Triceps'],
    ['Quadriceps', 'Ischios', 'Abdos'],
  ],
  fiveday: [
    ['Pecs'],
    ['Dos', 'Trapèzes'],
    ['Epaules'],
    ['Quadriceps', 'Ischios', 'Mollets'],
    ['Biceps', 'Triceps', 'Abdos'],
  ],
  pushpull: [
    ['Pecs', 'Epaules', 'Triceps'],
    ['Dos', 'Biceps', 'Trapèzes'],
  ],
  fullbodyhi: [['Pecs', 'Dos', 'Quadriceps', 'Epaules', 'Ischios', 'Abdos']],
}

function getSplit(days: number): string[][] {
  if (days <= 3) return SPLITS.fullbody
  if (days <= 4) return SPLITS.upperlower
  return SPLITS.ppl
}

const SESSION_NAMES: Record<string, string[]> = {
  fullbody:   ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D', 'Full Body E', 'Full Body F'],
  upperlower: ['Upper Body', 'Lower Body', 'Upper Body B', 'Lower Body B', 'Upper Body C', 'Lower Body C'],
  ppl:        ['Push', 'Pull', 'Legs', 'Push B', 'Pull B', 'Legs B'],
  brosplit:   ['Poitrine', 'Dos', 'Épaules', 'Jambes', 'Bras'],
  arnold:     ['Poitrine & Dos', 'Épaules & Bras', 'Jambes', 'Poitrine & Dos B', 'Épaules & Bras B', 'Jambes B'],
  phul:       ['Force Upper', 'Force Lower', 'Hypertrophie Upper', 'Hypertrophie Lower'],
  fiveday:    ['Poitrine', 'Dos', 'Épaules', 'Jambes', 'Bras'],
  pushpull:   ['Push', 'Pull', 'Push B', 'Pull B', 'Push C', 'Pull C'],
  fullbodyhi: ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D', 'Full Body E', 'Full Body F'],
}

function getSplitName(days: number, split?: AISplit): string {
  if (split && split !== 'auto') return split
  if (days <= 3) return 'fullbody'
  if (days <= 4) return 'upperlower'
  return 'ppl'
}

const SPLIT_LABELS: Record<string, string> = {
  fullbody:   'Full Body',
  upperlower: 'Upper/Lower',
  ppl:        'PPL',
  brosplit:   'Bro Split',
  arnold:     'Arnold Split',
  phul:       'PHUL',
  fiveday:    '5 Jours',
  pushpull:   'Push/Pull',
  fullbodyhi: 'Full Body HI',
}

// ─── Algorithme intelligent ───────────────────────────────────────────────────

const SETS_BY_TYPE_GOAL: Record<ExerciseType, Record<AIGoal, number>> = {
  compound_heavy: { bodybuilding: 4, power: 5, renfo: 4, cardio: 3 },
  compound:       { bodybuilding: 4, power: 4, renfo: 3, cardio: 3 },
  accessory:      { bodybuilding: 3, power: 3, renfo: 3, cardio: 3 },
  isolation:      { bodybuilding: 3, power: 3, renfo: 3, cardio: 2 },
}

const REPS_BY_TYPE_GOAL: Record<ExerciseType, Record<AIGoal, string>> = {
  compound_heavy: { bodybuilding: '6-8',   power: '4-6',   renfo: '8-10',  cardio: '10-12' },
  compound:       { bodybuilding: '8-10',  power: '6-8',   renfo: '10-12', cardio: '12-15' },
  accessory:      { bodybuilding: '10-12', power: '8-10',  renfo: '12-15', cardio: '15-20' },
  isolation:      { bodybuilding: '12-15', power: '10-12', renfo: '15-20', cardio: '20-25' },
}

const TYPE_ORDER: Record<ExerciseType, number> = {
  compound_heavy: 0, compound: 1, accessory: 2, isolation: 3,
}

const LEVEL_ORDER: Record<AILevel, number> = {
  'débutant': 0, 'intermédiaire': 1, 'avancé': 2,
}

type CandidateExercise = ExerciseInfo & { meta: ExerciseMetadata | undefined }

function isLevelEligible(meta: ExerciseMetadata, userLevel: AILevel): boolean {
  return LEVEL_ORDER[meta.minLevel] <= LEVEL_ORDER[userLevel]
}

function toCandidate(ex: ExerciseInfo, userLevel: AILevel): CandidateExercise | null {
  const meta = getExerciseMetadata(ex.name)
  if (meta && !isLevelEligible(meta, userLevel)) return null
  return { ...ex, meta }
}

// Allocation d'exercices par muscle : 1 minimum par muscle, bonus focus, round-robin pour le reste
function allocateExercises(
  muscles: string[],
  total: number,
  focusMuscles: string[],
): Record<string, number> {
  const alloc: Record<string, number> = {}
  let used = 0

  for (const m of muscles) {
    if (used < total) { alloc[m] = 1; used++ }
    else { alloc[m] = 0 }
  }

  for (const m of focusMuscles) {
    if (alloc[m] !== undefined && used < total) {
      alloc[m]++; used++
    }
  }

  let i = 0
  while (used < total) {
    alloc[muscles[i % muscles.length]]++
    used++; i++
  }

  return alloc
}

// Sélection : non-utilisés en premier, puis par type (compound_heavy → isolation), shuffle pour les ex æquo
function selectExercises(
  candidates: CandidateExercise[],
  count: number,
  usedNames: Set<string>,
): CandidateExercise[] {
  const shuffled = shuffleArray([...candidates])
  const sorted = shuffled.sort((a, b) => {
    const aUsed = usedNames.has(a.name) ? 1 : 0
    const bUsed = usedNames.has(b.name) ? 1 : 0
    if (aUsed !== bUsed) return aUsed - bUsed

    const aOrder = a.meta ? TYPE_ORDER[a.meta.type] : 2
    const bOrder = b.meta ? TYPE_ORDER[b.meta.type] : 2
    return aOrder - bOrder
  })
  return sorted.slice(0, count)
}

function buildSession(
  name: string,
  muscles: string[],
  form: AIFormData,
  context: DBContext,
  usedNames: Set<string>,
): GeneratedSession {
  const { goal, level, durationMin, musclesFocus = [] } = form
  const total = exercisesCount(durationMin)
  const alloc = allocateExercises(muscles, total, musclesFocus)

  // Pool complet niveau-filtré (fallback si aucun exercice ne correspond à un muscle)
  const allCandidates: CandidateExercise[] = context.exercises
    .map(ex => toCandidate(ex, level))
    .filter((ex): ex is CandidateExercise => ex !== null)

  const allExercises: GeneratedExercise[] = []

  for (const muscle of muscles) {
    const count = alloc[muscle] ?? 0
    if (count === 0) continue

    // Candidats primaires : exercices dont muscles[] contient ce muscle
    let candidates: CandidateExercise[] = context.exercises
      .map(ex => toCandidate(ex, level))
      .filter((ex): ex is CandidateExercise => ex !== null && ex.muscles.includes(muscle))

    // Fallback : aucun exercice spécifique → utiliser tous les exercices niveau-filtrés
    if (candidates.length === 0) {
      candidates = allCandidates
    }

    const chosen = selectExercises(candidates, count, usedNames)
    const isFocus = musclesFocus.includes(muscle)

    for (const ex of chosen) {
      usedNames.add(ex.name)
      const type: ExerciseType = ex.meta?.type ?? 'compound'
      const baseSets = SETS_BY_TYPE_GOAL[type][goal]
      const sets = isFocus ? Math.min(baseSets + 1, 5) : baseSets
      const reps = REPS_BY_TYPE_GOAL[type][goal]
      const weight = getWeightTarget(ex.name, context.prs, goal, level)

      allExercises.push({
        exerciseName: ex.name,
        setsTarget: sets,
        repsTarget: reps,
        weightTarget: weight,
      })
    }
  }

  // Tri final : compound_heavy → compound → accessory → isolation
  allExercises.sort((a, b) => {
    const aMeta = getExerciseMetadata(a.exerciseName)
    const bMeta = getExerciseMetadata(b.exerciseName)
    const aOrder = aMeta ? TYPE_ORDER[aMeta.type] : 2
    const bOrder = bMeta ? TYPE_ORDER[bMeta.type] : 2
    return aOrder - bOrder
  })

  return { name, exercises: allExercises }
}

// ─── Génération programme ─────────────────────────────────────────────────────

function generateProgram(form: AIFormData, context: DBContext): GeneratedPlan {
  const { daysPerWeek = 3, musclesFocus = [], split } = form
  const splitName = getSplitName(daysPerWeek, split)
  const splitGroups = (split && split !== 'auto') ? SPLITS[splitName] : getSplit(daysPerWeek)
  const sessionNames = SESSION_NAMES[splitName]

  const rawPlans: Array<[string[], string]> = Array.from(
    { length: daysPerWeek },
    (_, i) => [splitGroups[i % splitGroups.length], sessionNames[i] ?? `Séance ${i + 1}`]
  )

  // Sessions contenant les muscles focus passent en premier (stable sort)
  let sessionPlans: Array<[string[], string]>
  if (musclesFocus.length > 0) {
    const focusPlans = rawPlans.filter(([muscles]) => musclesFocus.some(m => muscles.includes(m)))
    const otherPlans = rawPlans.filter(([muscles]) => !musclesFocus.some(m => muscles.includes(m)))
    sessionPlans = [...focusPlans, ...otherPlans]
  } else {
    sessionPlans = rawPlans
  }

  const usedNames = new Set<string>()
  const sessions: GeneratedSession[] = sessionPlans.map(([muscles, sessionName]) =>
    buildSession(sessionName, muscles, form, context, usedNames)
  )

  const goalLabels: Record<AIGoal, string> = {
    bodybuilding: 'Bodybuilding',
    power:        'Power',
    renfo:        'Renfo',
    cardio:       'Cardio',
  }
  const levelLabels: Record<AILevel, string> = {
    'débutant':      'Débutant',
    'intermédiaire': 'Intermédiaire',
    'avancé':        'Avancé',
  }

  return {
    name: `${goalLabels[form.goal]} ${levelLabels[form.level]} – ${SPLIT_LABELS[splitName] ?? splitName} ${daysPerWeek}j/sem`,
    sessions,
  }
}

// ─── Génération séance unique ─────────────────────────────────────────────────

function generateSession(form: AIFormData, context: DBContext): GeneratedPlan {
  const muscles = (form.muscleGroups && form.muscleGroups.length > 0)
    ? form.muscleGroups
    : ['Pecs', 'Dos', 'Quadriceps', 'Epaules', 'Abdos']

  const muscleLabel = (form.muscleGroups && form.muscleGroups.length > 0)
    ? form.muscleGroups.join(' + ')
    : 'Full Body'

  const usedNames = new Set<string>()
  const session = buildSession(muscleLabel, muscles, form, context, usedNames)

  return {
    name: `Séance ${muscleLabel}`,
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
