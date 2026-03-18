import { predictSessionDuration } from '../durationPredictorHelpers'

function makeHistory(sessionId: string, durationMinutes: number, daysAgo = 0) {
  const start = Date.now() - daysAgo * 24 * 60 * 60 * 1000
  return {
    startTime: new Date(start),
    endTime: new Date(start + durationMinutes * 60000),
    sessionId,
    deletedAt: null,
    isAbandoned: false,
  }
}

describe('predictSessionDuration', () => {
  it('retourne confidence low si pas d\'historique pour cette session', () => {
    const result = predictSessionDuration(5, [], 'session-1')
    expect(result.confidence).toBe('low')
    expect(result.basedOnSessions).toBe(0)
  })

  it('estimation par défaut basée sur le nombre d\'exercices', () => {
    const result = predictSessionDuration(5, [], 'session-1')
    // 5 exercices × 8 min/exercice = 40 min
    expect(result.estimatedMinutes).toBe(40)
  })

  it('prediction basée sur durées précédentes de la même session', () => {
    const histories = [
      makeHistory('session-1', 60, 7),
      makeHistory('session-1', 50, 14),
      makeHistory('session-1', 55, 21),
    ]
    const result = predictSessionDuration(5, histories, 'session-1')
    expect(result.basedOnSessions).toBe(3)
    expect(result.confidence).toBe('high')
    // Moyenne pondérée, proche de 55-60
    expect(result.estimatedMinutes).toBeGreaterThanOrEqual(50)
    expect(result.estimatedMinutes).toBeLessThanOrEqual(65)
  })

  it('gère une seule séance passée', () => {
    const histories = [makeHistory('session-1', 45, 3)]
    const result = predictSessionDuration(5, histories, 'session-1')
    expect(result.basedOnSessions).toBe(1)
    expect(result.confidence).toBe('medium')
    expect(result.estimatedMinutes).toBe(45)
  })

  it('prediction pas négative et pas > 180 min', () => {
    const histories = [
      makeHistory('session-1', 170, 1),
      makeHistory('session-1', 175, 7),
    ]
    const result = predictSessionDuration(5, histories, 'session-1')
    expect(result.estimatedMinutes).toBeGreaterThanOrEqual(10)
    expect(result.estimatedMinutes).toBeLessThanOrEqual(180)
  })

  it('ignore les séances d\'autres sessions', () => {
    const histories = [
      makeHistory('session-2', 60, 1), // autre session
      makeHistory('session-2', 70, 7), // autre session
    ]
    const result = predictSessionDuration(5, histories, 'session-1')
    expect(result.basedOnSessions).toBe(0)
    expect(result.confidence).toBe('low')
  })

  it('ignore les séances supprimées et abandonnées', () => {
    const deleted = {
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60000),
      sessionId: 'session-1',
      deletedAt: new Date(),
      isAbandoned: false,
    }
    const abandoned = {
      startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 45 * 60000),
      sessionId: 'session-1',
      deletedAt: null,
      isAbandoned: true,
    }
    const result = predictSessionDuration(5, [deleted, abandoned], 'session-1')
    expect(result.basedOnSessions).toBe(0)
  })

  it('range min < estimatedMinutes < range max', () => {
    const histories = [
      makeHistory('session-1', 40, 1),
      makeHistory('session-1', 60, 7),
      makeHistory('session-1', 50, 14),
    ]
    const result = predictSessionDuration(5, histories, 'session-1')
    expect(result.range.min).toBeLessThanOrEqual(result.estimatedMinutes)
    expect(result.range.max).toBeGreaterThanOrEqual(result.estimatedMinutes)
  })
})
