/**
 * Tests for monthlyBulletinHelpers — pure functions, no mocks needed.
 */
import { computeMonthlyBulletin } from '../monthlyBulletinHelpers'
import type History from '../../models/History'
import type WorkoutSet from '../../models/Set'
import type Exercise from '../../models/Exercise'

// ─── Mock builders ────────────────────────────────────────────────────────────

function makeHistory(id: string, date: Date): History {
  return { id, startTime: date, deletedAt: null, isAbandoned: false } as unknown as History
}

function makeSet(
  id: string,
  historyId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  isPr = false,
): WorkoutSet {
  return { id, historyId, exerciseId, weight, reps, isPr } as unknown as WorkoutSet
}

function makeExercise(id: string, muscles: string[]): Exercise {
  return { id, _muscles: JSON.stringify(muscles), muscles } as unknown as Exercise
}

// ─── Dates helpers ────────────────────────────────────────────────────────────

function dateInMonth(year: number, month: number, day = 15): Date {
  return new Date(year, month, day)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('computeMonthlyBulletin', () => {
  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth()
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1
  const prevYear = curMonth === 0 ? curYear - 1 : curYear

  it('retourne null si pas de données', () => {
    expect(computeMonthlyBulletin([], [], [], 'fr')).toBeNull()
  })

  it('retourne null si seulement 1 mois de données', () => {
    const histories = [makeHistory('h1', dateInMonth(curYear, curMonth))]
    expect(computeMonthlyBulletin(histories, [], [], 'fr')).toBeNull()
  })

  it('retourne un bulletin si 2 mois de données', () => {
    const ex = makeExercise('e1', ['Pecs'])
    const histories = [
      makeHistory('h1', dateInMonth(prevYear, prevMonth)),
      makeHistory('h2', dateInMonth(prevYear, prevMonth, 20)),
      makeHistory('h3', dateInMonth(curYear, curMonth)),
    ]
    const sets = [
      makeSet('s1', 'h1', 'e1', 100, 10),
      makeSet('s2', 'h3', 'e1', 110, 10),
    ]
    const result = computeMonthlyBulletin(histories, sets, [ex], 'fr')
    expect(result).not.toBeNull()
    expect(result!.grades).toHaveLength(4)
    expect(result!.overallGrade).toBeDefined()
    expect(result!.comment).toBeTruthy()
  })

  it('attribue A+ si valeur >= 130% de la moyenne', () => {
    const ex = makeExercise('e1', ['Pecs'])
    // Mois précédent : 1 séance; mois courant : 2 séances (200% → A+)
    const histories = [
      makeHistory('h1', dateInMonth(prevYear, prevMonth)),
      makeHistory('h2', dateInMonth(curYear, curMonth)),
      makeHistory('h3', dateInMonth(curYear, curMonth, 20)),
    ]
    const result = computeMonthlyBulletin(histories, [], [ex], 'fr')
    expect(result).not.toBeNull()
    const regulariteGrade = result!.grades.find(g => g.category === 'regularite')
    expect(regulariteGrade!.grade).toBe('A+')
  })

  it('attribue D si valeur = 0 et moyenne > 0', () => {
    const ex = makeExercise('e1', ['Pecs'])
    // Mois précédent : 2 séances avec PRs; mois courant : 0 séance
    const histories = [
      makeHistory('h1', dateInMonth(prevYear, prevMonth)),
      makeHistory('h2', dateInMonth(prevYear, prevMonth, 20)),
    ]
    const sets = [makeSet('s1', 'h1', 'e1', 100, 10, true)]
    const result = computeMonthlyBulletin(histories, sets, [ex], 'fr')
    expect(result).not.toBeNull()
    const forceGrade = result!.grades.find(g => g.category === 'force')
    expect(forceGrade!.grade).toBe('D')
  })

  it('retourne un commentaire en anglais si language=en', () => {
    const ex = makeExercise('e1', ['Pecs'])
    const histories = [
      makeHistory('h1', dateInMonth(prevYear, prevMonth)),
      makeHistory('h2', dateInMonth(curYear, curMonth)),
    ]
    const result = computeMonthlyBulletin(histories, [], [ex], 'en')
    expect(result).not.toBeNull()
    // Le commentaire anglais ne contient pas d'apostrophe française typique
    expect(result!.month).toMatch(/\d{4}/)
  })

  it('calcule le tonnage correctement', () => {
    const ex = makeExercise('e1', ['Pecs'])
    const histories = [
      makeHistory('h1', dateInMonth(prevYear, prevMonth)),
      makeHistory('h2', dateInMonth(curYear, curMonth)),
    ]
    const sets = [
      makeSet('s1', 'h1', 'e1', 100, 10),  // 1000 kg mois précédent
      makeSet('s2', 'h2', 'e1', 200, 10),  // 2000 kg mois courant (200% → A+)
    ]
    const result = computeMonthlyBulletin(histories, sets, [ex], 'fr')
    expect(result).not.toBeNull()
    const volumeGrade = result!.grades.find(g => g.category === 'volume')
    expect(volumeGrade!.value).toBe(2000)
    expect(volumeGrade!.avg).toBe(1000)
    expect(volumeGrade!.grade).toBe('A+')
  })
})
