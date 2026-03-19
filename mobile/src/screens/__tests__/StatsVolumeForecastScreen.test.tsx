import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsVolumeForecastBase } from '../StatsVolumeForecastScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

const DAY_MS = 24 * 60 * 60 * 1000

const makeSet = (daysAgo: number, weight: number, reps: number) =>
  ({
    id: `s-${Math.random()}`,
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }) as never

/**
 * Crée des sets répartis sur N semaines (1 set/semaine).
 */
function makeWeeklySets(weeks: number, weight = 100, reps = 10) {
  return Array.from({ length: weeks }, (_, i) =>
    makeSet((i + 1) * 7 + 1, weight, reps),
  )
}

describe('StatsVolumeForecastBase', () => {
  it('rend sans crash avec des props vides', () => {
    const { toJSON } = render(
      <StatsVolumeForecastBase sets={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche message si pas assez de données', () => {
    const { getByText } = render(
      <StatsVolumeForecastBase sets={[]} />,
    )
    expect(getByText(/Au moins 4 semaines/)).toBeTruthy()
  })

  it('affiche la prévision avec 5+ semaines de données', () => {
    const sets = makeWeeklySets(6)
    const { getByText } = render(
      <StatsVolumeForecastBase sets={sets} />,
    )
    // Doit afficher la section "Semaine prochaine"
    expect(getByText(/Semaine prochaine/i)).toBeTruthy()
    // Doit afficher "Cette semaine"
    expect(getByText(/Cette semaine/i)).toBeTruthy()
  })

  it('affiche le pace mensuel', () => {
    const sets = makeWeeklySets(6)
    const { getByText } = render(
      <StatsVolumeForecastBase sets={sets} />,
    )
    expect(getByText(/Ce mois/i)).toBeTruthy()
  })
})
