import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsHexagonScreenBase } from '../StatsHexagonScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('../../hooks/useDeferredMount', () => ({
  useDeferredMount: () => true,
}))

jest.mock('../../components/HexagonStatsCard', () => {
  const { View, Text } = require('react-native')
  return function MockHexagonStatsCard({ axes }: { axes: Array<{ label: string }> }) {
    return (
      <View>
        {axes.map((a: { label: string }) => (
          <Text key={a.label}>{a.label}</Text>
        ))}
      </View>
    )
  }
})

const makeUser = (overrides = {}) =>
  ({
    id: 'u1',
    totalPrs: 10,
    totalTonnage: 50000,
    bestStreak: 5,
    ...overrides,
  }) as never

const makeHistory = (id: string) =>
  ({ id, startTime: new Date(), endTime: new Date(), deletedAt: null }) as never

const makeExercise = (id: string, muscles: string[]) =>
  ({ id, name: `Exercise ${id}`, muscles, _muscles: JSON.stringify(muscles) }) as never

const makeSet = (exerciseId: string) =>
  ({ exerciseId, weight: 100, reps: 10, createdAt: new Date() }) as never

describe('StatsHexagonScreenBase', () => {
  it('rend sans crash sans données', () => {
    const { getByText } = render(
      <StatsHexagonScreenBase user={null} histories={[]} sets={[]} exercises={[]} />
    )
    expect(getByText('Profil Athlète')).toBeTruthy()
  })

  it('affiche les 5 axes avec un user', () => {
    const user = makeUser()
    const histories = [makeHistory('h1')]
    const exercises = [makeExercise('e1', ['Pecs'])]
    const sets = [makeSet('e1')]

    const { getAllByText } = render(
      <StatsHexagonScreenBase user={user} histories={histories} sets={sets} exercises={exercises} />
    )
    // Each axis appears in HexagonStatsCard mock + detail + percentiles
    expect(getAllByText('Force').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Endurance').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Volume').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Régularité').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Équilibre').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche la section Détail par axe', () => {
    const user = makeUser()
    const { getByText } = render(
      <StatsHexagonScreenBase user={user} histories={[makeHistory('h1')]} sets={[makeSet('e1')]} exercises={[makeExercise('e1', ['Pecs'])]} />
    )
    expect(getByText('Détail par axe')).toBeTruthy()
  })

  it('affiche la section Percentiles', () => {
    const user = makeUser()
    const { getByText } = render(
      <StatsHexagonScreenBase user={user} histories={[makeHistory('h1')]} sets={[makeSet('e1')]} exercises={[makeExercise('e1', ['Pecs'])]} />
    )
    expect(getByText('Percentiles estimés')).toBeTruthy()
  })
})
