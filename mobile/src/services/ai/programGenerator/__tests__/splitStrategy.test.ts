import { determineSplit, buildWeeklySchedule } from '../splitStrategy'
import { MAX_TOTAL_SETS_PER_SESSION } from '../tables'
import { calcWeeklyVolumeByMuscle, distributeVolumeToSessions } from '../volumeCalculator'
import type { UserProfile } from '../types'

const baseProfile: UserProfile = {
  goal: 'hypertrophy',
  level: 'beginner',
  daysPerWeek: 3,
  minutesPerSession: 60,
  equipment: ['barbell', 'dumbbell'],
  injuries: [],
  posturalIssues: false,
}

describe('determineSplit', () => {
  it('débutant + daysPerWeek ≤ 4 → full_body', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'hypertrophy', level: 'beginner', daysPerWeek: 4 }
    expect(determineSplit(profile)).toBe('full_body')
  })

  it('strength + advanced + daysPerWeek ≥ 4 → split', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'strength', level: 'advanced', daysPerWeek: 4 }
    expect(determineSplit(profile)).toBe('split')
  })

  it('strength + intermediate + daysPerWeek ≥ 5 → push_pull_legs', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'strength', level: 'intermediate', daysPerWeek: 5 }
    expect(determineSplit(profile)).toBe('push_pull_legs')
  })

  it('intermediate + daysPerWeek = 4 → half_body', () => {
    const profile: UserProfile = { ...baseProfile, goal: 'fat_loss', level: 'intermediate', daysPerWeek: 4 }
    expect(determineSplit(profile)).toBe('half_body')
  })

  it('default beginner 3j → full_body', () => {
    const profile: UserProfile = { ...baseProfile, level: 'beginner', daysPerWeek: 3 }
    expect(determineSplit(profile)).toBe('full_body')
  })
})

describe('buildWeeklySchedule', () => {
  it('push_pull_legs 6j → 6 entrées alternant push/pull/legs', () => {
    const schedule = buildWeeklySchedule('push_pull_legs', 6)
    expect(schedule).toHaveLength(6)
    // PPL pattern: 0=push, 1=pull, 2=legs, 3=push, 4=pull, 5=legs
    expect(schedule[0]).toContain('chest')    // push
    expect(schedule[1]).toContain('back')     // pull
    expect(schedule[2]).toContain('quads')    // legs
    expect(schedule[3]).toContain('chest')    // push again
    expect(schedule[4]).toContain('back')     // pull again
    expect(schedule[5]).toContain('quads')    // legs again
  })

  it('full_body 3j → 3 séances avec tous les muscles', () => {
    const schedule = buildWeeklySchedule('full_body', 3)
    expect(schedule).toHaveLength(3)
    schedule.forEach((day) => {
      expect(day).toContain('chest')
      expect(day).toContain('back')
      expect(day).toContain('quads')
    })
  })

  it('half_body 4j → alternance haut/bas du corps', () => {
    const schedule = buildWeeklySchedule('half_body', 4)
    expect(schedule).toHaveLength(4)
    expect(schedule[0]).toContain('chest')    // push + core
    expect(schedule[1]).toContain('back')     // pull + legs
    expect(schedule[0]).not.toContain('quads')
    expect(schedule[1]).not.toContain('chest')
  })
})

describe('calcWeeklyVolumeByMuscle', () => {
  it('retourne un volume pour chaque muscle', () => {
    const volume = calcWeeklyVolumeByMuscle(baseProfile)
    const muscles = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'traps']
    muscles.forEach((m) => {
      expect(typeof volume[m as keyof typeof volume]).toBe('number')
    })
  })

  it('séance courte (<45min) → isolation muscles = 0', () => {
    const profile: UserProfile = { ...baseProfile, minutesPerSession: 40 }
    const volume = calcWeeklyVolumeByMuscle(profile)
    expect(volume.core).toBe(0)
    expect(volume.calves).toBe(0)
    expect(volume.traps).toBe(0)
  })

  it('posturalIssues → boost chaîne postérieure', () => {
    const profileNormal = calcWeeklyVolumeByMuscle(baseProfile)
    const profilePostural = calcWeeklyVolumeByMuscle({ ...baseProfile, posturalIssues: true })
    expect(profilePostural.back).toBeGreaterThan(profileNormal.back)
    expect(profilePostural.glutes).toBeGreaterThan(profileNormal.glutes)
  })
})

describe('distributeVolumeToSessions', () => {
  it('chaque séance ≤ MAX_TOTAL_SETS_PER_SESSION', () => {
    const profile: UserProfile = { ...baseProfile, level: 'advanced', daysPerWeek: 6 }
    const volume = calcWeeklyVolumeByMuscle(profile)
    const schedule = buildWeeklySchedule('push_pull_legs', 6)
    const sessions = distributeVolumeToSessions(volume, schedule)
    sessions.forEach((session) => {
      const total = Object.values(session).reduce((a, b) => a + b, 0)
      expect(total).toBeLessThanOrEqual(MAX_TOTAL_SETS_PER_SESSION)
    })
  })

  it('retourne autant de séances que le schedule', () => {
    const volume = calcWeeklyVolumeByMuscle(baseProfile)
    const schedule = buildWeeklySchedule('full_body', 3)
    const sessions = distributeVolumeToSessions(volume, schedule)
    expect(sessions).toHaveLength(3)
  })
})
