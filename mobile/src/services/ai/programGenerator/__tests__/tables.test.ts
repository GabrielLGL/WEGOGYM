import {
  WEEKLY_VOLUME_TABLE,
  PARAMS_TABLE,
  SPLIT_BY_FREQUENCY,
  MUSCLES_BY_PATTERN,
  MUSCLE_TO_PATTERN,
  MAX_SETS_PER_MUSCLE_PER_SESSION,
  MAX_TOTAL_SETS_PER_SESSION,
  MIN_EFFECTIVE_SETS,
  DUMBBELL_ONLY_EQUIPMENT,
} from '../tables'

describe('WEEKLY_VOLUME_TABLE', () => {
  it('contient les 4 objectifs', () => {
    expect(Object.keys(WEEKLY_VOLUME_TABLE)).toEqual(
      expect.arrayContaining(['hypertrophy', 'strength', 'fat_loss', 'general_fitness'])
    )
  })

  it('chaque objectif contient 3 niveaux', () => {
    for (const goal of Object.keys(WEEKLY_VOLUME_TABLE) as (keyof typeof WEEKLY_VOLUME_TABLE)[]) {
      expect(Object.keys(WEEKLY_VOLUME_TABLE[goal])).toEqual(
        expect.arrayContaining(['beginner', 'intermediate', 'advanced'])
      )
    }
  })

  it('chaque entrée a min < optimal < max', () => {
    for (const goal of Object.keys(WEEKLY_VOLUME_TABLE) as (keyof typeof WEEKLY_VOLUME_TABLE)[]) {
      for (const level of Object.keys(WEEKLY_VOLUME_TABLE[goal]) as (keyof typeof WEEKLY_VOLUME_TABLE[typeof goal])[]) {
        const spec = WEEKLY_VOLUME_TABLE[goal][level]
        expect(spec.min).toBeLessThan(spec.optimal)
        expect(spec.optimal).toBeLessThan(spec.max)
      }
    }
  })

  it('hypertrophy advanced a le plus haut volume', () => {
    expect(WEEKLY_VOLUME_TABLE.hypertrophy.advanced.max).toBe(20)
  })
})

describe('PARAMS_TABLE', () => {
  it('contient les 4 objectifs', () => {
    expect(Object.keys(PARAMS_TABLE)).toEqual(
      expect.arrayContaining(['hypertrophy', 'strength', 'fat_loss', 'general_fitness'])
    )
  })

  it('strength a les reps les plus basses', () => {
    expect(PARAMS_TABLE.strength.repsMin).toBe(1)
    expect(PARAMS_TABLE.strength.repsMax).toBe(5)
  })

  it('tous les objectifs ont restCompound > restIsolation', () => {
    for (const goal of Object.keys(PARAMS_TABLE) as (keyof typeof PARAMS_TABLE)[]) {
      expect(PARAMS_TABLE[goal].restCompound).toBeGreaterThan(PARAMS_TABLE[goal].restIsolation)
    }
  })
})

describe('SPLIT_BY_FREQUENCY', () => {
  it('2 et 3 jours → full_body', () => {
    expect(SPLIT_BY_FREQUENCY[2]).toBe('full_body')
    expect(SPLIT_BY_FREQUENCY[3]).toBe('full_body')
  })

  it('4 jours → half_body', () => {
    expect(SPLIT_BY_FREQUENCY[4]).toBe('half_body')
  })

  it('5 et 6 jours → push_pull_legs', () => {
    expect(SPLIT_BY_FREQUENCY[5]).toBe('push_pull_legs')
    expect(SPLIT_BY_FREQUENCY[6]).toBe('push_pull_legs')
  })
})

describe('MUSCLES_BY_PATTERN', () => {
  it('push contient chest, shoulders, triceps', () => {
    expect(MUSCLES_BY_PATTERN.push).toEqual(['chest', 'shoulders', 'triceps'])
  })

  it('pull contient back, biceps, traps', () => {
    expect(MUSCLES_BY_PATTERN.pull).toEqual(['back', 'biceps', 'traps'])
  })

  it('legs contient quads, hamstrings, glutes, calves', () => {
    expect(MUSCLES_BY_PATTERN.legs).toEqual(['quads', 'hamstrings', 'glutes', 'calves'])
  })

  it('core contient uniquement core', () => {
    expect(MUSCLES_BY_PATTERN.core).toEqual(['core'])
  })
})

describe('MUSCLE_TO_PATTERN', () => {
  it('chaque muscle est associé à un pattern', () => {
    const allMuscles = Object.values(MUSCLES_BY_PATTERN).flat()
    for (const muscle of allMuscles) {
      expect(MUSCLE_TO_PATTERN[muscle]).toBeDefined()
    }
  })

  it('chest → push, back → pull, quads → legs', () => {
    expect(MUSCLE_TO_PATTERN.chest).toBe('push')
    expect(MUSCLE_TO_PATTERN.back).toBe('pull')
    expect(MUSCLE_TO_PATTERN.quads).toBe('legs')
    expect(MUSCLE_TO_PATTERN.core).toBe('core')
  })
})

describe('Constantes limites', () => {
  it('MAX_SETS_PER_MUSCLE_PER_SESSION est raisonnable', () => {
    expect(MAX_SETS_PER_MUSCLE_PER_SESSION).toBe(8)
  })

  it('MAX_TOTAL_SETS_PER_SESSION est raisonnable', () => {
    expect(MAX_TOTAL_SETS_PER_SESSION).toBe(25)
  })

  it('MIN_EFFECTIVE_SETS est inférieur au max', () => {
    expect(MIN_EFFECTIVE_SETS).toBeLessThan(MAX_SETS_PER_MUSCLE_PER_SESSION)
  })

  it('DUMBBELL_ONLY_EQUIPMENT contient dumbbell', () => {
    expect(DUMBBELL_ONLY_EQUIPMENT).toEqual(['dumbbell'])
  })
})
