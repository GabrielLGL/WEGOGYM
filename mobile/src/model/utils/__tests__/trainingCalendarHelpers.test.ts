import { computeTrainingCalendar } from '../trainingCalendarHelpers'

describe('computeTrainingCalendar', () => {
  it('returns correct number of weeks and days', () => {
    const result = computeTrainingCalendar([], [], 12)
    expect(result).toHaveLength(12)
    for (const week of result) {
      expect(week.days).toHaveLength(7)
    }
  })

  it('marks all days as intensity 0 when no histories', () => {
    const result = computeTrainingCalendar([], [], 4)
    for (const week of result) {
      for (const day of week.days) {
        expect(day.intensity).toBe(0)
        expect(day.setsCount).toBe(0)
      }
    }
  })

  it('assigns intensity > 0 for days with workouts', () => {
    const now = Date.now()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const histories = [
      { createdAt: today.getTime(), deletedAt: null, isAbandoned: false },
      { createdAt: today.getTime() + 1000, deletedAt: null, isAbandoned: false },
    ]

    const result = computeTrainingCalendar(histories, [], 2)
    const allDays = result.flatMap(w => w.days)
    const todayDay = allDays.find(d => d.isToday)
    expect(todayDay).toBeDefined()
    expect(todayDay!.setsCount).toBe(2)
    expect(todayDay!.intensity).toBeGreaterThan(0)
  })

  it('excludes deleted and abandoned histories', () => {
    const now = Date.now()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const histories = [
      { createdAt: today.getTime(), deletedAt: new Date(), isAbandoned: false },
      { createdAt: today.getTime(), deletedAt: null, isAbandoned: true },
    ]

    const result = computeTrainingCalendar(histories, [], 2)
    const allDays = result.flatMap(w => w.days)
    const todayDay = allDays.find(d => d.isToday)
    expect(todayDay!.setsCount).toBe(0)
    expect(todayDay!.intensity).toBe(0)
  })

  it('marks exactly one day as isToday', () => {
    const result = computeTrainingCalendar([], [], 12)
    const allDays = result.flatMap(w => w.days)
    const todayDays = allDays.filter(d => d.isToday)
    expect(todayDays).toHaveLength(1)
  })
})
