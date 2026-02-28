/**
 * Tests for ExerciseHistoryScreen.tsx.
 * withObservables mocked to inject mock exercise data into ExerciseHistoryContent.
 * ThemeContext mocked globally via moduleNameMapper.
 */

// Mock exercise data injected by the withObservables mock below
const mockExercise = {
  id: 'ex1',
  name: 'Bench Press',
  muscles: ['Pecs'],
  equipment: 'Barre & disques',
}

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      }),
      findAndObserve: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    }),
  },
}))

// Inject mock props into ExerciseHistoryContent via the withObservables wrapper.
// Must use require() instead of React reference — jest.mock factories are hoisted before imports.
jest.mock('@nozbe/with-observables', () =>
  (_keys: unknown, _fn: unknown) =>
  (Component: unknown) => {
    return function MockEnhanced(_props: unknown) {
      const mockReact = require('react')
      return mockReact.createElement(Component as Parameters<typeof mockReact.createElement>[0], {
        exercise: mockExercise,
        setsForExercise: [],
        histories: [],
        sessions: [],
      })
    }
  }
)

jest.mock('react-native-chart-kit', () => ({
  LineChart: () => null,
}))

jest.mock('../../theme/chartConfig', () => ({
  createChartConfig: jest.fn().mockReturnValue({}),
}))

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { exerciseId: 'ex1' } }),
}))

import React from 'react'
import { render } from '@testing-library/react-native'
import ExerciseHistoryScreen from '../ExerciseHistoryScreen'

describe('ExerciseHistoryScreen', () => {
  it('renders without crashing', () => {
    expect(() => render(<ExerciseHistoryScreen />)).not.toThrow()
  })

  it('displays the exercise name', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText('Bench Press')).toBeTruthy()
  })

  it('displays the exercise muscles and equipment', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText(/Pecs.*Barre/)).toBeTruthy()
  })

  it('shows "Record personnel" card', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText('Record personnel')).toBeTruthy()
  })

  it('shows "Aucun record enregistré" when no sets', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText('Aucun record enregistré')).toBeTruthy()
  })

  it('shows empty state when no sessions', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText('Aucune séance enregistrée pour cet exercice.')).toBeTruthy()
  })

  it('shows history section with 0 séances', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText(/Historique complet \(0 séances\)/)).toBeTruthy()
  })

  it('shows chart empty state when fewer than 2 sessions', () => {
    const { getByText } = render(<ExerciseHistoryScreen />)
    expect(getByText(/Enregistrez au moins 2 séances/)).toBeTruthy()
  })
})
