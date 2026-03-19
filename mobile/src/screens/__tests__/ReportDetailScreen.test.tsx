import React from 'react'
import { render } from '@testing-library/react-native'

const mockCaptured: { Base: React.ComponentType<any> | null } = { Base: null }

jest.mock('@nozbe/with-observables', () => ({
  __esModule: true,
  default: () => (Component: any) => {
    mockCaptured.Base = Component
    return Component
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn(() => ({ query: () => ({ observe: () => ({}) }) })) },
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { type: 'weekly', offset: 0 } }),
}))

jest.mock('../../model/utils/statsHelpers', () => ({
  getWeekPeriod: () => ({ start: Date.now() - 7 * 86400000, end: Date.now(), label: 'Semaine en cours' }),
  getMonthPeriod: () => ({ start: Date.now() - 30 * 86400000, end: Date.now(), label: 'Mars 2026' }),
  prepareStatsContext: () => ({}),
  computeReportSummary: jest.fn().mockReturnValue({
    period: { label: 'Semaine en cours' },
    sessionsCount: 0,
    totalVolumeKg: 0,
    totalDurationMin: 0,
    avgDurationMin: 0,
    prsCount: 0,
    comparedToPrevious: 0,
    topMuscles: [],
    topExercises: [],
    prs: [],
    currentStreak: 0,
  }),
  formatVolume: (v: number) => `${v} kg`,
}))

require('../ReportDetailScreen')

const { computeReportSummary } = require('../../model/utils/statsHelpers')

describe('ReportDetailScreenBase', () => {
  const Base = () => mockCaptured.Base!

  beforeEach(() => {
    computeReportSummary.mockClear()
  })

  it('affiche l état vide sans séances', () => {
    computeReportSummary.mockReturnValue({
      period: { label: 'Semaine en cours' },
      sessionsCount: 0,
      totalVolumeKg: 0,
      totalDurationMin: 0,
      avgDurationMin: 0,
      prsCount: 0,
      comparedToPrevious: 0,
      topMuscles: [],
      topExercises: [],
      prs: [],
      currentStreak: 0,
    })
    const Component = Base()
    const { getByText } = render(<Component histories={[]} sets={[]} exercises={[]} />)
    expect(getByText('Semaine en cours')).toBeTruthy()
  })

  it('affiche les KPIs avec des données', () => {
    computeReportSummary.mockReturnValue({
      period: { label: 'Semaine en cours' },
      sessionsCount: 4,
      totalVolumeKg: 5000,
      totalDurationMin: 240,
      avgDurationMin: 60,
      prsCount: 2,
      comparedToPrevious: 10,
      topMuscles: [{ muscle: 'Pecs', pct: 40, volume: 2000 }],
      topExercises: [{ exerciseId: 'e1', name: 'Bench', volume: 2000 }],
      prs: [],
      currentStreak: 3,
    })
    const Component = Base()
    const { getByText } = render(<Component histories={[]} sets={[]} exercises={[]} />)
    expect(getByText('4')).toBeTruthy()
    expect(getByText('2')).toBeTruthy()
  })

  it('affiche le toggle hebdo/mensuel', () => {
    computeReportSummary.mockReturnValue({
      period: { label: 'Semaine en cours' },
      sessionsCount: 0,
      totalVolumeKg: 0,
      totalDurationMin: 0,
      avgDurationMin: 0,
      prsCount: 0,
      comparedToPrevious: 0,
      topMuscles: [],
      topExercises: [],
      prs: [],
      currentStreak: 0,
    })
    const Component = Base()
    const { getByText } = render(<Component histories={[]} sets={[]} exercises={[]} />)
    expect(getByText('Hebdo')).toBeTruthy()
    expect(getByText('Mensuel')).toBeTruthy()
  })
})
