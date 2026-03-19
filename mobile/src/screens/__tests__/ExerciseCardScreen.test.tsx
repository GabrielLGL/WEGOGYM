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
  database: { write: jest.fn(), get: jest.fn(() => ({ query: () => ({ observe: () => ({}) }), findAndObserve: () => ({}) })) },
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { exerciseId: 'e1' } }),
}))

require('../ExerciseCardScreen')

const makeExercise = (id: string, name: string, muscles: string[] = []) =>
  ({ id, name, muscles }) as any

const makeSet = (weight: number, reps: number, isPr = false, daysAgo = 0) =>
  ({
    weight,
    reps,
    isPr,
    createdAt: new Date(Date.now() - daysAgo * 86400000),
  }) as any

describe('ExerciseCardContent', () => {
  const Base = () => mockCaptured.Base!

  it('affiche le nom et les muscles de l exercice', () => {
    const Component = Base()
    const exercise = makeExercise('e1', 'Développé couché', ['Pecs', 'Triceps'])
    const { getByText } = render(<Component exercise={exercise} sets={[]} />)
    expect(getByText('Développé couché')).toBeTruthy()
    expect(getByText('Pecs')).toBeTruthy()
    expect(getByText('Triceps')).toBeTruthy()
  })

  it('affiche des tirets quand pas de stats (nouvel exercice)', () => {
    const Component = Base()
    const exercise = makeExercise('e1', 'Squat', ['Quadriceps'])
    const { getAllByText } = render(<Component exercise={exercise} sets={[]} />)
    expect(getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('affiche les KPIs avec des données', () => {
    const Component = Base()
    const exercise = makeExercise('e1', 'Bench Press', ['Pecs'])
    const sets = [
      makeSet(100, 10, true, 1),
      makeSet(80, 12, false, 2),
      makeSet(90, 8, false, 3),
    ]
    const { getByText } = render(<Component exercise={exercise} sets={sets} />)
    // Vérifie que le tonnage est affiché (100*10 + 80*12 + 90*8 = 2680 kg)
    expect(getByText('2.7 t')).toBeTruthy()
    // Vérifie le nombre de PRs
    expect(getByText('1')).toBeTruthy()
  })

  it('affiche le niveau expertise débutant avec peu de sessions', () => {
    const Component = Base()
    const exercise = makeExercise('e1', 'Curl', ['Biceps'])
    const sets = [makeSet(20, 10, false, 1)]
    const { getByText } = render(<Component exercise={exercise} sets={sets} />)
    expect(getByText('Débutant')).toBeTruthy()
  })
})
