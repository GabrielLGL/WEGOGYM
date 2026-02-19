import { offlineEngine } from '../offlineEngine'
import type { AIFormData, DBContext } from '../types'

const makeForm = (overrides: Partial<AIFormData> = {}): AIFormData => ({
  mode: 'program',
  goal: 'masse',
  level: 'débutant',
  equipment: [],
  daysPerWeek: 3,
  durationMin: 60,
  ...overrides,
})

const makeContext = (exercises: string[] = []): DBContext => ({
  exercises,
  recentMuscles: [],
  prs: {},
})

describe('offlineEngine', () => {
  describe('generate — mode program', () => {
    it('génère un plan avec le bon nombre de séances (3 jours)', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 3 }), makeContext())
      expect(plan.sessions).toHaveLength(3)
    })

    it('génère un plan avec le bon nombre de séances (4 jours)', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 4 }), makeContext())
      expect(plan.sessions).toHaveLength(4)
    })

    it('génère un plan avec le bon nombre de séances (5 jours)', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 5 }), makeContext())
      expect(plan.sessions).toHaveLength(5)
    })

    it('génère un plan avec le bon nombre de séances (6 jours)', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 6 }), makeContext())
      expect(plan.sessions).toHaveLength(6)
    })

    it('inclut le label objectif dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ goal: 'masse' }), makeContext())
      expect(plan.name).toContain('Prise de masse')
    })

    it('inclut le label force dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ goal: 'force' }), makeContext())
      expect(plan.name).toContain('Force')
    })

    it('inclut le label perte dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ goal: 'perte' }), makeContext())
      expect(plan.name).toContain('Perte de poids')
    })

    it('inclut le label cardio dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ goal: 'cardio' }), makeContext())
      expect(plan.name).toContain('Cardio')
    })

    it('inclut le label niveau débutant dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ level: 'débutant' }), makeContext())
      expect(plan.name).toContain('Débutant')
    })

    it('inclut le label niveau intermédiaire dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ level: 'intermédiaire' }), makeContext())
      expect(plan.name).toContain('Intermédiaire')
    })

    it('inclut le label niveau avancé dans le nom du plan', async () => {
      const plan = await offlineEngine.generate(makeForm({ level: 'avancé' }), makeContext())
      expect(plan.name).toContain('Avancé')
    })

    it('utilise les exercices fournis dans le contexte', async () => {
      const exercises = ['Squat', 'Développé couché', 'Tractions', 'Curl']
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 1 }), makeContext(exercises))
      const allExercises = plan.sessions.flatMap(s => s.exercises.map(e => e.exerciseName))
      expect(allExercises.every(name => exercises.includes(name))).toBe(true)
    })

    it('chaque exercice a setsTarget > 0 et repsTarget non vide', async () => {
      const plan = await offlineEngine.generate(makeForm(), makeContext())
      plan.sessions.forEach(session => {
        session.exercises.forEach(ex => {
          expect(ex.setsTarget).toBeGreaterThan(0)
          expect(ex.repsTarget).toBeTruthy()
          expect(ex.weightTarget).toBe(0)
        })
      })
    })

    it('objectif force: 5 séries de 5 reps', async () => {
      const exercises = ['Squat', 'Développé couché', 'Tractions', 'Curl', 'Deadlift']
      const plan = await offlineEngine.generate(makeForm({ goal: 'force', daysPerWeek: 1 }), makeContext(exercises))
      const firstEx = plan.sessions[0].exercises[0]
      expect(firstEx.setsTarget).toBe(5)
      expect(firstEx.repsTarget).toBe('5')
    })

    it('objectif perte: 3 séries de 12 reps', async () => {
      const exercises = ['Squat', 'Développé couché', 'Tractions', 'Curl', 'Deadlift']
      const plan = await offlineEngine.generate(makeForm({ goal: 'perte', daysPerWeek: 1 }), makeContext(exercises))
      const firstEx = plan.sessions[0].exercises[0]
      expect(firstEx.setsTarget).toBe(3)
      expect(firstEx.repsTarget).toBe('12')
    })

    it('objectif cardio: 3 séries de 15 reps', async () => {
      const exercises = ['Squat', 'Développé couché', 'Tractions', 'Curl', 'Deadlift']
      const plan = await offlineEngine.generate(makeForm({ goal: 'cardio', daysPerWeek: 1 }), makeContext(exercises))
      const firstEx = plan.sessions[0].exercises[0]
      expect(firstEx.setsTarget).toBe(3)
      expect(firstEx.repsTarget).toBe('15')
    })

    it('nombre d\'exercices par séance selon durée 30min → 4', async () => {
      const exercises = Array.from({ length: 10 }, (_, i) => `Ex${i}`)
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 1, durationMin: 30 }), makeContext(exercises))
      expect(plan.sessions[0].exercises).toHaveLength(4)
    })

    it('nombre d\'exercices par séance selon durée 45min → 5', async () => {
      const exercises = Array.from({ length: 10 }, (_, i) => `Ex${i}`)
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 1, durationMin: 45 }), makeContext(exercises))
      expect(plan.sessions[0].exercises).toHaveLength(5)
    })

    it('nombre d\'exercices par séance selon durée 60min → 6', async () => {
      const exercises = Array.from({ length: 10 }, (_, i) => `Ex${i}`)
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 1, durationMin: 60 }), makeContext(exercises))
      expect(plan.sessions[0].exercises).toHaveLength(6)
    })

    it('nombre d\'exercices par séance selon durée 90min → 8', async () => {
      const exercises = Array.from({ length: 10 }, (_, i) => `Ex${i}`)
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 1, durationMin: 90 }), makeContext(exercises))
      expect(plan.sessions[0].exercises).toHaveLength(8)
    })

    it('séances fullbody (≤3 jours) nommées Full Body', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 2 }), makeContext())
      expect(plan.sessions[0].name).toContain('Full Body')
    })

    it('séances upper/lower (4 jours) nommées Upper/Lower', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 4 }), makeContext())
      const names = plan.sessions.map(s => s.name)
      expect(names[0]).toBe('Upper Body')
      expect(names[1]).toBe('Lower Body')
    })

    it('séances ppl (≥5 jours) nommées Push/Pull/Legs', async () => {
      const plan = await offlineEngine.generate(makeForm({ daysPerWeek: 5 }), makeContext())
      const names = plan.sessions.map(s => s.name)
      expect(names[0]).toBe('Push')
      expect(names[1]).toBe('Pull')
      expect(names[2]).toBe('Legs')
    })

    it('utilise fallback pour daysPerWeek undefined', async () => {
      const form = makeForm()
      delete (form as Partial<AIFormData>).daysPerWeek
      const plan = await offlineEngine.generate(form, makeContext())
      // Default 3 jours
      expect(plan.sessions).toHaveLength(3)
    })
  })

  describe('generate — mode session', () => {
    it('génère exactement 1 séance', async () => {
      const plan = await offlineEngine.generate(
        makeForm({ mode: 'session', muscleGroup: 'Pecs' }),
        makeContext()
      )
      expect(plan.sessions).toHaveLength(1)
    })

    it('le nom du plan contient le groupe musculaire', async () => {
      const plan = await offlineEngine.generate(
        makeForm({ mode: 'session', muscleGroup: 'Dos' }),
        makeContext()
      )
      expect(plan.name).toContain('Dos')
    })

    it('utilise Full Body si muscleGroup absent', async () => {
      const plan = await offlineEngine.generate(
        makeForm({ mode: 'session' }),
        makeContext()
      )
      expect(plan.name).toContain('Full Body')
    })

    it('utilise les exercices du contexte pour la séance', async () => {
      const exercises = ['Développé couché', 'Écartés', 'Dips', 'Pec Deck', 'Câble croisé', 'Pompes']
      const plan = await offlineEngine.generate(
        makeForm({ mode: 'session', muscleGroup: 'Pecs', durationMin: 30 }),
        makeContext(exercises)
      )
      const exNames = plan.sessions[0].exercises.map(e => e.exerciseName)
      expect(exNames.every(n => exercises.includes(n))).toBe(true)
    })
  })
})
