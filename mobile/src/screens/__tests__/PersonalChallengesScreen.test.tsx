import React from 'react'
import { render } from '@testing-library/react-native'
import { PersonalChallengesBase } from '../PersonalChallengesScreen'

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

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    bestStreak: 0,
    totalTonnage: 0,
    totalPrs: 0,
    ...overrides,
  } as never
}

describe('PersonalChallengesBase', () => {
  it('rend sans crash si user null', () => {
    const { toJSON } = render(
      <PersonalChallengesBase user={null} histories={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche les challenges avec un user débutant', () => {
    const { toJSON } = render(
      <PersonalChallengesBase user={makeUser()} histories={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche la progression avec un user avancé', () => {
    const user = makeUser({
      totalXp: 5000,
      level: 15,
      currentStreak: 10,
      bestStreak: 20,
      totalTonnage: 100000,
      totalPrs: 30,
    })
    const histories = Array.from({ length: 40 }, (_, i) => ({
      id: `h-${i}`,
    })) as never[]
    const { toJSON } = render(
      <PersonalChallengesBase user={user} histories={histories} />,
    )
    expect(toJSON()).toBeTruthy()
  })
})
