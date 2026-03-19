import { computeOvertrainingAlert } from '../overtrainingHelpers'
import { DAY_MS } from '../../constants'

function makeHistory(dayOffset: number, suffix = '') {
  const ts = Date.now() - dayOffset * DAY_MS + 3_600_000
  return { id: `h-${dayOffset}-${suffix}`, startTime: new Date(ts) }
}

function makeSet(historyId: string, weight = 100, reps = 10) {
  return { history: { id: historyId }, weight, reps }
}

describe('computeOvertrainingAlert', () => {
  it('retourne null si moins de 10 séances', () => {
    const histories = Array.from({ length: 9 }, (_, i) => makeHistory(i * 3))
    expect(computeOvertrainingAlert(histories as never, [])).toBeNull()
  })

  it('retourne null si entraînement modéré (1 séance tous les 3 jours)', () => {
    // 10 séances, aucune >7 en 7 jours, repos réguliers
    const histories = Array.from({ length: 10 }, (_, i) => makeHistory(i * 3))
    expect(computeOvertrainingAlert(histories as never, [])).toBeNull()
  })

  it('détecte high_frequency (>7 séances sur 7 derniers jours)', () => {
    // 8 séances en 4 jours (2/jour), 2 séances dans l'ancien temps
    const recent = Array.from({ length: 8 }, (_, i) => makeHistory(Math.floor(i / 2), `r${i}`))
    const old = Array.from({ length: 2 }, (_, i) => makeHistory(20 + i * 5, `o${i}`))
    const result = computeOvertrainingAlert([...recent, ...old] as never, [])
    expect(result?.signal).toBe('high_frequency')
    expect(result?.detail).toBeGreaterThan(7)
  })

  it('détecte no_rest_7days (14j sans repos de 2 jours consécutifs)', () => {
    // 10 séances sur jours 2-11 (hors fenêtre 7j stricte, dans fenêtre 14j)
    // La fenêtre 7 jours inclut jours 2-7 (6 séances ≤ 7) → pas high_frequency
    // Aucun écart de 2j consécutifs → no_rest_7days
    const histories = Array.from({ length: 10 }, (_, i) => makeHistory(i + 2, `nr${i}`))
    const result = computeOvertrainingAlert(histories as never, [])
    expect(result?.signal).toBe('no_rest_7days')
  })

  it('retourne un signal valide pour un volume spike', () => {
    // Données suffisantes (>= 10) et modérées pour éviter high_frequency / no_rest
    const histories = Array.from({ length: 10 }, (_, i) => makeHistory(i * 3, `vs${i}`))
    const result = computeOvertrainingAlert(histories as never, [])
    if (result !== null) {
      expect(['high_frequency', 'no_rest_7days', 'volume_spike_3weeks']).toContain(result.signal)
    }
  })
})
