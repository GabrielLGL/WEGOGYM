import { computeReadiness } from '../workoutReadinessHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet(daysAgo: number, exerciseId = 'e1', weight = 100, reps = 10) {
  return { weight, reps, exerciseId, createdAt: new Date(Date.now() - daysAgo * DAY_MS) }
}

function makeExercise(id: string, muscles: string[] = ['Pecs']) {
  return { id, muscles }
}

function makeHistory(daysAgo: number) {
  return { startedAt: new Date(Date.now() - daysAgo * DAY_MS), isAbandoned: false }
}

/** Crée un historique suffisant : 4+ séances réparties sur 14+ jours */
function makeSufficientHistories() {
  return [makeHistory(1), makeHistory(7), makeHistory(14), makeHistory(21)]
}

describe('computeReadiness', () => {
  it('retourne null si aucune séance', () => {
    const result = computeReadiness([], [], [])
    expect(result).toBeNull()
  })

  it('retourne null si moins de 4 séances', () => {
    const histories = [makeHistory(1), makeHistory(7), makeHistory(14)]
    const result = computeReadiness([], [], histories)
    expect(result).toBeNull()
  })

  it('retourne null si historique étalé sur moins de 14 jours', () => {
    const histories = [makeHistory(1), makeHistory(3), makeHistory(5), makeHistory(10)]
    const result = computeReadiness([], [], histories)
    expect(result).toBeNull()
  })

  it('level optimal pour score >= 80 avec entraînement régulier', () => {
    // 5 jours d'entraînement sur 21j → consistencyScore=70 ou 90
    // Pas de sets récents dans les 7 derniers jours → recovery=100, fatigue ratio≈0 → 90
    const histories = [makeHistory(8), makeHistory(10), makeHistory(14), makeHistory(17), makeHistory(24)]
    const result = computeReadiness([], [], histories)
    expect(result).not.toBeNull()
    expect(result!.score).toBeGreaterThanOrEqual(80)
    expect(result!.level).toBe('optimal')
  })

  it('composants recovery, fatigue et consistency dans [0, 100]', () => {
    const exercises = [makeExercise('e1', ['Pecs'])]
    const sets = Array.from({ length: 10 }, (_, i) => makeSet(i, 'e1'))
    const histories = Array.from({ length: 10 }, (_, i) => makeHistory(i * 2))
    const result = computeReadiness(sets, exercises, histories)
    expect(result).not.toBeNull()

    expect(result!.components.recovery).toBeGreaterThanOrEqual(0)
    expect(result!.components.recovery).toBeLessThanOrEqual(100)
    expect(result!.components.fatigue).toBeGreaterThanOrEqual(0)
    expect(result!.components.fatigue).toBeLessThanOrEqual(100)
    expect(result!.components.consistency).toBeGreaterThanOrEqual(0)
    expect(result!.components.consistency).toBeLessThanOrEqual(100)
  })

  it('score arrondi à l\'entier', () => {
    const histories = makeSufficientHistories()
    const result = computeReadiness([], [], histories)
    expect(result).not.toBeNull()
    expect(result!.score).toBe(Math.round(result!.score))
  })

  it('retourne une recommendation avec clé i18n', () => {
    const histories = makeSufficientHistories()
    const result = computeReadiness([], [], histories)
    expect(result).not.toBeNull()
    expect(result!.recommendation).toMatch(/^home\.readiness\.recommendations\./)
  })

  it('score plus bas avec entraînement intensif récent', () => {
    const exercises = [makeExercise('e1', ['Pecs', 'Dos', 'Quadriceps'])]
    // Beaucoup de sets récents → fatigue élevée, recovery basse
    const sets = Array.from({ length: 20 }, (_, i) => makeSet(i % 3, 'e1', 150, 12))
    const histories = Array.from({ length: 10 }, (_, i) => makeHistory(i * 2))
    const resultHeavy = computeReadiness(sets, exercises, histories)

    const historiesRest = makeSufficientHistories()
    const resultRest = computeReadiness([], [], historiesRest)

    expect(resultHeavy).not.toBeNull()
    expect(resultRest).not.toBeNull()
    expect(resultHeavy!.score).toBeLessThan(resultRest!.score)
  })
})
