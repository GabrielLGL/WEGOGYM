/**
 * offlineEngine.ts — Moteur de génération de programmes d'entraînement hors ligne
 *
 * Génère des programmes et séances sans appel réseau, en utilisant :
 * - Les métadonnées d'exercices (type, niveau, SFR, blessures)
 * - Le profil utilisateur (objectif, niveau, durée, récupération, blessures)
 * - Les PRs existants pour calculer les charges cibles
 *
 * Pipeline de génération :
 * 1. Choix du split (fullbody, PPL, upper/lower…) selon le nombre de jours
 * 2. Allocation du nombre d'exercices par muscle pour chaque séance
 * 3. Sélection intelligente des exercices (évite les doublons, priorise la variété)
 * 4. Calcul des séries/reps/charges/repos selon l'objectif et la phase
 * 5. Équilibrage stretchFocus (min 30% d'exercices en étirement)
 * 6. Tri final : compound_heavy → compound → accessory → isolation
 */

import type {
  AIProvider, AIFormData, DBContext, GeneratedPlan, GeneratedExercise,
  GeneratedSession, ExerciseInfo, AISplit, AIGoal, AILevel, ExerciseType, ExerciseMetadata,
} from './types'
import { getExerciseMetadata, EXERCISE_METADATA } from './exerciseMetadata'

/** Mélange aléatoire d'un tableau (Fisher-Yates) */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Calcule la charge cible pour un exercice à partir du PR de l'utilisateur.
 * Applique un pourcentage selon l'objectif (power > bodybuilding > renfo > cardio)
 * et le niveau (avancé utilise un % plus élevé du PR).
 * Arrondi au 0.5 kg près.
 * @returns 0 si aucun PR trouvé (= poids du corps)
 */
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

/** Nombre d'exercices par séance en fonction de la durée (45min → 5, 60min → 6, 90min → 8, 120min+ → 10) */
function exercisesCount(durationMin: number): number {
  if (durationMin <= 45) return 5
  if (durationMin <= 60) return 6
  if (durationMin <= 90) return 8
  return 10
}

// ─── Splits & noms de séances ─────────────────────────────────────────────────
// Chaque split définit les groupes musculaires travaillés par séance.
// Ex: PPL = [Push(Pecs,Épaules,Triceps), Pull(Dos,Biceps,Trapèzes), Legs(Quads,Ischios,Mollets,Abdos)]

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

/** Sélection automatique du split selon le nombre de jours (≤3 → fullbody, 4 → upper/lower, 5+ → PPL) */
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
// Tables de référence pour calculer séries et reps selon le type d'exercice et l'objectif.
// Les valeurs sont des bases ajustées ensuite par le volume multiplier, la phase, et le focus.

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

const SETS_MIN: Record<ExerciseType, number> = {
  compound_heavy: 3, compound: 2, accessory: 2, isolation: 2,
}

const SETS_MAX: Record<ExerciseType, number> = {
  compound_heavy: 6, compound: 5, accessory: 5, isolation: 4,
}

const TYPE_ORDER: Record<ExerciseType, number> = {
  compound_heavy: 0, compound: 1, accessory: 2, isolation: 3,
}

const LEVEL_ORDER: Record<AILevel, number> = {
  'débutant': 0, 'intermédiaire': 1, 'avancé': 2,
}

const SFR_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2 }

type CandidateExercise = ExerciseInfo & { meta: ExerciseMetadata | undefined }

function isLevelEligible(meta: ExerciseMetadata, userLevel: AILevel): boolean {
  return LEVEL_ORDER[meta.minLevel] <= LEVEL_ORDER[userLevel]
}

function toCandidate(ex: ExerciseInfo, userLevel: AILevel): CandidateExercise | null {
  const meta = getExerciseMetadata(ex.name)
  if (meta && !isLevelEligible(meta, userLevel)) return null
  return { ...ex, meta }
}

// ─── Volume & Phase helpers ────────────────────────────────────────────────────

/**
 * Multiplicateur de volume global basé sur le profil utilisateur.
 * Ajuste le nombre de séries selon la récupération et l'âge.
 * Borné entre 0.6 et 1.4 pour éviter les extrêmes.
 */
function getVolumeMultiplier(form: AIFormData): number {
  let multiplier = 1.0
  if (form.recovery === 'rapide') multiplier += 0.15
  if (form.recovery === 'lente') multiplier -= 0.15
  if (form.ageGroup === '36-45') multiplier -= 0.10
  if (form.ageGroup === '45+') multiplier -= 0.20
  if (form.ageGroup === '18-25') multiplier += 0.05
  return Math.max(0.6, Math.min(1.4, multiplier))
}

