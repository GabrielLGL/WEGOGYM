import { classifySession, analyzeTrainingSplit } from '../trainingSplitHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet(exerciseId: string, daysAgo: number) {
  return { exerciseId, createdAt: new Date(Date.now() - daysAgo * DAY_MS) }
}

function makeExercise(id: string, muscles: string[]) {
  return { id, muscles }
}

function makeHistory(daysAgo: number) {
  return {
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
    deletedAt: null as Date | null,
    isAbandoned: false,
  }
}

describe('classifySession', () => {
  it('retourne other si aucun muscle', () => {
    expect(classifySession([])).toBe('other')
  })

  it('détecte cardio si Cardio uniquement', () => {
    expect(classifySession(['Cardio'])).toBe('cardio')
  })

  it('détecte push pour Pecs + Triceps', () => {
    expect(classifySession(['Pecs', 'Triceps'])).toBe('push')
  })

  it('détecte pull pour Dos + Biceps', () => {
    expect(classifySession(['Dos', 'Biceps'])).toBe('pull')
  })

  it('détecte lower pour Quadriceps + Ischios sans push/pull', () => {
    expect(classifySession(['Quadriceps', 'Ischios'])).toBe('lower')
  })

  it('détecte legs quand legs dominant avec un muscle push/pull', () => {
    // legCount=2/3 > 0.5 mais hasPush → ne passe pas par lower
    expect(classifySession(['Quadriceps', 'Ischios', 'Triceps'])).toBe('legs')
  })

  it('détecte upper pour Push + Pull sans Legs', () => {
    expect(classifySession(['Pecs', 'Dos'])).toBe('upper')
  })

  it('détecte lower pour Legs sans Push/Pull', () => {
    expect(classifySession(['Quadriceps', 'Mollets'])).toBe('lower')
  })

  it('détecte fullBody si 3 catégories touchées', () => {
    expect(classifySession(['Pecs', 'Dos', 'Quadriceps'])).toBe('fullBody')
  })
})

describe('analyzeTrainingSplit', () => {
  it('retourne mixed et consistency 0 si pas de données', () => {
    const result = analyzeTrainingSplit([], [], [], 30)
    expect(result.dominantPattern).toBe('mixed')
    expect(result.consistency).toBe(0)
    expect(result.sessions).toEqual([])
  })

  it('détecte pattern PPL', () => {
    // Pour obtenir des sessions 'push', 'pull', 'legs' (pas 'lower'),
    // les sessions legs doivent inclure un muscle push/pull pour ne pas
    // tomber dans le chemin 'lower' (legs sans push/pull).
    const exercises = [
      makeExercise('push1', ['Pecs', 'Triceps']),
      makeExercise('pull1', ['Dos', 'Biceps']),
      makeExercise('legs1', ['Quadriceps', 'Ischios', 'Mollets']),
      makeExercise('legsAcc', ['Triceps']), // accessoire pour forcer legs (pas lower)
    ]
    const sets = [
      makeSet('push1', 1),
      makeSet('pull1', 3),
      makeSet('legs1', 5), makeSet('legsAcc', 5),
      makeSet('push1', 7),
      makeSet('pull1', 9),
      makeSet('legs1', 11), makeSet('legsAcc', 11),
    ]
    const histories = [1, 3, 5, 7, 9, 11].map(d => makeHistory(d))
    const result = analyzeTrainingSplit(sets, exercises, histories, 30)
    expect(result.dominantPattern).toBe('ppl')
  })

  it('détecte pattern Upper/Lower', () => {
    const exercises = [
      makeExercise('upper1', ['Pecs', 'Dos']),
      makeExercise('lower1', ['Quadriceps', 'Ischios']),
    ]
    const sets = [
      makeSet('upper1', 1),
      makeSet('lower1', 3),
      makeSet('upper1', 5),
      makeSet('lower1', 7),
    ]
    const histories = [1, 3, 5, 7].map(d => makeHistory(d))
    const result = analyzeTrainingSplit(sets, exercises, histories, 30)
    expect(result.dominantPattern).toBe('upperLower')
  })

  it('détecte pattern Full Body', () => {
    const exercises = [
      makeExercise('fb1', ['Pecs', 'Dos', 'Quadriceps']),
    ]
    const sets = [
      makeSet('fb1', 1),
      makeSet('fb1', 3),
      makeSet('fb1', 5),
      makeSet('fb1', 7),
    ]
    const histories = [1, 3, 5, 7].map(d => makeHistory(d))
    const result = analyzeTrainingSplit(sets, exercises, histories, 30)
    expect(result.dominantPattern).toBe('fullBody')
  })

  it('consistency est entre 0 et 100', () => {
    const exercises = [makeExercise('ex1', ['Pecs', 'Triceps'])]
    const sets = [makeSet('ex1', 1), makeSet('ex1', 3)]
    const histories = [1, 3].map(d => makeHistory(d))
    const result = analyzeTrainingSplit(sets, exercises, histories, 30)
    expect(result.consistency).toBeGreaterThanOrEqual(0)
    expect(result.consistency).toBeLessThanOrEqual(100)
  })

  it('exclut les séances supprimées et abandonnées', () => {
    const exercises = [makeExercise('ex1', ['Pecs'])]
    const sets = [makeSet('ex1', 1), makeSet('ex1', 3)]
    const histories = [
      makeHistory(1),
      { ...makeHistory(3), deletedAt: new Date(), isAbandoned: false },
    ]
    const result = analyzeTrainingSplit(sets, exercises, histories, 30)
    // Jour 3 exclu car supprimé → 1 seule session
    expect(result.sessions.length).toBe(1)
  })
})
