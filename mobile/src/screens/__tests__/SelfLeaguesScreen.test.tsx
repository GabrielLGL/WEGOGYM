import React from 'react'
import { render } from '@testing-library/react-native'
import { SelfLeaguesScreenBase } from '../SelfLeaguesScreen'

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

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(daysAgo: number) {
  const startTime = new Date(Date.now() - daysAgo * DAY_MS)
  const endTime = new Date(startTime.getTime() + 3600000)
  return {
    id: `h-${daysAgo}`,
    startTime,
    endTime,
    deletedAt: null,
    isAbandoned: false,
  } as never
}

function makeSet(historyId: string, weight = 100, reps = 10, isPr = false) {
  return {
    history: { id: historyId },
    weight,
    reps,
    isPr,
    createdAt: new Date(),
  } as never
}

describe('SelfLeaguesScreenBase', () => {
  it('rend l\'empty state si aucune donnée', () => {
    const { toJSON } = render(
      <SelfLeaguesScreenBase histories={[]} sets={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('rend l\'empty state avec une seule période (< 2 nécessaires)', () => {
    const h1 = makeHistory(1)
    const s1 = makeSet('h-1', 80, 10)
    const { toJSON } = render(
      <SelfLeaguesScreenBase histories={[h1]} sets={[s1]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche le classement avec plusieurs semaines de données', () => {
    const h1 = makeHistory(1)
    const h2 = makeHistory(8)
    const s1 = makeSet('h-1', 100, 10)
    const s2 = makeSet('h-8', 80, 10)
    const { toJSON } = render(
      <SelfLeaguesScreenBase histories={[h1, h2]} sets={[s1, s2]} />,
    )
    expect(toJSON()).toBeTruthy()
  })
})
