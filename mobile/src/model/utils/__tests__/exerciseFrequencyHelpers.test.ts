import { computeExerciseFrequency } from '../exerciseFrequencyHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet(exerciseId: string, historyId: string) {
  return { id: `s-${Math.random()}`, exerciseId, historyId, weight: 100, reps: 10 } as any
}

function makeExercise(id: string, name: string, muscles: string[] = ['Pecs']) {
  return { id, name, muscles } as any
}

function makeHistory(id: string, daysAgo: number) {
  return { id, startTime: new Date(Date.now() - daysAgo * DAY_MS) } as any
}

describe('computeExerciseFrequency', () => {
  it('retourne null si aucun set', () => {
    const result = computeExerciseFrequency([], [makeExercise('e1', 'Bench')], [makeHistory('h1', 1)], 30)
    expect(result).toBeNull()
  })

  it('retourne null si aucun exercice', () => {
    const result = computeExerciseFrequency([makeSet('e1', 'h1')], [], [makeHistory('h1', 1)], 30)
    expect(result).toBeNull()
  })

  it('retourne null si aucune history', () => {
    const result = computeExerciseFrequency([makeSet('e1', 'h1')], [makeExercise('e1', 'Bench')], [], 30)
    expect(result).toBeNull()
  })

  it('compte correct par exercice (sessions uniques)', () => {
    const exercises = [makeExercise('e1', 'Bench'), makeExercise('e2', 'Squat')]
    const histories = [makeHistory('h1', 1), makeHistory('h2', 3), makeHistory('h3', 5)]
    // e1 dans h1 et h2 (2 fois), e2 dans h3 (1 fois)
    const sets = [
      makeSet('e1', 'h1'),
      makeSet('e1', 'h1'), // même session → pas de double comptage
      makeSet('e1', 'h2'),
      makeSet('e2', 'h3'),
    ]
    const result = computeExerciseFrequency(sets, exercises, histories, 30)
    expect(result).not.toBeNull()
    expect(result!.entries.find(e => e.exerciseId === 'e1')!.count).toBe(2)
    expect(result!.entries.find(e => e.exerciseId === 'e2')!.count).toBe(1)
  })

  it('tri par fréquence décroissante', () => {
    const exercises = [makeExercise('e1', 'Bench'), makeExercise('e2', 'Squat')]
    const histories = [makeHistory('h1', 1), makeHistory('h2', 3), makeHistory('h3', 5)]
    const sets = [makeSet('e1', 'h1'), makeSet('e2', 'h2'), makeSet('e2', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 30)!
    expect(result.entries[0].exerciseId).toBe('e2') // 2 sessions
    expect(result.entries[1].exerciseId).toBe('e1') // 1 session
  })

  it('détecte les exercices négligés (>30 jours)', () => {
    const exercises = [makeExercise('e1', 'Bench')]
    const histories = [makeHistory('h1', 40)]
    const sets = [makeSet('e1', 'h1')]
    // periodDays=0 (tout) pour inclure cette vieille history
    const result = computeExerciseFrequency(sets, exercises, histories, 0)!
    expect(result.neglected.length).toBe(1)
    expect(result.neglected[0].exerciseId).toBe('e1')
  })

  it('filtre par période (30 jours)', () => {
    const exercises = [makeExercise('e1', 'Bench')]
    const histories = [makeHistory('h1', 1), makeHistory('h2', 50)]
    const sets = [makeSet('e1', 'h1'), makeSet('e1', 'h2')]
    // period=30 → h2 (50j ago) est exclu
    const result = computeExerciseFrequency(sets, exercises, histories, 30)!
    expect(result.entries[0].count).toBe(1)
  })

  it('trend increasing quand plus de sessions en seconde moitié', () => {
    const exercises = [makeExercise('e1', 'Bench')]
    // période 60j : 0 en 1re moitié (31-60j), 3 en 2e moitié (0-30j)
    const histories = [makeHistory('h1', 5), makeHistory('h2', 10), makeHistory('h3', 15)]
    const sets = [makeSet('e1', 'h1'), makeSet('e1', 'h2'), makeSet('e1', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 60)!
    expect(result.entries[0].trend).toBe('increasing')
  })

  it('trend decreasing quand plus de sessions en première moitié', () => {
    const exercises = [makeExercise('e1', 'Bench')]
    // période 60j : 3 en 1re moitié (31-60j), 0 en 2e moitié (0-30j)
    const histories = [makeHistory('h1', 35), makeHistory('h2', 40), makeHistory('h3', 50)]
    const sets = [makeSet('e1', 'h1'), makeSet('e1', 'h2'), makeSet('e1', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 60)!
    expect(result.entries[0].trend).toBe('decreasing')
  })

  it('mostFrequent et leastFrequent correctement identifiés', () => {
    const exercises = [makeExercise('e1', 'Bench'), makeExercise('e2', 'Squat')]
    const histories = [makeHistory('h1', 1), makeHistory('h2', 3), makeHistory('h3', 5)]
    const sets = [makeSet('e1', 'h1'), makeSet('e2', 'h2'), makeSet('e2', 'h3')]
    const result = computeExerciseFrequency(sets, exercises, histories, 30)!
    expect(result.mostFrequent!.exerciseId).toBe('e2')
    expect(result.leastFrequent!.exerciseId).toBe('e1')
  })
})
