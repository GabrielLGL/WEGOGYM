import {
  matchExercise,
  computeStrengthStandards,
  STRENGTH_BENCHMARKS,
  LEVEL_ORDER,
} from '../strengthStandardsHelpers'

describe('matchExercise', () => {
  const exercises = [
    { id: '1', name: 'Développé couché barre' },
    { id: '2', name: 'Squat barre' },
    { id: '3', name: 'Soulevé de terre' },
    { id: '4', name: 'Développé militaire' },
    { id: '5', name: 'Curl biceps' },
  ]

  it('trouve un exercice via pattern case-insensitive', () => {
    const bench = STRENGTH_BENCHMARKS.find(b => b.exerciseName === 'Développé couché')!
    expect(matchExercise(bench, exercises)).toBe('1')
  })

  it('trouve squat via pattern', () => {
    const squat = STRENGTH_BENCHMARKS.find(b => b.exerciseName === 'Squat')!
    expect(matchExercise(squat, exercises)).toBe('2')
  })

  it('retourne null si aucun match', () => {
    const rowing = STRENGTH_BENCHMARKS.find(b => b.exerciseName === 'Rowing barre')!
    expect(matchExercise(rowing, exercises)).toBeNull()
  })
})

describe('computeStrengthStandards', () => {
  const exercises = [
    { id: 'ex1', name: 'Développé couché barre' },
    { id: 'ex2', name: 'Squat barre' },
  ]

  it('retourne null estimated1RM si aucun set pour cet exercice', () => {
    const results = computeStrengthStandards(exercises, [], 80)
    const bench = results.find(r => r.exerciseName === 'Développé couché')!
    expect(bench.matchedExerciseId).toBe('ex1')
    expect(bench.estimated1RM).toBeNull()
    expect(bench.level).toBeNull()
  })

  it('calcule le 1RM Epley correctement (100kg×5 reps = 116.67kg)', () => {
    const sets = [{ weight: 100, reps: 5, exerciseId: 'ex1' }]
    const results = computeStrengthStandards(exercises, sets, null)
    const bench = results.find(r => r.exerciseName === 'Développé couché')!
    // 100 * (1 + 5/30) = 116.666... → arrondi à 116.7
    expect(bench.estimated1RM).toBeCloseTo(116.7, 0)
    expect(bench.bodyweightRatio).toBeNull() // pas de poids corporel
    expect(bench.level).toBeNull()
  })

  it('détermine le niveau "intermediate" avec ratio 1.0× pour bench', () => {
    // 80kg bodyweight, bench 1RM = 80kg → ratio = 1.0 → intermediate
    const sets = [{ weight: 76, reps: 2, exerciseId: 'ex1' }]
    // 76 * (1 + 2/30) = 76 * 1.0666 = 81.07 → ratio = 81.07/80 = 1.01 → intermediate
    const results = computeStrengthStandards(exercises, sets, 80)
    const bench = results.find(r => r.exerciseName === 'Développé couché')!
    expect(bench.level).toBe('intermediate')
    expect(bench.nextLevelThreshold).toBeCloseTo(80 * 1.25, 1) // advanced threshold
  })

  it('détermine le niveau "elite" quand ratio >= seuil elite', () => {
    // squat elite = 2.25×, bodyweight 80 → need 180kg
    const sets = [{ weight: 183, reps: 1, exerciseId: 'ex2' }]
    // 183 * (1 + 1/30) = 183 * 1.0333 = 189.1 → ratio = 189.1/80 = 2.36 >= 2.25
    const results = computeStrengthStandards(exercises, sets, 80)
    const squat = results.find(r => r.exerciseName === 'Squat')!
    expect(squat.level).toBe('elite')
    expect(squat.nextLevelThreshold).toBeNull() // déjà au max
  })

  it('prend le 1RM max si plusieurs sets', () => {
    const sets = [
      { weight: 60, reps: 5, exerciseId: 'ex1' },
      { weight: 80, reps: 3, exerciseId: 'ex1' },
      { weight: 70, reps: 8, exerciseId: 'ex1' },
    ]
    const results = computeStrengthStandards(exercises, sets, 80)
    const bench = results.find(r => r.exerciseName === 'Développé couché')!
    // 80*(1+3/30)=88, 70*(1+8/30)=88.67, 60*(1+5/30)=70 → max = 88.67
    expect(bench.estimated1RM).toBeGreaterThan(88)
  })

  it('exercice non matchié → matchedExerciseId null', () => {
    const results = computeStrengthStandards(exercises, [], 80)
    const military = results.find(r => r.exerciseName === 'Développé militaire')!
    expect(military.matchedExerciseId).toBeNull()
    expect(military.estimated1RM).toBeNull()
  })

  it('LEVEL_ORDER contient les 5 niveaux dans le bon ordre', () => {
    expect(LEVEL_ORDER).toEqual(['beginner', 'novice', 'intermediate', 'advanced', 'elite'])
  })
})
