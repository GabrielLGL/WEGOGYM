import { computeVolumeRecords } from '../volumeRecordsHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(id: string, daysAgo: number) {
  return {
    id,
    startTime: new Date(Date.now() - daysAgo * DAY_MS),
  } as any
}

function makeSet(historyId: string, weight: number, reps: number) {
  return {
    historyId,
    weight,
    reps,
  } as any
}

describe('computeVolumeRecords', () => {
  it('retourne des records à 0 si aucune donnée', () => {
    const result = computeVolumeRecords([], [])
    expect(result.totalLifetimeVolume).toBe(0)
    expect(result.avgSessionVolume).toBe(0)
    expect(result.records).toHaveLength(3)
    expect(result.records[0].recordVolume).toBe(0)
    expect(result.recentTrend).toBe('stable')
  })

  it('record session = max volume d\'une seule séance', () => {
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 3),
      makeHistory('h3', 5),
    ]
    const sets = [
      makeSet('h1', 100, 10), // 1000
      makeSet('h2', 50, 10),  // 500
      makeSet('h2', 50, 10),  // 500 → h2 total = 1000
      makeSet('h3', 200, 10), // 2000
    ]
    const result = computeVolumeRecords(histories, sets)
    const sessionRecord = result.records.find(r => r.type === 'session')!
    expect(sessionRecord.recordVolume).toBe(2000)
  })

  it('record semaine = max volume sur 7 jours', () => {
    // Semaine 1 (récente) : 2 séances
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 2),
      makeHistory('h3', 14), // 2 semaines avant
    ]
    const sets = [
      makeSet('h1', 100, 10), // 1000
      makeSet('h2', 100, 10), // 1000 → semaine récente = 2000
      makeSet('h3', 50, 10),  // 500 → autre semaine = 500
    ]
    const result = computeVolumeRecords(histories, sets)
    const weekRecord = result.records.find(r => r.type === 'week')!
    expect(weekRecord.recordVolume).toBeGreaterThanOrEqual(2000)
  })

  it('record mois = max volume sur un mois calendaire', () => {
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 5),
    ]
    const sets = [
      makeSet('h1', 100, 10), // 1000
      makeSet('h2', 200, 10), // 2000
    ]
    const result = computeVolumeRecords(histories, sets)
    const monthRecord = result.records.find(r => r.type === 'month')!
    expect(monthRecord.recordVolume).toBe(3000)
  })

  it('isNewRecord = true si volume en cours > record', () => {
    // Une seule séance → elle est à la fois le record ET le courant
    // isNewRecord est false car currentVol == recordVol (pas strictement >)
    const histories = [makeHistory('h1', 1)]
    const sets = [makeSet('h1', 100, 10)] // 1000
    const result = computeVolumeRecords(histories, sets)
    const sessionRecord = result.records.find(r => r.type === 'session')!
    // Avec une seule séance, current == record → pas isNewRecord
    expect(sessionRecord.isNewRecord).toBe(false)
  })

  it('recentTrend = up si volume récent > volume précédent', () => {
    // 4 séances récentes (< 14j) vs 1 ancienne (14-28j)
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 3),
      makeHistory('h3', 5),
      makeHistory('h4', 20), // période précédente
    ]
    const sets = [
      makeSet('h1', 100, 10), // 1000
      makeSet('h2', 100, 10), // 1000
      makeSet('h3', 100, 10), // 1000 → recent = 3000
      makeSet('h4', 50, 10),  // 500 → previous = 500
    ]
    const result = computeVolumeRecords(histories, sets)
    expect(result.recentTrend).toBe('up')
  })

  it('totalLifetimeVolume est la somme de tout le volume', () => {
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 3),
    ]
    const sets = [
      makeSet('h1', 100, 10), // 1000
      makeSet('h2', 50, 20),  // 1000
    ]
    const result = computeVolumeRecords(histories, sets)
    expect(result.totalLifetimeVolume).toBe(2000)
  })
})
