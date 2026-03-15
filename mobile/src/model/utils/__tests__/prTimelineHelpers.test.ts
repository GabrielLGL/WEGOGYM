import { buildPRTimeline } from '../prTimelineHelpers'

const makeSet = (
  id: string,
  exerciseId: string,
  weight: number,
  reps: number,
  isPr: boolean,
  createdAt: Date,
) => ({ id, exerciseId, weight, reps, isPr, createdAt })

const exercises = [
  { id: 'e1', name: 'Développé couché' },
  { id: 'e2', name: 'Squat' },
]

describe('buildPRTimeline', () => {
  it('retourne un tableau vide si aucun set', () => {
    expect(buildPRTimeline([], exercises)).toEqual([])
  })

  it('ignore les sets non-PR', () => {
    const sets = [makeSet('s1', 'e1', 80, 5, false, new Date('2026-03-01'))]
    expect(buildPRTimeline(sets, exercises)).toEqual([])
  })

  it('retourne un mois avec un seul PR', () => {
    const sets = [makeSet('s1', 'e1', 100, 3, true, new Date('2026-03-10'))]
    const result = buildPRTimeline(sets, exercises)
    expect(result).toHaveLength(1)
    expect(result[0].totalPRs).toBe(1)
    expect(result[0].entries[0].exerciseName).toBe('Développé couché')
    expect(result[0].entries[0].previousPR).toBeNull()
    expect(result[0].entries[0].gain).toBeNull()
  })

  it('calcule le gain correct entre deux PRs du même exercice', () => {
    const sets = [
      makeSet('s1', 'e1', 80, 5, true, new Date('2026-02-01')),
      makeSet('s2', 'e1', 90, 3, true, new Date('2026-03-15')),
    ]
    const result = buildPRTimeline(sets, exercises)
    // Tri décroissant : mars en premier
    const marchEntry = result[0].entries[0]
    expect(marchEntry.weight).toBe(90)
    expect(marchEntry.previousPR).toBe(80)
    expect(marchEntry.gain).toBeCloseTo(10)
    expect(marchEntry.gainPercent).toBeCloseTo(12.5, 1)
  })

  it('groupe correctement par mois', () => {
    const sets = [
      makeSet('s1', 'e1', 80, 5, true, new Date('2026-01-10')),
      makeSet('s2', 'e2', 100, 3, true, new Date('2026-01-20')),
      makeSet('s3', 'e1', 90, 3, true, new Date('2026-02-15')),
    ]
    const result = buildPRTimeline(sets, exercises)
    expect(result).toHaveLength(2)
    // Février en premier (décroissant)
    expect(result[0].year).toBe(2026)
    expect(result[0].monthIndex).toBe(1)
    expect(result[0].totalPRs).toBe(1)
    expect(result[1].monthIndex).toBe(0)
    expect(result[1].totalPRs).toBe(2)
  })

  it('ne calcule pas de gain inter-exercices', () => {
    const sets = [
      makeSet('s1', 'e1', 80, 5, true, new Date('2026-02-01')),
      makeSet('s2', 'e2', 60, 5, true, new Date('2026-03-01')),
    ]
    const result = buildPRTimeline(sets, exercises)
    const squat = result[0].entries.find(e => e.exerciseId === 'e2')
    // Squat est un premier PR, pas de gain depuis Développé couché
    expect(squat?.previousPR).toBeNull()
    expect(squat?.gain).toBeNull()
  })
})
