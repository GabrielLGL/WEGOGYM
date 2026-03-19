import React from 'react'
import { render } from '@testing-library/react-native'
import { ActivityFeedScreenBase } from '../ActivityFeedScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}))

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(id: string, daysAgo: number, overrides: Record<string, unknown> = {}) {
  const startTime = new Date(Date.now() - daysAgo * DAY_MS)
  const endTime = new Date(startTime.getTime() + 3600000)
  return {
    id,
    startTime,
    endTime,
    deletedAt: null,
    isAbandoned: false,
    session: { id: 's1' },
    ...overrides,
  } as never
}

function makeSession(id: string, name: string) {
  return { id, name } as never
}

function makeExercise(id: string, name: string, muscles: string[] = []) {
  return { id, name, muscles } as never
}

function makeSet(historyId: string, exerciseId: string, weight = 100, reps = 10, isPr = false) {
  return {
    history: { id: historyId },
    exercise: { id: exerciseId },
    weight,
    reps,
    isPr,
  } as never
}

describe('ActivityFeedScreenBase', () => {
  it('affiche l\'empty state si aucune séance', () => {
    const { toJSON } = render(
      <ActivityFeedScreenBase histories={[]} sessions={[]} sets={[]} exercises={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche un feed avec des séances', () => {
    const histories = [makeHistory('h1', 1)]
    const sessions = [makeSession('s1', 'Push Day')]
    const exercises = [makeExercise('e1', 'Bench Press', ['Pecs'])]
    const sets = [
      makeSet('h1', 'e1', 100, 10, false),
      makeSet('h1', 'e1', 100, 8, true),
    ]
    const { getByText } = render(
      <ActivityFeedScreenBase
        histories={histories}
        sessions={sessions}
        sets={sets}
        exercises={exercises}
      />,
    )
    expect(getByText('Push Day')).toBeTruthy()
    expect(getByText('Bench Press')).toBeTruthy()
  })

  it('affiche le badge PR quand une séance contient des PRs', () => {
    const histories = [makeHistory('h1', 0)]
    const sessions = [makeSession('s1', 'Legs')]
    const exercises = [makeExercise('e1', 'Squat', ['Quadriceps'])]
    const sets = [makeSet('h1', 'e1', 150, 5, true)]
    const { getByText } = render(
      <ActivityFeedScreenBase
        histories={histories}
        sessions={sessions}
        sets={sets}
        exercises={exercises}
      />,
    )
    expect(getByText('Legs')).toBeTruthy()
  })
})
