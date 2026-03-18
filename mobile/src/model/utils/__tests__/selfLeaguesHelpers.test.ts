import {
  computeSelfLeaguePeriods,
  buildSelfLeaguesRanking,
} from '../selfLeaguesHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

interface MockHistory {
  id: string
  startTime: Date
  endTime: Date
  deletedAt: Date | null
  isAbandoned: boolean
}

function makeHistory(daysAgo: number, overrides: Record<string, unknown> = {}): MockHistory {
  const startTime = new Date(Date.now() - daysAgo * DAY_MS)
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // +1h
  return {
    id: `h-${daysAgo}-${Math.random().toString(36).slice(2, 6)}`,
    startTime,
    endTime,
    deletedAt: null,
    isAbandoned: false,
    ...overrides,
  } as MockHistory
}

function makeSet(historyId: string, weight = 100, reps = 10, isPr = false) {
  return {
    history: { id: historyId },
    weight,
    reps,
    isPr,
    createdAt: new Date(),
  } as never
}

describe('computeSelfLeaguePeriods', () => {
  it('retourne vide si aucune donnée', () => {
    expect(computeSelfLeaguePeriods([], [], 'week')).toEqual([])
  })

  it('exclut les séances abandonnées et supprimées', () => {
    const abandoned = makeHistory(3, { isAbandoned: true })
    const deleted = makeHistory(5, { deletedAt: new Date() })
    const result = computeSelfLeaguePeriods([abandoned, deleted] as never[], [], 'week')
    expect(result).toEqual([])
  })

  it('calcule les périodes hebdomadaires', () => {
    const h1 = makeHistory(1)
    const s1 = makeSet(h1.id, 80, 10)
    const result = computeSelfLeaguePeriods([h1] as never[], [s1] as never[], 'week')
    expect(result.length).toBeGreaterThanOrEqual(1)
    const currentWeek = result.find(p => p.isCurrentPeriod)
    expect(currentWeek).toBeDefined()
    expect(currentWeek!.sessions).toBe(1)
    expect(currentWeek!.volume).toBe(800)
  })

  it('calcule les périodes mensuelles', () => {
    const h1 = makeHistory(1)
    const s1 = makeSet(h1.id, 50, 20)
    const result = computeSelfLeaguePeriods([h1] as never[], [s1] as never[], 'month')
    expect(result.length).toBeGreaterThanOrEqual(1)
    const currentMonth = result.find(p => p.isCurrentPeriod)
    expect(currentMonth).toBeDefined()
    expect(currentMonth!.sessions).toBe(1)
    expect(currentMonth!.volume).toBe(1000)
  })

  it('compte les PRs correctement', () => {
    const h1 = makeHistory(2)
    const s1 = makeSet(h1.id, 100, 5, true)
    const s2 = makeSet(h1.id, 80, 10, false)
    const result = computeSelfLeaguePeriods([h1] as never[], [s1, s2] as never[], 'week')
    const currentWeek = result.find(p => p.isCurrentPeriod)
    expect(currentWeek!.prs).toBe(1)
  })
})

describe('buildSelfLeaguesRanking', () => {
  it('retourne vide si aucune période', () => {
    expect(buildSelfLeaguesRanking([], 'volume')).toEqual([])
  })

  it('classe par volume décroissant', () => {
    const periods = [
      { label: 'S1', startDate: 0, endDate: 1, volume: 500, sessions: 2, prs: 0, tonnage: 500, durationMin: 60, isCurrentPeriod: false },
      { label: 'S2', startDate: 2, endDate: 3, volume: 1000, sessions: 3, prs: 1, tonnage: 1000, durationMin: 90, isCurrentPeriod: true },
    ]
    const result = buildSelfLeaguesRanking(periods, 'volume')
    expect(result[0].rank).toBe(1)
    expect(result[0].value).toBe(1000)
    expect(result[1].rank).toBe(2)
    expect(result[1].value).toBe(500)
  })

  it('classe par sessions décroissant', () => {
    const periods = [
      { label: 'S1', startDate: 0, endDate: 1, volume: 500, sessions: 5, prs: 0, tonnage: 500, durationMin: 60, isCurrentPeriod: false },
      { label: 'S2', startDate: 2, endDate: 3, volume: 1000, sessions: 3, prs: 1, tonnage: 1000, durationMin: 90, isCurrentPeriod: true },
    ]
    const result = buildSelfLeaguesRanking(periods, 'sessions')
    expect(result[0].value).toBe(5)
    expect(result[1].value).toBe(3)
  })

  it('calcule pctFromAvg correctement', () => {
    const periods = [
      { label: 'S1', startDate: 0, endDate: 1, volume: 200, sessions: 2, prs: 0, tonnage: 200, durationMin: 30, isCurrentPeriod: false },
      { label: 'S2', startDate: 2, endDate: 3, volume: 400, sessions: 4, prs: 0, tonnage: 400, durationMin: 60, isCurrentPeriod: false },
    ]
    const result = buildSelfLeaguesRanking(periods, 'volume')
    // avg = 300, S2 = 400 → +33%, S1 = 200 → -33%
    expect(result[0].pctFromAvg).toBe(33)
    expect(result[1].pctFromAvg).toBe(-33)
  })

  it('classe par durée décroissant', () => {
    const periods = [
      { label: 'S1', startDate: 0, endDate: 1, volume: 0, sessions: 0, prs: 0, tonnage: 0, durationMin: 120, isCurrentPeriod: false },
      { label: 'S2', startDate: 2, endDate: 3, volume: 0, sessions: 0, prs: 0, tonnage: 0, durationMin: 45, isCurrentPeriod: true },
    ]
    const result = buildSelfLeaguesRanking(periods, 'duration')
    expect(result[0].value).toBe(120)
    expect(result[1].value).toBe(45)
  })
})
