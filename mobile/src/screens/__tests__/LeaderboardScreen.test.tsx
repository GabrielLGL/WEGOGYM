import React from 'react'
import { render } from '@testing-library/react-native'
import { LeaderboardScreenBase } from '../LeaderboardScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}))

jest.mock('../../hooks/useFriendManager', () => ({
  useFriendManager: () => ({
    importFriend: jest.fn().mockResolvedValue('success'),
    removeFriend: jest.fn().mockResolvedValue(undefined),
    isImporting: false,
  }),
}))

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    friendCode: 'KORE-TEST01',
    name: 'Moi',
    totalXp: 1000,
    level: 5,
    currentStreak: 3,
    totalTonnage: 50000,
    totalPrs: 10,
    bestStreak: 5,
    ...overrides,
  } as never
}

function makeFriend(overrides: Record<string, unknown> = {}) {
  return {
    id: 'f1',
    friendCode: 'KORE-AMI001',
    displayName: 'Ami1',
    totalXp: 800,
    level: 4,
    currentStreak: 2,
    totalTonnage: 40000,
    totalPrs: 8,
    totalSessions: 20,
    importedAt: Date.now() - 86400000,
    ...overrides,
  } as never
}

describe('LeaderboardScreenBase', () => {
  it('rend sans crash avec aucun ami', () => {
    const { getAllByText } = render(
      <LeaderboardScreenBase user={makeUser()} friends={[]} histories={[]} />,
    )
    // Le classement ne contient que l'utilisateur — "Moi" apparaît en nom + badge
    expect(getAllByText('Moi').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le classement avec des amis', () => {
    const { getByText, getAllByText } = render(
      <LeaderboardScreenBase
        user={makeUser()}
        friends={[makeFriend()]}
        histories={[]}
      />,
    )
    expect(getByText('Ami1')).toBeTruthy()
    expect(getAllByText('Moi').length).toBeGreaterThanOrEqual(1)
  })

  it('met en évidence l\'utilisateur courant', () => {
    const { getAllByText } = render(
      <LeaderboardScreenBase
        user={makeUser({ totalXp: 2000 })}
        friends={[makeFriend({ totalXp: 500 })]}
        histories={[]}
      />,
    )
    // Le badge "Moi" est affiché
    expect(getAllByText('Moi').length).toBeGreaterThanOrEqual(1)
  })
})
