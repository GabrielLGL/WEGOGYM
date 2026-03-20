import { generatePlan } from '../aiService'
import { offlineEngine } from '../offlineEngine'
import { database } from '../../../model'
import type { AIFormData } from '../types'

jest.mock('@nozbe/watermelondb', () => ({
  Q: {
    where: jest.fn().mockReturnValue({}),
    gte:   jest.fn().mockReturnValue({}),
    oneOf: jest.fn().mockReturnValue({}),
    sortBy: jest.fn().mockReturnValue({}),
    take:  jest.fn().mockReturnValue({}),
    or:    jest.fn().mockReturnValue({}),
    desc:  'desc',
  },
}))

jest.mock('../../../model', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
    }),
  },
}))

jest.mock('../offlineEngine', () => ({
  offlineEngine: {
    generate: jest.fn().mockResolvedValue({ name: 'Plan Offline', sessions: [] }),
  },
}))

const mockDbGet = database.get as jest.Mock

const testForm: AIFormData = {
  mode: 'session',
  goal: 'bodybuilding',
  level: 'débutant',
  equipment: [],
  durationMin: 45,
  muscleGroups: ['Pecs'],
}

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generatePlan — offline engine', () => {
    it('utilise offlineEngine', async () => {
      const result = await generatePlan(testForm)

      expect(offlineEngine.generate as jest.Mock).toHaveBeenCalled()
      expect(result.plan.name).toBe('Plan Offline')
      expect(result.usedFallback).toBe(false)
    })
  })

  describe('generatePlan — buildDBContext branches', () => {
    function setupMockDB({
      exercises = [] as { id: string; name: string; muscles: string[]; equipment?: string }[],
      histories = [] as { id: string }[],
      sets = [] as { exercise: { id: string } }[],
      recentExercises = [] as { id: string; name: string; muscles: string[]; equipment?: string }[],
      performanceLogs = [] as { exercise: { id: string }; weight: number }[],
    } = {}) {
      let exerciseFetchCount = 0
      mockDbGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          exerciseFetchCount++
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(
                exerciseFetchCount === 1 ? exercises : recentExercises
              ),
            }),
          }
        }
        if (table === 'histories') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(histories),
            }),
          }
        }
        if (table === 'sets') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(sets),
            }),
          }
        }
        if (table === 'performance_logs') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(performanceLogs),
            }),
          }
        }
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
      })
    }

    beforeEach(() => {
      jest.clearAllMocks()
      ;(offlineEngine.generate as jest.Mock).mockResolvedValue({ name: 'Plan Offline', sessions: [] })
    })

    it('filtre les exercices par equipment quand form.equipment est renseigné', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: 'Poids libre' },
        { id: 'e2', name: 'Leg Press', muscles: ['Quadriceps'], equipment: 'Machine' },
        { id: 'e3', name: 'Curl', muscles: ['Biceps'], equipment: undefined },
      ]
      setupMockDB({ exercises })

      const form: AIFormData = { ...testForm, equipment: ['Haltères'], muscleGroups: [] }
      await generatePlan(form)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.exercises.some((e: { name: string }) => e.name === 'Bench Press')).toBe(true)
      expect(context.exercises.some((e: { name: string }) => e.name === 'Leg Press')).toBe(false)
    })

    it('filtre les exercices par muscleGroups quand défini et non vide', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: 'Poids libre' },
        { id: 'e2', name: 'Squat', muscles: ['Quadriceps'], equipment: 'Poids libre' },
        { id: 'e3', name: 'Pompes', muscles: [], equipment: 'Poids du corps' },
      ]
      setupMockDB({ exercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: ['Pectoraux'] }
      await generatePlan(form)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.exercises.some((e: { name: string }) => e.name === 'Bench Press')).toBe(true)
      expect(context.exercises.some((e: { name: string }) => e.name === 'Squat')).toBe(false)
    })

    it('retourne tous les exercices si muscleGroups est vide', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: 'Poids libre' },
        { id: 'e2', name: 'Squat', muscles: ['Quadriceps'], equipment: 'Poids libre' },
      ]
      setupMockDB({ exercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      await generatePlan(form)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.exercises).toHaveLength(2)
    })

    it('collecte les muscles récents depuis les histories + sets des 7 derniers jours', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: '' },
      ]
      const histories = [{ id: 'h1' }]
      const sets = [{ exercise: { id: 'e1' } }]
      const recentExercises = [{ id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: '' }]
      setupMockDB({ exercises, histories, sets, recentExercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      await generatePlan(form)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.recentMuscles).toContain('Pectoraux')
    })

    it('ne fetch pas les sets si aucune history récente', async () => {
      setupMockDB({ exercises: [], histories: [], sets: [] })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      await generatePlan(form)

      const setsCallMade = mockDbGet.mock.calls.some((call: string[]) => call[0] === 'sets')
      expect(setsCallMade).toBe(false)
    })

    it('construit les PRs depuis performance_logs pour les exercices connus', async () => {
      const exercises = [{ id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: '' }]
      const performanceLogs = [
        { exercise: { id: 'e1' }, weight: 100 },
        { exercise: { id: 'e1' }, weight: 80 },
        { exercise: { id: 'unknown' }, weight: 200 },
      ]
      setupMockDB({ exercises, performanceLogs })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      await generatePlan(form)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.prs['Bench Press']).toBe(100)
      expect(context.prs['unknown']).toBeUndefined()
    })

    it('garde le max poids quand plusieurs logs pour un même exercice', async () => {
      const exercises = [{ id: 'e1', name: 'Squat', muscles: ['Quadriceps'], equipment: '' }]
      const performanceLogs = [
        { exercise: { id: 'e1' }, weight: 60 },
        { exercise: { id: 'e1' }, weight: 120 },
        { exercise: { id: 'e1' }, weight: 100 },
      ]
      setupMockDB({ exercises, performanceLogs })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      await generatePlan(form)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.prs['Squat']).toBe(120)
    })
  })
})
