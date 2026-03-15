import { computeOverloadTrend } from '../progressiveOverloadHelpers'

function makeSet(weight: number, reps: number, daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return { weight, reps, createdAt: d }
}

describe('computeOverloadTrend', () => {
  it('returns correct lastSessions count for 2 sessions', () => {
    const sets = [makeSet(60, 8, 10), makeSet(62, 8, 5)]
    const { weightTrend } = computeOverloadTrend(sets)
    // 2 sessions — UI will hide section (lastSessions < 3), but helper still computes
    expect(weightTrend.lastSessions).toBe(2)
    expect(weightTrend.dataPoints).toHaveLength(2)
  })

  it('detects upward weight trend', () => {
    const sets = [
      makeSet(50, 8, 30),
      makeSet(55, 8, 24),
      makeSet(60, 8, 17),
      makeSet(65, 8, 10),
      makeSet(70, 8, 3),
    ]
    const { weightTrend } = computeOverloadTrend(sets)
    expect(weightTrend.trend).toBe('up')
    expect(weightTrend.percentChange).toBeGreaterThan(0)
    expect(weightTrend.lastSessions).toBe(5)
  })

  it('detects downward weight trend', () => {
    const sets = [
      makeSet(70, 8, 30),
      makeSet(65, 8, 24),
      makeSet(60, 8, 17),
      makeSet(55, 8, 10),
      makeSet(50, 8, 3),
    ]
    const { weightTrend } = computeOverloadTrend(sets)
    expect(weightTrend.trend).toBe('down')
    expect(weightTrend.percentChange).toBeLessThan(0)
  })

  it('stable when variation < 2%', () => {
    const sets = [
      makeSet(60, 8, 30),
      makeSet(60.5, 8, 24),
      makeSet(60, 8, 17),
    ]
    const { weightTrend } = computeOverloadTrend(sets)
    expect(weightTrend.trend).toBe('stable')
  })

  it('detects upward volume trend (more reps)', () => {
    const sets = [
      makeSet(60, 5, 30),
      makeSet(60, 8, 24),
      makeSet(60, 10, 17),
      makeSet(60, 12, 10),
      makeSet(60, 15, 3),
    ]
    const { volumeTrend } = computeOverloadTrend(sets)
    expect(volumeTrend.trend).toBe('up')
  })

  it('groups multiple sets on same day', () => {
    const d = new Date()
    d.setDate(d.getDate() - 5)
    const sameDay = [
      { weight: 60, reps: 8, createdAt: d },
      { weight: 65, reps: 8, createdAt: d },
    ]
    const otherDay1 = makeSet(50, 8, 15)
    const otherDay2 = makeSet(55, 8, 10)
    const { weightTrend } = computeOverloadTrend([otherDay1, otherDay2, ...sameDay])
    // 3 sessions: day-15, day-10, day-5
    expect(weightTrend.lastSessions).toBe(3)
    // maxWeight for same-day session is 65
    const lastPoint = weightTrend.dataPoints[weightTrend.dataPoints.length - 1]
    expect(lastPoint.value).toBe(65)
  })

  it('respects windowSize parameter', () => {
    const sets = [
      makeSet(50, 8, 40),
      makeSet(55, 8, 30),
      makeSet(60, 8, 20),
      makeSet(65, 8, 10),
      makeSet(70, 8, 5),
      makeSet(75, 8, 2),
    ]
    const { weightTrend } = computeOverloadTrend(sets, 3)
    expect(weightTrend.lastSessions).toBe(3)
  })
})