/**
 * Ajuste les plages de reps selon la phase nutritionnelle.
 * Sèche → reps plus hautes (+2 à +4) pour maximiser les calories brûlées.
 * Prise de masse → légère augmentation (+1) pour plus de volume.
 */
function getPhaseAdjustment(phase: AIFormData['phase'], baseReps: string): { reps: string } {
  if (!phase || phase === 'recomposition' || phase === 'maintien') {
    return { reps: baseReps }
  }
  const parts = baseReps.split('-')
  if (parts.length !== 2) return { reps: baseReps }
  const low = parseInt(parts[0], 10)
  const high = parseInt(parts[1], 10)
  if (isNaN(low) || isNaN(high)) return { reps: baseReps }
  switch (phase) {
    case 'seche':      return { reps: `${low + 2}-${high + 4}` }
    case 'prise_masse': return { reps: `${low + 1}-${high + 1}` }
    default: return { reps: baseReps }
  }
}

/**
 * Détermine le temps de repos (secondes) et le RPE cible selon le type d'exercice,
 * l'objectif et la phase. Les compound_heavy ont plus de repos (210s) que les isolation (75s).
 * En sèche, le repos est réduit de 20%. En prise de masse, augmenté de 15%.
 */
function getRestAndRPE(
  type: ExerciseType,
  goal: AIGoal,
  phase?: AIFormData['phase'],
): { restSeconds: number; rpe: number } {
  let restSeconds: number
  let rpe: number

  if (goal === 'cardio') {
    restSeconds = 38; rpe = 7
  } else if (type === 'compound_heavy') {
    restSeconds = 210; rpe = 9
  } else if (type === 'compound') {
    restSeconds = goal === 'bodybuilding' ? 105 : 120
    rpe = 8
  } else {
    // isolation or accessory
    restSeconds = 75
    rpe = goal === 'bodybuilding' ? 9 : 8
  }

  if (phase === 'seche') {
    restSeconds = Math.round(restSeconds * 0.8)
  } else if (phase === 'prise_masse') {
    restSeconds = Math.round(restSeconds * 1.15)
  }

  return { restSeconds, rpe }
}

/**
 * Calcule le nombre final de séries pour un exercice donné.
 * Prend en compte : type d'exercice, objectif, focus musculaire (+1 série),
 * phase prise de masse (+1 pour compounds), volume multiplier, et phase maintien (×0.8).
 * Résultat borné entre SETS_MIN et SETS_MAX selon le type.
 */
function computeSets(
  type: ExerciseType,
  goal: AIGoal,
  isFocus: boolean,
  form: AIFormData,
): number {
  const volumeMultiplier = getVolumeMultiplier(form)
  const baseSets = SETS_BY_TYPE_GOAL[type][goal]
  const isCompound = type === 'compound_heavy' || type === 'compound'
  const phaseMassBonus = form.phase === 'prise_masse' && isCompound ? 1 : 0
  const focusBonus = isFocus ? 1 : 0
  const maintienFactor = form.phase === 'maintien' ? 0.8 : 1.0
  const raw = Math.round((baseSets + focusBonus + phaseMassBonus) * volumeMultiplier * maintienFactor)
  return Math.max(SETS_MIN[type], Math.min(raw, SETS_MAX[type]))
}

// ─── Allocation d'exercices par muscle ────────────────────────────────────────

/**
 * Répartit le nombre total d'exercices entre les muscles d'une séance.
 * 1. Chaque muscle reçoit au moins 1 exercice (si le budget le permet)
 * 2. Les muscles en focus reçoivent un exercice supplémentaire
 * 3. Le reste est distribué en round-robin
 */
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

/**
 * Sélectionne les meilleurs exercices parmi les candidats.
 * Tri par priorité :
 * 1. Exercices non encore utilisés dans le programme (variété inter-séances)
 * 2. Muscles non travaillés récemment (variété inter-programmes)
 * 3. Composés avant isolations (compound_heavy → compound → accessory → isolation)
 * Un shuffle préalable introduit de l'aléatoire à priorité égale.
 */
function selectExercises(
  candidates: CandidateExercise[],
  count: number,
  usedNames: Set<string>,
  recentMuscles: string[],
): CandidateExercise[] {
  const shuffled = shuffleArray([...candidates])
  const sorted = shuffled.sort((a, b) => {
    const aUsed = usedNames.has(a.name) ? 1 : 0
    const bUsed = usedNames.has(b.name) ? 1 : 0
    if (aUsed !== bUsed) return aUsed - bUsed

    const aRecent = (a.meta && recentMuscles.includes(a.meta.primaryMuscle)) ? 1 : 0
    const bRecent = (b.meta && recentMuscles.includes(b.meta.primaryMuscle)) ? 1 : 0
    if (aRecent !== bRecent) return aRecent - bRecent

    const aOrder = a.meta ? TYPE_ORDER[a.meta.type] : 2
    const bOrder = b.meta ? TYPE_ORDER[b.meta.type] : 2
    return aOrder - bOrder
  })
  return sorted.slice(0, count)
}

