import { buildPrompt, parseGeneratedPlan } from '../providerUtils'
import type { AIFormData, DBContext } from '../types'

const makeForm = (overrides: Partial<AIFormData> = {}): AIFormData => ({
  mode: 'program',
  goal: 'masse',
  level: 'débutant',
  equipment: ['Haltères', 'Barre & disques'],
  daysPerWeek: 3,
  durationMin: 60,
  ...overrides,
})

const makeContext = (overrides: Partial<DBContext> = {}): DBContext => ({
  exercises: ['Squat', 'Développé couché', 'Tractions'],
  recentMuscles: [],
  prs: {},
  ...overrides,
})

describe('buildPrompt', () => {
  it('contient le mot "programme" pour mode program', () => {
    const prompt = buildPrompt(makeForm({ mode: 'program' }), makeContext())
    expect(prompt).toContain("programme d'entraînement")
  })

  it('contient le mot "séance" pour mode session', () => {
    const prompt = buildPrompt(makeForm({ mode: 'session' }), makeContext())
    expect(prompt).toContain("séance d'entraînement")
  })

  it('inclut les exercices du contexte dans le prompt', () => {
    const context = makeContext({ exercises: ['Squat', 'Développé couché', 'Tractions'] })
    const prompt = buildPrompt(makeForm(), context)
    expect(prompt).toContain('Squat')
    expect(prompt).toContain('Développé couché')
  })

  it('inclut l\'objectif dans le prompt', () => {
    const prompt = buildPrompt(makeForm({ goal: 'force' }), makeContext())
    expect(prompt).toContain('force')
  })

  it('inclut le niveau dans le prompt', () => {
    const prompt = buildPrompt(makeForm({ level: 'avancé' }), makeContext())
    expect(prompt).toContain('avancé')
  })

  it('inclut la durée dans le prompt', () => {
    const prompt = buildPrompt(makeForm({ durationMin: 45 }), makeContext())
    expect(prompt).toContain('45')
  })

  it('inclut les PRs si présents', () => {
    const context = makeContext({ prs: { 'Squat': 120 } })
    const prompt = buildPrompt(makeForm(), context)
    expect(prompt).toContain('Records personnels')
    expect(prompt).toContain('Squat')
  })

  it('n\'inclut pas la section PRs si vide', () => {
    const prompt = buildPrompt(makeForm(), makeContext({ prs: {} }))
    expect(prompt).not.toContain('Records personnels')
  })

  it('inclut daysPerWeek pour mode program', () => {
    const prompt = buildPrompt(makeForm({ mode: 'program', daysPerWeek: 4 }), makeContext())
    expect(prompt).toContain('4')
  })

  it('inclut muscleGroup pour mode session', () => {
    const prompt = buildPrompt(makeForm({ mode: 'session', muscleGroup: 'Pecs' }), makeContext())
    expect(prompt).toContain('Pecs')
  })

  it('tronque les exercices à 60 maximum', () => {
    const exercises = Array.from({ length: 80 }, (_, i) => `Exercice${i}`)
    const prompt = buildPrompt(makeForm(), makeContext({ exercises }))
    // Les exercices 60+ ne doivent pas apparaître
    expect(prompt).not.toContain('Exercice60')
    expect(prompt).toContain('Exercice59')
  })

  it('inclut l\'équipement dans le prompt', () => {
    const prompt = buildPrompt(makeForm({ equipment: ['Poulies', 'Machines'] }), makeContext())
    expect(prompt).toContain('Poulies')
  })

  it('indique "tous" si équipement vide', () => {
    const prompt = buildPrompt(makeForm({ equipment: [] }), makeContext())
    expect(prompt).toContain('tous')
  })
})

describe('parseGeneratedPlan', () => {
  const validPlan = {
    name: 'Plan Test',
    sessions: [
      {
        name: 'Séance 1',
        exercises: [
          { exerciseName: 'Squat', setsTarget: 4, repsTarget: '8', weightTarget: 0 }
        ]
      }
    ]
  }

  it('parse un JSON valide', () => {
    const result = parseGeneratedPlan(JSON.stringify(validPlan))
    expect(result.name).toBe('Plan Test')
    expect(result.sessions).toHaveLength(1)
    expect(result.sessions[0].exercises[0].exerciseName).toBe('Squat')
  })

  it('parse un JSON entouré de markdown ```json', () => {
    const wrapped = '```json\n' + JSON.stringify(validPlan) + '\n```'
    const result = parseGeneratedPlan(wrapped)
    expect(result.name).toBe('Plan Test')
  })

  it('parse un JSON entouré de markdown ```', () => {
    const wrapped = '```\n' + JSON.stringify(validPlan) + '\n```'
    const result = parseGeneratedPlan(wrapped)
    expect(result.name).toBe('Plan Test')
  })

  it('lève une erreur si JSON invalide', () => {
    expect(() => parseGeneratedPlan('pas du json du tout')).toThrow()
  })

  it('lève une erreur si name manquant', () => {
    const invalid = { sessions: [{ name: 'S1', exercises: [] }] }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/name manquant/)
  })

  it('lève une erreur si name est vide', () => {
    const invalid = { ...validPlan, name: '   ' }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/name manquant/)
  })

  it('lève une erreur si sessions est absent', () => {
    const invalid = { name: 'Plan' }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/sessions/)
  })

  it('lève une erreur si sessions est vide', () => {
    const invalid = { name: 'Plan', sessions: [] }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/sessions/)
  })

  it('lève une erreur si une session n\'est pas un objet', () => {
    const invalid = { name: 'Plan', sessions: ['mauvais'] }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow()
  })

  it('lève une erreur si session.name manquant', () => {
    const invalid = {
      name: 'Plan',
      sessions: [{ exercises: [] }]
    }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/session\.name/)
  })

  it('lève une erreur si session.exercises manquant', () => {
    const invalid = {
      name: 'Plan',
      sessions: [{ name: 'S1' }]
    }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/exercises/)
  })

  it('lève une erreur si exerciseName manquant', () => {
    const invalid = {
      name: 'Plan',
      sessions: [{ name: 'S1', exercises: [{ setsTarget: 3, repsTarget: '10', weightTarget: 0 }] }]
    }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/exerciseName/)
  })

  it('lève une erreur si setsTarget n\'est pas un nombre', () => {
    const invalid = {
      name: 'Plan',
      sessions: [{ name: 'S1', exercises: [{ exerciseName: 'Squat', setsTarget: '4', repsTarget: '10', weightTarget: 0 }] }]
    }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/setsTarget/)
  })

  it('lève une erreur si repsTarget n\'est pas une string', () => {
    const invalid = {
      name: 'Plan',
      sessions: [{ name: 'S1', exercises: [{ exerciseName: 'Squat', setsTarget: 4, repsTarget: 10, weightTarget: 0 }] }]
    }
    expect(() => parseGeneratedPlan(JSON.stringify(invalid))).toThrow(/repsTarget/)
  })

  it('lève une erreur si le JSON est un tableau vide (name manquant)', () => {
    expect(() => parseGeneratedPlan(JSON.stringify([]))).toThrow()
  })
})
