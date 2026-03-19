import React from 'react'
import { render } from '@testing-library/react-native'
import { TitlesScreenBase } from '../TitlesScreen'

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
    bestStreak: 0,
    totalPrs: 0,
    totalTonnage: 0,
    level: 1,
    ...overrides,
  } as never
}

describe('TitlesScreenBase', () => {
  it('rend sans crash si user null', () => {
    const { toJSON } = render(
      <TitlesScreenBase user={null} histories={[]} sets={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche la liste des titres avec un user débutant', () => {
    const { toJSON } = render(
      <TitlesScreenBase user={makeUser()} histories={[]} sets={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche des titres débloqués avec un user avancé', () => {
    const user = makeUser({
      bestStreak: 15,
      totalPrs: 60,
      totalTonnage: 200000,
      level: 30,
    })
    const histories = Array.from({ length: 55 }, (_, i) => ({
      id: `h-${i}`,
    })) as never[]
    const sets = Array.from({ length: 10 }, (_, i) => ({
      exerciseId: `e-${i % 5}`,
    })) as never[]
    const { toJSON } = render(
      <TitlesScreenBase user={user} histories={histories} sets={sets} />,
    )
    expect(toJSON()).toBeTruthy()
  })
})
