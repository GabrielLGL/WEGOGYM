import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsConstellationScreenBase } from '../StatsConstellationScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
}))

const makeSet = (id: string, exerciseId: string, weight: number, reps: number, isPr: boolean, dateMs: number) =>
  ({
    id,
    weight,
    reps,
    isPr,
    exerciseId,
    history: { id: 'h1' },
    exercise: { id: exerciseId },
    createdAt: new Date(dateMs),
  }) as never

const makeExercise = (id: string, name: string) =>
  ({ id, name }) as never

describe('StatsConstellationScreenBase', () => {
  it('affiche empty state si moins de 3 PRs', () => {
    const sets = [
      makeSet('s1', 'e1', 100, 5, true, Date.now() - 1000),
      makeSet('s2', 'e1', 105, 3, true, Date.now()),
    ]
    const { getByText } = render(
      <StatsConstellationScreenBase sets={sets} exercises={[makeExercise('e1', 'Squat')]} />
    )
    expect(getByText('Pas encore d\'étoiles')).toBeTruthy()
  })

  it('affiche la constellation avec 3+ PRs', () => {
    const now = Date.now()
    const sets = [
      makeSet('s1', 'e1', 100, 5, true, now - 3000000),
      makeSet('s2', 'e2', 80, 8, true, now - 2000000),
      makeSet('s3', 'e1', 110, 3, true, now - 1000000),
      makeSet('s4', 'e3', 60, 10, true, now),
    ]
    const exercises = [
      makeExercise('e1', 'Squat barre'),
      makeExercise('e2', 'Développé couché'),
      makeExercise('e3', 'Curl biceps'),
    ]
    const { getByText } = render(
      <StatsConstellationScreenBase sets={sets} exercises={exercises} />
    )
    expect(getByText('Constellation')).toBeTruthy()
    expect(getByText('Étoiles les plus brillantes')).toBeTruthy()
  })

  it('ignore les sets non-PR', () => {
    const now = Date.now()
    const sets = [
      makeSet('s1', 'e1', 100, 5, false, now - 3000000),
      makeSet('s2', 'e1', 105, 5, false, now - 2000000),
      makeSet('s3', 'e1', 110, 5, false, now),
    ]
    const { getByText } = render(
      <StatsConstellationScreenBase sets={sets} exercises={[makeExercise('e1', 'Squat')]} />
    )
    expect(getByText('Pas encore d\'étoiles')).toBeTruthy()
  })
})