// ─── Stretch balance ──────────────────────────────────────────────────────────

/**
 * Garantit qu'au moins 30% des exercices de la séance ont stretchFocus=true.
 * Si ce ratio n'est pas atteint, remplace les exercices avec le SFR le plus bas
 * (moins de stimulus par fatigue) par des exercices stretchFocus disponibles.
 * Cela améliore l'hypertrophie en position d'étirement.
 */
function ensureStretchBalance(
  exercises: GeneratedExercise[],
  allCandidates: CandidateExercise[],
  usedNames: Set<string>,
  form: AIFormData,
  context: DBContext,
): GeneratedExercise[] {
  const { goal, level, musclesFocus = [] } = form
  const stretchCount = exercises.filter(e => EXERCISE_METADATA[e.exerciseName]?.stretchFocus).length
  const target = Math.ceil(exercises.length * 0.3)
  if (stretchCount >= target) return exercises

  const stretchCandidates = allCandidates.filter(c =>
    !usedNames.has(c.name) && c.meta?.stretchFocus === true
  )
  if (stretchCandidates.length === 0) return exercises

  const result = [...exercises]
  const needed = target - stretchCount

  // Non-stretchFocus exercices triés par SFR croissant (meilleur candidat à remplacer = le plus faible)
  const replaceable = [...result]
    .filter(e => !EXERCISE_METADATA[e.exerciseName]?.stretchFocus)
    .sort((a, b) => {
      const aSfr = SFR_ORDER[EXERCISE_METADATA[a.exerciseName]?.sfr ?? ''] ?? -1
      const bSfr = SFR_ORDER[EXERCISE_METADATA[b.exerciseName]?.sfr ?? ''] ?? -1
      return aSfr - bSfr
    })

  const replacements = Math.min(needed, replaceable.length, stretchCandidates.length)
  for (let i = 0; i < replacements; i++) {
    const idx = result.findIndex(e => e.exerciseName === replaceable[i].exerciseName)
    if (idx === -1) continue
    const candidate = stretchCandidates[i]
    usedNames.delete(result[idx].exerciseName)
    usedNames.add(candidate.name)

    const type: ExerciseType = candidate.meta?.type ?? 'compound'
    const isFocus = musclesFocus.includes(candidate.meta?.primaryMuscle ?? '')
    const setsTarget = computeSets(type, goal, isFocus, form)
    const baseReps = REPS_BY_TYPE_GOAL[type][goal]
    const repsTarget = getPhaseAdjustment(form.phase, baseReps).reps
    const weightTarget = getWeightTarget(candidate.name, context.prs, goal, level)
    const { restSeconds, rpe } = getRestAndRPE(type, goal, form.phase)

    result[idx] = { exerciseName: candidate.name, setsTarget, repsTarget, weightTarget, restSeconds, rpe }
  }

  return result
}

// ─── Construction de séance ───────────────────────────────────────────────────

