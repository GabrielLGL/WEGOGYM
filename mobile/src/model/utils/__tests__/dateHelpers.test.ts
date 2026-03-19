import { getMondayOfWeek, getMondayOfWeekTs, getMondayOfCurrentWeek } from '../dateHelpers'

describe('getMondayOfWeek', () => {
  it('retourne un lundi', () => {
    const result = getMondayOfWeek(new Date(2026, 2, 19)) // jeudi 19 mars 2026
    expect(result.getDay()).toBe(1)
  })

  it('retourne le même jour si déjà lundi', () => {
    const result = getMondayOfWeek(new Date(2026, 2, 16)) // lundi 16 mars
    expect(result.getDate()).toBe(16)
  })

  it('retourne le lundi précédent pour un dimanche', () => {
    const result = getMondayOfWeek(new Date(2026, 2, 22)) // dimanche 22 mars
    expect(result.getDate()).toBe(16)
  })

  it('met les heures à 00:00:00.000', () => {
    const result = getMondayOfWeek(new Date(2026, 2, 18, 14, 30, 45, 123))
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('ne mute pas la date passée en entrée', () => {
    const original = new Date(2026, 2, 19, 10, 0, 0)
    const originalTime = original.getTime()
    getMondayOfWeek(original)
    expect(original.getTime()).toBe(originalTime)
  })
})

describe('getMondayOfWeekTs', () => {
  it('retourne un timestamp de lundi 00:00', () => {
    const ts = new Date(2026, 2, 19, 15, 30).getTime() // jeudi
    const result = new Date(getMondayOfWeekTs(ts))
    expect(result.getDay()).toBe(1)
    expect(result.getHours()).toBe(0)
  })

  it('cohérent avec getMondayOfWeek', () => {
    const date = new Date(2026, 2, 21) // samedi
    expect(getMondayOfWeekTs(date.getTime())).toBe(getMondayOfWeek(date).getTime())
  })
})

describe('getMondayOfCurrentWeek', () => {
  it('retourne un timestamp de lundi', () => {
    const result = new Date(getMondayOfCurrentWeek())
    expect(result.getDay()).toBe(1)
    expect(result.getHours()).toBe(0)
  })
})
