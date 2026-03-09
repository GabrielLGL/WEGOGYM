// Mock WatermelonDB AVANT les imports
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import SetItem from '../SetItem'
import type Set from '../../model/models/Set'
import type Exercise from '../../model/models/Exercise'

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

const makeSet = (overrides: Partial<Set> = {}): Set => ({
  id: 'set-1',
  weight: 80,
  reps: 10,
  setOrder: 1,
  isPr: false,
  observe: jest.fn(),
  exercise: {
    observe: jest.fn(),
    fetch: jest.fn(),
    id: 'ex-1',
  },
  ...overrides,
} as unknown as Set)

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 'ex-1',
  name: 'Développé couché',
  isCustom: false,
  _muscles: '["Pecs"]',
  equipment: 'Poids libre',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

describe('SetItem', () => {
  describe('rendu des données', () => {
    it('affiche le nom de l\'exercice', () => {
      const { getByText } = render(
        <SetItem
          set={makeSet()}
          exercise={makeExercise({ name: 'Squat' })}
          onLongPress={jest.fn()}
        />
      )

      expect(getByText('Squat')).toBeTruthy()
    })

    it('affiche le numéro de série', () => {
      const { getByText } = render(
        <SetItem
          set={makeSet({ setOrder: 2 })}
          exercise={makeExercise()}
          onLongPress={jest.fn()}
        />
      )

      expect(getByText('Série #2')).toBeTruthy()
    })

    it('affiche le poids et les reps', () => {
      const { getByText } = render(
        <SetItem
          set={makeSet({ weight: 100, reps: 5 })}
          exercise={makeExercise()}
          onLongPress={jest.fn()}
        />
      )

      expect(getByText(/100kg/)).toBeTruthy()
      expect(getByText(/5/)).toBeTruthy()
    })

    it('affiche le poids à 0', () => {
      const { getByText } = render(
        <SetItem
          set={makeSet({ weight: 0, reps: 20, setOrder: 1 })}
          exercise={makeExercise()}
          onLongPress={jest.fn()}
        />
      )

      expect(getByText(/0kg/)).toBeTruthy()
    })

    it('affiche "Série #1" pour le premier set', () => {
      const { getByText } = render(
        <SetItem
          set={makeSet({ setOrder: 1 })}
          exercise={makeExercise()}
          onLongPress={jest.fn()}
        />
      )

      expect(getByText('Série #1')).toBeTruthy()
    })
  })

  describe('interactions', () => {
    it('appelle onLongPress lors d\'un appui long', () => {
      const onLongPress = jest.fn()

      const { getByText } = render(
        <SetItem
          set={makeSet()}
          exercise={makeExercise({ name: 'Développé couché' })}
          onLongPress={onLongPress}
        />
      )

      fireEvent(getByText('Développé couché'), 'longPress')

      expect(onLongPress).toHaveBeenCalledTimes(1)
    })

    it('n\'appelle pas onLongPress lors d\'un appui simple', () => {
      const onLongPress = jest.fn()

      const { getByText } = render(
        <SetItem
          set={makeSet()}
          exercise={makeExercise({ name: 'Curl biceps' })}
          onLongPress={onLongPress}
        />
      )

      fireEvent.press(getByText('Curl biceps'))

      expect(onLongPress).not.toHaveBeenCalled()
    })
  })

  describe('cas limites', () => {
    it('se rend sans crasher avec un poids décimal', () => {
      expect(() =>
        render(
          <SetItem
            set={makeSet({ weight: 22.5, reps: 8 })}
            exercise={makeExercise()}
            onLongPress={jest.fn()}
          />
        )
      ).not.toThrow()
    })

    it('affiche le séparateur "x" entre poids et reps', () => {
      const { getByText } = render(
        <SetItem
          set={makeSet({ weight: 50, reps: 12 })}
          exercise={makeExercise()}
          onLongPress={jest.fn()}
        />
      )

      expect(getByText('x')).toBeTruthy()
    })
  })
})