/**
 * Construit une séance complète pour un groupe de muscles donné.
 * Pipeline : allocation → filtrage blessures → sélection → calcul params → tri → stretch balance → cardio optionnel
 */
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

  // Filtrage blessures : exclure les exercices dont injuryRisk inclut une zone déclarée
  const activeInjuries = form.injuries?.filter(z => z !== 'none') ?? []
  function filterByInjuries(candidates: CandidateExercise[]): CandidateExercise[] {
    if (activeInjuries.length === 0) return candidates
    return candidates.filter(ex => {
      const meta = EXERCISE_METADATA[ex.name]
      if (!meta?.injuryRisk) return true
      return !meta.injuryRisk.some(zone => activeInjuries.includes(zone))
    })
  }

  // Pool complet niveau-filtré + injury-filtré (fallback si aucun exercice spécifique)
  const allCandidates: CandidateExercise[] = filterByInjuries(
    context.exercises
      .map(ex => toCandidate(ex, level))
      .filter((ex): ex is CandidateExercise => ex !== null)
  )

  const allExercises: GeneratedExercise[] = []

  for (const muscle of muscles) {
    const count = alloc[muscle] ?? 0
    if (count === 0) continue

    let candidates: CandidateExercise[] = filterByInjuries(
      context.exercises
        .map(ex => toCandidate(ex, level))
        .filter((ex): ex is CandidateExercise => ex !== null && ex.muscles.includes(muscle))
    )

    // Fallback : aucun exercice spécifique → pool complet
    if (candidates.length === 0) {
      candidates = allCandidates
    }

    const chosen = selectExercises(candidates, count, usedNames, context.recentMuscles)
    const isFocus = musclesFocus.includes(muscle)

    for (const ex of chosen) {
      usedNames.add(ex.name)
      const type: ExerciseType = ex.meta?.type ?? 'compound'
      const setsTarget = computeSets(type, goal, isFocus, form)
      const baseReps = REPS_BY_TYPE_GOAL[type][goal]
      const repsTarget = getPhaseAdjustment(form.phase, baseReps).reps
      const weightTarget = getWeightTarget(ex.name, context.prs, goal, level)
      const { restSeconds, rpe } = getRestAndRPE(type, goal, form.phase)

      allExercises.push({ exerciseName: ex.name, setsTarget, repsTarget, weightTarget, restSeconds, rpe })
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

  // Équilibrage stretchFocus : min 30% des exercices avec stretchFocus
  const balancedExercises = ensureStretchBalance(allExercises, allCandidates, usedNames, form, context)

  // Goal cardio : ajouter un exercice cardio en dernière position si disponible
  if (form.goal === 'cardio') {
    const cardioEx = context.exercises.find(
      ex => ex.muscles.includes('Cardio') && !usedNames.has(ex.name)
    )
    if (cardioEx) {
      usedNames.add(cardioEx.name)
      const { restSeconds, rpe } = getRestAndRPE('compound', 'cardio', form.phase)
      balancedExercises.push({
        exerciseName: cardioEx.name,
        setsTarget: 1,
        repsTarget: '20-30 min',
        weightTarget: 0,
        restSeconds,
        rpe,
      })
    }
  }

  return { name, exercises: balancedExercises }
}

// ─── Génération programme ─────────────────────────────────────────────────────

/**
 * Génère un programme complet multi-séances.
 * Distribue les jours selon le split choisi (ou auto-détecté),
 * priorise les séances contenant les muscles focus,
 * et ajoute une semaine de décharge si les conditions sont remplies (≥4j, récup non rapide, 36+).
 */
function generateProgram(form: AIFormData, context: DBContext): GeneratedPlan {
  const { daysPerWeek = 3, musclesFocus = [], split } = form
  const splitName = getSplitName(daysPerWeek, split)
  const splitGroups = (split && split !== 'auto') ? SPLITS[splitName] : getSplit(daysPerWeek)
  const sessionNames = SESSION_NAMES[splitName]

  const rawPlans: [string[], string][] = Array.from(
    { length: daysPerWeek },
    (_, i) => [splitGroups[i % splitGroups.length], sessionNames[i] ?? `Séance ${i + 1}`]
  )

  // Sessions contenant les muscles focus passent en premier (stable sort)
  let sessionPlans: [string[], string][]
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

  // Semaine de décharge si ≥4 jours, récupération non rapide, et groupe d'âge senior
  const includeDeload = daysPerWeek >= 4
    && (form.recovery ?? 'normale') !== 'rapide'
    && (form.ageGroup === '36-45' || form.ageGroup === '45+')

  const deloadSuffix = includeDeload ? ' (avec décharge)' : ''

  return {
    name: `${goalLabels[form.goal]} ${levelLabels[form.level]} – ${SPLIT_LABELS[splitName] ?? splitName} ${daysPerWeek}j/sem${deloadSuffix}`,
    sessions,
    includeDeload,
  }
}

// ─── Génération séance unique ─────────────────────────────────────────────────

/** Génère une séance unique (mode "session") — utilise les groupes musculaires sélectionnés ou Full Body par défaut */
function generateSession(form: AIFormData, context: DBContext): GeneratedPlan {
  const muscles = (form.muscleGroups && form.muscleGroups.length > 0)
    ? form.muscleGroups
    : ['Pecs', 'Dos', 'Quadriceps', 'Epaules', 'Abdos']

  const muscleLabel = (form.muscleGroups && form.muscleGroups.length > 0)
    ? form.muscleGroups.join(' + ')
    : 'Full Body'

  const usedNames = new Set<string>()
  const session = buildSession(muscleLabel, muscles, form, context, usedNames)

  const goalPrefix: Record<AIGoal, string> = {
    bodybuilding: 'Hypertrophie',
    power:        'Force',
    renfo:        'Renforcement',
    cardio:       'Cardio',
  }

  return {
    name: `Séance ${goalPrefix[form.goal]} – ${muscleLabel}`,
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
