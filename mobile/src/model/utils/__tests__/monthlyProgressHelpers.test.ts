import {
  computeMonthlyProgress,
  getAvailableMonths,
  formatMonthLabel,
} from '../monthlyProgressHelpers'

function makeHistory(dateStr: string) {
  return {
    id: `h-${dateStr}-${Math.random()}`,
    startTime: new Date(dateStr),
    deletedAt: null,
    isAbandoned: false,
  } as any
}

function makeSet(historyId: string, exerciseId: string, weight: number, reps: number, isPr = false) {
  return {
    historyId,
    exerciseId,
    weight,
    reps,
    isPr,
    createdAt: new Date(),
  } as any
}

function makeExercise(id: string, name: string) {
  return { id, name } as any
}

describe('computeMonthlyProgress', () => {
  it('retourne stats vides si aucune donnée', () => {
    const result = computeMonthlyProgress([], [], [], '2026-03')
    expect(result.current.totalVolume).toBe(0)
    expect(result.current.sessionCount).toBe(0)
    expect(result.trend).toBe('stable')
    expect(result.monthLabel).toBe('2026-03')
  })

  it('groupe correctement par mois cible', () => {
    const h1 = makeHistory('2026-03-05T10:00:00')
    const h2 = makeHistory('2026-03-15T10:00:00')
    const h3 = makeHistory('2026-02-10T10:00:00')

    const sets = [
      makeSet(h1.id, 'ex1', 100, 10),
      makeSet(h2.id, 'ex1', 80, 10),
      makeSet(h3.id, 'ex1', 60, 10),
    ]
    const exercises = [makeExercise('ex1', 'Bench Press')]

    const result = computeMonthlyProgress([h1, h2, h3], sets, exercises, '2026-03')
    expect(result.current.sessionCount).toBe(2)
    expect(result.current.totalVolume).toBe(1800) // 100*10 + 80*10
    expect(result.previous.sessionCount).toBe(1)
    expect(result.previous.totalVolume).toBe(600) // 60*10
  })

  it('calcule les deltas de progression', () => {
    const h1 = makeHistory('2026-03-05T10:00:00')
    const h2 = makeHistory('2026-02-05T10:00:00')

    const sets = [
      makeSet(h1.id, 'ex1', 100, 10),
      makeSet(h2.id, 'ex1', 50, 10),
    ]
    const exercises = [makeExercise('ex1', 'Squat')]

    const result = computeMonthlyProgress([h1, h2], sets, exercises, '2026-03')
    // volume: 1000 vs 500 = +100%
    expect(result.deltas.volume).toBe(100)
    expect(result.trend).toBe('up')
  })

  it('gère un seul mois de données', () => {
    const h1 = makeHistory('2026-03-05T10:00:00')
    const sets = [makeSet(h1.id, 'ex1', 100, 10)]
    const exercises = [makeExercise('ex1', 'DL')]

    const result = computeMonthlyProgress([h1], sets, exercises, '2026-03')
    expect(result.current.sessionCount).toBe(1)
    expect(result.previous.sessionCount).toBe(0)
    // delta = 100 (curr > 0, prev = 0)
    expect(result.deltas.sessions).toBe(100)
  })

  it('détecte la tendance down si volume diminue', () => {
    const h1 = makeHistory('2026-03-05T10:00:00')
    const h2 = makeHistory('2026-02-05T10:00:00')

    const sets = [
      makeSet(h1.id, 'ex1', 30, 10), // 300
      makeSet(h2.id, 'ex1', 100, 10), // 1000
    ]
    const exercises = [makeExercise('ex1', 'Bench')]

    const result = computeMonthlyProgress([h1, h2], sets, exercises, '2026-03')
    expect(result.trend).toBe('down')
  })

  it('identifie le top exercice du mois', () => {
    const h1 = makeHistory('2026-03-05T10:00:00')
    const sets = [
      makeSet(h1.id, 'ex1', 100, 10), // 1000
      makeSet(h1.id, 'ex2', 50, 5),   // 250
    ]
    const exercises = [
      makeExercise('ex1', 'Bench Press'),
      makeExercise('ex2', 'Curl'),
    ]

    const result = computeMonthlyProgress([h1], sets, exercises, '2026-03')
    expect(result.current.topExercise).not.toBeNull()
    expect(result.current.topExercise!.name).toBe('Bench Press')
  })
})

describe('getAvailableMonths', () => {
  it('retourne un tableau vide si aucune history', () => {
    expect(getAvailableMonths([])).toEqual([])
  })

  it('retourne les mois triés', () => {
    const histories = [
      makeHistory('2026-03-01'),
      makeHistory('2026-01-15'),
      makeHistory('2026-02-10'),
    ]
    const result = getAvailableMonths(histories as any)
    expect(result).toEqual(['2026-01', '2026-02', '2026-03'])
  })

  it('déduplique les mois', () => {
    const histories = [
      makeHistory('2026-03-01'),
      makeHistory('2026-03-15'),
    ]
    const result = getAvailableMonths(histories as any)
    expect(result).toEqual(['2026-03'])
  })
})

describe('formatMonthLabel', () => {
  it('formate en français', () => {
    expect(formatMonthLabel('2026-03', 'fr')).toBe('Mars 2026')
  })

  it('formate en anglais', () => {
    expect(formatMonthLabel('2026-01', 'en')).toBe('January 2026')
  })

  it('gère décembre correctement', () => {
    expect(formatMonthLabel('2025-12', 'fr')).toBe('Décembre 2025')
  })
})
