jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

import React from 'react'
import { render, act } from '@testing-library/react-native'
import { ExerciseInfoSheet } from '../ExerciseInfoSheet'
import type Exercise from '../../model/models/Exercise'

const makeExercise = (overrides: Partial<Record<string, unknown>> = {}): Exercise => ({
  id: 'ex-1',
  name: 'Développé Couché Barre',
  isCustom: false,
  muscles: ['Pecs', 'Epaules', 'Triceps'],
  equipment: 'Poids libre',
  description: 'Allongé sur le banc, pieds au sol. Descends la barre vers le milieu de la poitrine.',
  notes: 'Grip pronation, tempo 3-1-1-0',
  animationKey: 'bench_press_barbell',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

describe('ExerciseInfoSheet', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => { jest.runAllTimers() })
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('affiche le nom de l\'exercice', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise()}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText('Développé Couché Barre')).toBeTruthy()
  })

  it('affiche les muscles en chips', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise()}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText('Pecs')).toBeTruthy()
    expect(getByText('Epaules')).toBeTruthy()
    expect(getByText('Triceps')).toBeTruthy()
  })

  it('affiche la description quand elle existe', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise()}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText(/Allongé sur le banc/)).toBeTruthy()
  })

  it('affiche le placeholder quand pas de description', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise({ description: undefined })}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText('Pas de description disponible')).toBeTruthy()
  })

  it('affiche les notes quand elles existent', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise()}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText('Grip pronation, tempo 3-1-1-0')).toBeTruthy()
  })

  it('affiche le placeholder quand pas de notes', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise({ notes: undefined })}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText('Aucune note')).toBeTruthy()
  })

  it('affiche le placeholder animation', () => {
    const { getByText } = render(
      <ExerciseInfoSheet
        exercise={makeExercise()}
        visible={true}
        onClose={jest.fn()}
      />
    )

    expect(getByText('Animation à venir')).toBeTruthy()
  })

  it('ne rend rien quand visible est false', () => {
    const { toJSON } = render(
      <ExerciseInfoSheet
        exercise={makeExercise()}
        visible={false}
        onClose={jest.fn()}
      />
    )

    expect(toJSON()).toBeNull()
  })
})
