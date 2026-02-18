import type { AIFormData, DBContext, GeneratedPlan } from './types'

export function buildPrompt(form: AIFormData, context: DBContext): string {
  const modeLabel = form.mode === 'program' ? 'programme d\'entraînement' : 'séance d\'entraînement'
  const exerciseList = context.exercises.slice(0, 60).join(', ')
  const prsText = Object.keys(context.prs).length > 0
    ? `Records personnels connus : ${JSON.stringify(context.prs)}.`
    : ''
  const modeDetails = form.mode === 'program'
    ? `Jours par semaine : ${form.daysPerWeek ?? 3}.`
    : `Groupe musculaire ciblé : ${form.muscleGroup ?? 'Full Body'}.`

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
- Objectif : ${form.goal}
- Niveau : ${form.level}
- Durée par séance : ${form.durationMin} minutes
- Équipement disponible : ${form.equipment.join(', ') || 'tous'}
- ${modeDetails}
${prsText}

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

  const json = JSON.parse(cleaned)

  if (!json || typeof json.name !== 'string' || !Array.isArray(json.sessions)) {
    throw new Error('Structure JSON invalide : name ou sessions manquant')
  }

  return json as GeneratedPlan
}
