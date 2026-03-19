import { computeExerciseFrequency } from '../exerciseFrequencyHelpers'
import { mockSet, mockExercise, mockHistory } from './testFactories'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet_(exerciseId: string, historyId: string) {
  return mockSet({ id: `s-${Math.random()}`, exerciseId, historyId, weight: 100, reps: 10 })
}

function makeExercise_(id: string, name: string, muscles: string[] = ['Pecs']) {
  return mockExercise({ id, name, muscles })
}

function makeHistory_(id: string, daysAgo: number) {
  return mockHistory({ id, startTime: new Date(Date.now() - daysAgo * DAY_MS) })
}

describe('computeExerciseFrequency', () => {
  it('retourne null si aucun set', () => {
    const result = computeExerciseFrequency([], [makeExercise_('e1', 'Bench')], [makeHistory_('h1', 1)], 30)
    expect(result).toBeNull()
  })

  it('retourne null si aucun exercice', () => {
    const result = computeExerciseFrequency([makeSet_('e1', 'h1')], [], [makeHistory_('h1', 1)], 30)
    expect(result).toBeNull()
  })

  it('retourne null si aucune history', () => {
    const result = computeExerciseFrequency([makeSet_('e1', 'h1')], [makeExercise_('e1', 'Bench')], [], 30)
    expect(result).toBeNull()
  })

  it('compte correct par exercice (sessions uniques)', () => {
    const exercises = [makeExercise_('e1', 'Bench'), makeExercise_('e2', 'Squat')]
    const histories = [makeHistory_('h1', 1), makeHistory_('h2', 3), makeHistory_('h3', 5)]
    // e1 dans h1 et h2 (2 fois), e2 dans h3 (1 fois)
    const sets = [
      makeSet_('e1', 'h1'),
      makeSet_('e1', 'h1'), // même session → pas de double comptage
      makeSet_('e1', 'h2'),
      makeSet_('e2', 'h3'),
    ]
    const result = computeExerciseFrequency(sets, exercises, histories, 30)
    expect(result).not.toBeNull()
    expect(result!.entries.find(e => e.exerciseId === 'e1')!.count).toBe(2)
    expect(result!.entries.find(e => e.exerciseId === 'e2')!.count).toBe(1)
  })

  it('tri par fréquence décroissante', () => {
    const exercises = [makeExercise_('e1', 'Bench'), makeExercise_('e2', 'Squat')]
    const histories = [makeHistory_('h1', 1), makeHistory_('h2', 3), makeHistory_('h3', 5)]
    const sets = [makeSet_('e1', 'h1'), makeSet_('e2', 'h2'), makeSet_('e2', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 30)!
    expect(result.entries[0].exerciseId).toBe('e2') // 2 sessions
    expect(result.entries[1].exerciseId).toBe('e1') // 1 session
  })

  it('détecte les exercices négligés (>30 jours)', () => {
    const exercises = [makeExercise_('e1', 'Bench')]
    const histories = [makeHistory_('h1', 40)]
    const sets = [makeSet_('e1', 'h1')]
    // periodDays=0 (tout) pour inclure cette vieille history
    const result = computeExerciseFrequency(sets, exercises, histories, 0)!
    expect(result.neglected.length).toBe(1)
    expect(result.neglected[0].exerciseId).toBe('e1')
  })

  it('filtre par période (30 jours)', () => {
    const exercises = [makeExercise_('e1', 'Bench')]
    const histories = [makeHistory_('h1', 1), makeHistory_('h2', 50)]
    const sets = [makeSet_('e1', 'h1'), makeSet_('e1', 'h2')]
    // period=30 → h2 (50j ago) est exclu
    const result = computeExerciseFrequency(sets, exercises, histories, 30)!
    expect(result.entries[0].count).toBe(1)
  })

  it('trend increasing quand plus de sessions en seconde moitié', () => {
    const exercises = [makeExercise_('e1', 'Bench')]
    // période 60j : 0 en 1re moitié (31-60j), 3 en 2e moitié (0-30j)
    const histories = [makeHistory_('h1', 5), makeHistory_('h2', 10), makeHistory_('h3', 15)]
    const sets = [makeSet_('e1', 'h1'), makeSet_('e1', 'h2'), makeSet_('e1', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 60)!
    expect(result.entries[0].trend).toBe('increasing')
  })

  it('trend decreasing quand plus de sessions en première moitié', () => {
    const exercises = [makeExercise_('e1', 'Bench')]
    // période 60j : 3 en 1re moitié (31-60j), 0 en 2e moitié (0-30j)
    const histories = [makeHistory_('h1', 35), makeHistory_('h2', 40), makeHistory_('h3', 50)]
    const sets = [makeSet_('e1', 'h1'), makeSet_('e1', 'h2'), makeSet_('e1', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 60)!
    expect(result.entries[0].trend).toBe('decreasing')
  })

  it('mostFrequent et leastFrequent correctement identifiés', () => {
    const exercises = [makeExercise_('e1', 'Bench'), makeExercise_('e2', 'Squat')]
    const histories = [makeHistory_('h1', 1), makeHistory_('h2', 3), makeHistory_('h3', 5)]
    const sets = [makeSet_('e1', 'h1'), makeSet_('e2', 'h2'), makeSet_('e2', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 30)!
    expect(result.mostFrequent!.exerciseId).toBe('e2')
    expect(result.leastFrequent!.exerciseId).toBe('e1')
  })
})
