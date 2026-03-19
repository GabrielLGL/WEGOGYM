import React from 'react'
import { render } from '@testing-library/react-native'

/* ─── Capture du composant Base via mock withObservables ─────────────────── */

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

// Déclenche l'évaluation du module → capture du Base
require('../ExerciseCollectionScreen')

import { mockExercise, mockSet } from '../../model/utils/__tests__/testFactories'

const makeExercise = (id: string, name: string, muscles: string[] = []) =>
  mockExercise({ id, name, muscles })

const makeSet_ = (exerciseId: string, daysAgo = 0) =>
  mockSet({
    exerciseId,
    createdAt: new Date(Date.now() - daysAgo * 86400000),
  })

describe('ExerciseCollectionScreenBase', () => {
  const Base = () => mockCaptured.Base!

  it('affiche l état vide sans exercices', () => {
    const Component = Base()
    const { getByText } = render(<Component exercises={[]} sets={[]} />)
    expect(getByText('Collection vide')).toBeTruthy()
  })

  it('affiche la collection avec exercices découverts', () => {
    const Component = Base()
    const exercises = [
      makeExercise('e1', 'Bench Press', ['Pecs']),
      makeExercise('e2', 'Squat', ['Quadriceps']),
      makeExercise('e3', 'Curl', ['Biceps']),
    ]
    const sets = [makeSet_('e1', 1), makeSet_('e1', 2)]
    const { getByText } = render(<Component exercises={exercises} sets={sets} />)
    expect(getByText(/1 \/ 3/)).toBeTruthy()
    expect(getByText('Bench Press')).toBeTruthy()
  })

  it('affiche les exercices verrouillés pour ceux sans sets', () => {
    const Component = Base()
    const exercises = [
      makeExercise('e1', 'Bench Press', ['Pecs']),
      makeExercise('e2', 'Deadlift', ['Dos']),
    ]
    const sets = [makeSet_('e1', 1)]
    const { getByText } = render(<Component exercises={exercises} sets={sets} />)
    // e1 est découvert, e2 est verrouillé (nom masqué par ?)
    expect(getByText('Bench Press')).toBeTruthy()
    expect(getByText('🔒')).toBeTruthy()
  })

  it('affiche la barre de progression', () => {
    const Component = Base()
    const exercises = [
      makeExercise('e1', 'Bench', ['Pecs']),
      makeExercise('e2', 'Squat', ['Quadriceps']),
    ]
    const sets = [makeSet_('e1'), makeSet_('e2')]
    const { getByText } = render(<Component exercises={exercises} sets={sets} />)
    expect(getByText(/100/)).toBeTruthy()
  })
})
