import type { AIFormData, DBContext, GeneratedPlan } from './types'

export function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(id) }
}

export function buildPrompt(form: AIFormData, context: DBContext): string {
  const modeLabel = form.mode === 'program' ? 'programme d\'entraînement' : 'séance d\'entraînement'
  const exerciseList = context.exercises.slice(0, 60).map(e => e.name).join(', ')
  const recentMusclesText = context.recentMuscles.length > 0
    ? `Muscles travaillés ces 7 derniers jours (éviter de retraviller < 48h) : ${context.recentMuscles.join(', ')}.`
    : ''

  const prsFormatted = Object.entries(context.prs)
    .map(([name, weight]) => `${name}: ${weight}kg`)
    .join(', ')
  const prsDetailedText = prsFormatted
    ? `Records personnels (utilise ces données pour suggérer des charges réalistes — environ 70-80% pour bodybuilding, 80-90% pour force) : ${prsFormatted}.`
    : 'Aucun record connu — utilise weightTarget: 0.'
  const modeDetails = form.mode === 'program'
    ? [
        `Jours par semaine : ${form.daysPerWeek ?? 3}.`,
        form.split && form.split !== 'auto'
          ? `Style de programme souhaité : ${form.split}.`
          : '',
        form.musclesFocus && form.musclesFocus.length > 0
          ? `Muscles prioritaires (plus de volume) : ${form.musclesFocus.join(', ')}.`
          : '',
      ].filter(Boolean).join('\n')
    : `Groupe musculaire ciblé : ${form.muscleGroup ?? 'Full Body'}.`

  const GOAL_PROMPT: Record<string, string> = {
    bodybuilding: 'bodybuilding (hypertrophie, prise de masse musculaire)',
    power:        'force (entraînement de force, powerlifting)',
    renfo:        'renforcement musculaire (tonification, endurance musculaire)',
    cardio:       'cardio et endurance cardiovasculaire',
  }

  return `Tu es un coach sportif expert. Génère un ${modeLabel} en JSON valide.

FORMAT EXACT OBLIGATOIRE (réponds UNIQUEMENT avec ce JSON, sans texte autour, sans markdown) :
{
  "name": "Nom du programme ou de la séance",
  "sessions": [
    {
      "name": "Nom de la séance",
      "exercises": [
        { "exerciseName": "Nom exact", "setsTarget": 3, "repsTarget": "10", "weightTarget": 0 }
      ]
    }
  ]
}

CONTRAINTES :
- Objectif : ${GOAL_PROMPT[form.goal] ?? form.goal}
- Niveau : ${form.level}
- Durée par séance : ${form.durationMin} minutes
- Équipement disponible : ${form.equipment.join(', ') || 'tous'}
- ${modeDetails}
- weightTarget doit être basé sur les PRs si disponibles (70-85% du PR selon l'objectif), sinon 0
${prsDetailedText}

DIRECTIVES SPORT SCIENCE :
- Commence chaque séance par 1-2 exercices composés (ex: squat, soulevé de terre, développé couché, tractions)
- Puis 2-3 exercices d'isolation
- Volume cible : 10-16 sets/semaine pour les grands groupes (Pecs, Dos, Quadriceps), 6-12 pour les petits (Biceps, Triceps)
- Progressive overload : si un PR est connu, propose une charge légèrement inférieure au PR (75-85%)
${recentMusclesText}
Utilise UNIQUEMENT ces exercices disponibles (choisis les plus adaptés) : ${exerciseList}

Si un exercice indispensable n'est pas dans la liste, tu peux en inventer un pertinent.
Pour repsTarget, utilise un nombre (ex: "10") ou une durée (ex: "30s").
weightTarget doit être 0 si inconnu.`
}

export function parseGeneratedPlan(raw: string): GeneratedPlan {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let json: unknown
  try {
    json = JSON.parse(cleaned)
  } catch {
    throw new Error(`Réponse API non-JSON : ${cleaned.slice(0, 100)}`)
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Structure JSON invalide : objet attendu')
  }

  const obj = json as Record<string, unknown>

  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    throw new Error('Structure JSON invalide : name manquant ou vide')
  }

  if (!Array.isArray(obj.sessions) || obj.sessions.length === 0) {
    throw new Error('Structure JSON invalide : sessions doit être un tableau non vide')
  }

  for (const session of obj.sessions as unknown[]) {
    if (!session || typeof session !== 'object') {
      throw new Error('Structure JSON invalide : chaque session doit être un objet')
    }
    const s = session as Record<string, unknown>
    if (typeof s.name !== 'string') throw new Error('Structure JSON invalide : session.name manquant')
    if (!Array.isArray(s.exercises)) throw new Error('Structure JSON invalide : session.exercises doit être un tableau')

    for (const ex of s.exercises as unknown[]) {
      if (!ex || typeof ex !== 'object') throw new Error('Structure JSON invalide : exercice invalide')
      const e = ex as Record<string, unknown>
      if (typeof e.exerciseName !== 'string' || !e.exerciseName.trim()) {
        throw new Error('Structure JSON invalide : exerciseName manquant')
      }
      if (typeof e.setsTarget !== 'number') throw new Error('Structure JSON invalide : setsTarget doit être un nombre')
      if (typeof e.repsTarget !== 'string') throw new Error('Structure JSON invalide : repsTarget doit être une string')
      if (typeof e.weightTarget !== 'number') {
        e.weightTarget = 0
      }
    }
  }

  return obj as unknown as GeneratedPlan
}
