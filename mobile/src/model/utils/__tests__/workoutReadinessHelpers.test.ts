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

describe('computeReadiness', () => {
  it('score élevé si aucune séance récente (full recovery)', () => {
    const result = computeReadiness([], [], [])
    // recovery=100, fatigue ratio=0 → fatigueScore=90, consistency=0days → 20
    // Score = 100*0.4 + 90*0.35 + 20*0.25 = 76.5 → 77
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.level).toBe('good')
  })

  it('level optimal pour score >= 80 avec entraînement régulier', () => {
    // 4 jours d'entraînement sur 14j → consistencyScore=70
    // Pas de sets récents dans les 7 derniers jours → recovery=100, fatigue ratio≈0 → 90
    // Score ≈ 100*0.4 + 90*0.35 + 70*0.25 = 40 + 31.5 + 17.5 = 89
    const histories = Array.from({ length: 4 }, (_, i) => makeHistory(i + 8))
    const result = computeReadiness([], [], histories)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.level).toBe('optimal')
  })

  it('composants recovery, fatigue et consistency dans [0, 100]', () => {
    const exercises = [makeExercise('e1', ['Pecs'])]
    const sets = Array.from({ length: 10 }, (_, i) => makeSet(i, 'e1'))
    const histories = Array.from({ length: 10 }, (_, i) => makeHistory(i))
    const result = computeReadiness(sets, exercises, histories)

    expect(result.components.recovery).toBeGreaterThanOrEqual(0)
    expect(result.components.recovery).toBeLessThanOrEqual(100)
    expect(result.components.fatigue).toBeGreaterThanOrEqual(0)
    expect(result.components.fatigue).toBeLessThanOrEqual(100)
    expect(result.components.consistency).toBeGreaterThanOrEqual(0)
    expect(result.components.consistency).toBeLessThanOrEqual(100)
  })

  it('score arrondi à l\'entier', () => {
    const result = computeReadiness([], [], [])
    expect(result.score).toBe(Math.round(result.score))
  })

  it('retourne une recommendation avec clé i18n', () => {
    const result = computeReadiness([], [], [])
    expect(result.recommendation).toMatch(/^home\.readiness\.recommendations\./)
  })

  it('score plus bas avec entraînement intensif récent', () => {
    const exercises = [makeExercise('e1', ['Pecs', 'Dos', 'Quadriceps'])]
    // Beaucoup de sets récents → fatigue élevée, recovery basse
    const sets = Array.from({ length: 20 }, (_, i) => makeSet(i % 3, 'e1', 150, 12))
    const histories = Array.from({ length: 7 }, (_, i) => makeHistory(i))
    const resultHeavy = computeReadiness(sets, exercises, histories)

    const resultRest = computeReadiness([], [], [])

    expect(resultHeavy.score).toBeLessThan(resultRest.score)
  })
})
