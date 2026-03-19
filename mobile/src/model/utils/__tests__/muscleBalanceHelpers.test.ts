import { computeMuscleBalance } from '../muscleBalanceHelpers'
import { mockSet, mockExercise } from './testFactories'

function makeSet_(exerciseId: string, weight: number, reps: number, daysAgo = 0) {
  return mockSet({
    exerciseId,
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  })
}

function makeExercise_(id: string, muscles: string[]) {
  return mockExercise({ id, muscles })
}

describe('computeMuscleBalance', () => {
  it('retourne des pairs vides (volumes à 0) si aucun set', () => {
    const result = computeMuscleBalance([], [], null)
    expect(result.pairs.length).toBe(4) // 4 paires définies
    for (const p of result.pairs) {
      expect(p.leftVolume).toBe(0)
      expect(p.rightVolume).toBe(0)
    }
  })

  it('génère 4 paires musculaires', () => {
    const result = computeMuscleBalance([], [], null)
    expect(result.pairs.length).toBe(4)
    const nameKeys = result.pairs.map(p => p.nameKey)
    expect(nameKeys).toContain('pushPull')
    expect(nameKeys).toContain('quadsHams')
    expect(nameKeys).toContain('bicepsTriceps')
    expect(nameKeys).toContain('upperLower')
  })

  it('ratio 1.0 et status balanced quand volumes égaux', () => {
    // Push (Pecs) et Pull (Dos) avec même volume
    const exercises = [makeExercise_('e1', ['Pecs']), makeExercise_('e2', ['Dos'])]
    const sets = [makeSet_('e1', 100, 10), makeSet_('e2', 100, 10)]
    const result = computeMuscleBalance(sets, exercises, null)
    const pushPull = result.pairs.find(p => p.nameKey === 'pushPull')!
    expect(pushPull.ratio).toBe(1)
    expect(pushPull.status).toBe('balanced')
  })

  it('ratio > 1.5 retourne imbalanced', () => {
    // Beaucoup de push, pas de pull
    const exercises = [makeExercise_('e1', ['Pecs']), makeExercise_('e2', ['Dos'])]
    const sets = [
      makeSet_('e1', 100, 10), // 1000 push
      makeSet_('e1', 100, 10), // 1000 push
      makeSet_('e1', 100, 10), // 1000 push
      // Pas de pull → ratio = 3000/0 → 2 (capped)
    ]
    const result = computeMuscleBalance(sets, exercises, null)
    const pushPull = result.pairs.find(p => p.nameKey === 'pushPull')!
    expect(pushPull.status).toBe('imbalanced')
  })

  it('filtre par période', () => {
    const exercises = [makeExercise_('e1', ['Pecs'])]
    const sets = [
      makeSet_('e1', 100, 10, 5),   // 5 jours → dans la période
      makeSet_('e1', 100, 10, 60),  // 60 jours → hors période 30j
    ]
    const result30 = computeMuscleBalance(sets, exercises, 30)
    const resultAll = computeMuscleBalance(sets, exercises, null)
    const push30 = result30.pairs.find(p => p.nameKey === 'pushPull')!
    const pushAll = resultAll.pairs.find(p => p.nameKey === 'pushPull')!
    expect(push30.leftVolume).toBeLessThan(pushAll.leftVolume)
  })

  it('overallBalance dans [0, 100]', () => {
    const exercises = [makeExercise_('e1', ['Pecs']), makeExercise_('e2', ['Dos'])]
    const sets = [makeSet_('e1', 100, 10), makeSet_('e2', 80, 10)]
    const result = computeMuscleBalance(sets, exercises, null)
    expect(result.overallBalance).toBeGreaterThanOrEqual(0)
    expect(result.overallBalance).toBeLessThanOrEqual(100)
  })

  it('overallBalance élevé quand tout est équilibré', () => {
    // Volumes identiques pour push et pull
    const exercises = [makeExercise_('e1', ['Pecs']), makeExercise_('e2', ['Dos'])]
    const sets = [makeSet_('e1', 100, 10), makeSet_('e2', 100, 10)]
    const result = computeMuscleBalance(sets, exercises, null)
    expect(result.overallBalance).toBeGreaterThanOrEqual(70)
  })
})
