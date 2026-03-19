import { computeSessionIntensity } from '../sessionIntensityHelpers'

const colors = {
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  danger: '#FF3B30',
  amber: '#F59E0B',
}

describe('computeSessionIntensity', () => {
  it('retourne score 0 et label light pour une séance vide', () => {
    const result = computeSessionIntensity(0, 0, [], colors)
    expect(result.score).toBe(0)
    expect(result.label).toBe('light')
    expect(result.color).toBe(colors.textSecondary)
  })

  it('calcule volumeScore correctement — clamped à 0 si < 500 kg', () => {
    const result = computeSessionIntensity(400, 0, [], colors)
    expect(result.breakdown.volumeScore).toBe(0)
  })

  it('calcule volumeScore correctement — clamped à 33 si > 10000 kg', () => {
    const result = computeSessionIntensity(15000, 0, [], colors)
    expect(result.breakdown.volumeScore).toBe(33)
  })

  it('calcule volumeScore linéaire entre 500 et 10000 kg', () => {
    const mid = 5250  // (500 + 10000) / 2 → (4750/9500)*33 = 16.5 → arrondi à 17
    const result = computeSessionIntensity(mid, 0, [], colors)
    expect(result.breakdown.volumeScore).toBe(17)
  })

  it('calcule prScore : 0 PR → 0, 1 PR → 11, 2 PRs → 22, 3+ PRs → 33', () => {
    expect(computeSessionIntensity(0, 0, [], colors).breakdown.prScore).toBe(0)
    expect(computeSessionIntensity(0, 1, [], colors).breakdown.prScore).toBe(11)
    expect(computeSessionIntensity(0, 2, [], colors).breakdown.prScore).toBe(22)
    expect(computeSessionIntensity(0, 5, [], colors).breakdown.prScore).toBe(33)
  })

  it('calcule effortScore : tous les sets à ≥ 80 % du max → score = 34', () => {
    const exercises = [
      { sets: [{ weight: 80, reps: 5 }, { weight: 90, reps: 5 }], prevMaxWeight: 100 },
    ]
    const result = computeSessionIntensity(0, 0, exercises, colors)
    expect(result.breakdown.effortScore).toBe(34)
  })

  it('calcule effortScore : aucun set à ≥ 80 % du max → score = 0', () => {
    const exercises = [
      { sets: [{ weight: 40, reps: 5 }], prevMaxWeight: 100 },
    ]
    const result = computeSessionIntensity(0, 0, exercises, colors)
    expect(result.breakdown.effortScore).toBe(0)
  })

  it('effortScore ignore les exercices sans historique (prevMaxWeight = 0)', () => {
    const exercises = [
      { sets: [{ weight: 80, reps: 5 }], prevMaxWeight: 0 },
    ]
    const result = computeSessionIntensity(0, 0, exercises, colors)
    expect(result.breakdown.effortScore).toBe(0)
  })

  it('retourne le bon label selon le score', () => {
    // light : score < 30 → volume 0, 0 PR, pas d'effort
    expect(computeSessionIntensity(0, 0, [], colors).label).toBe('light')
    // moderate : score 30-54 → 3 PRs (33) = 33 → moderate
    expect(computeSessionIntensity(0, 3, [], colors).label).toBe('moderate')
    // intense : score 55-79 → 3 PRs (33) + volume 7000 (≈23) = 56 → intense
    expect(computeSessionIntensity(7000, 3, [], colors).label).toBe('intense')
  })

  it('retourne la bonne couleur pour chaque niveau', () => {
    const light = computeSessionIntensity(0, 0, [], colors)
    expect(light.color).toBe(colors.textSecondary)

    // moderate : 3 PRs (33) = score 33
    const moderate = computeSessionIntensity(0, 3, [], colors)
    expect(moderate.label).toBe('moderate')
    expect(moderate.color).toBe(colors.primary)

    // intense : 3 PRs (33) + volume 7000 (≈23) = 56
    const intense = computeSessionIntensity(7000, 3, [], colors)
    expect(intense.label).toBe('intense')
    expect(intense.color).toBe('#F59E0B')
  })

  it('le score est toujours clamped à 100 maximum', () => {
    const exercises = [
      { sets: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }], prevMaxWeight: 100 },
    ]
    const result = computeSessionIntensity(15000, 5, exercises, colors)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.label).toBe('extreme')
    expect(result.color).toBe(colors.danger)
  })
})
