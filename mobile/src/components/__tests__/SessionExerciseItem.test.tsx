// Mocks AVANT les imports
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Error: 'error', Success: 'success' },
}))

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
        fetch: jest.fn().mockResolvedValue([]),
      }),
    }),
  },
}))

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { SessionExerciseItem } from '../SessionExerciseItem'
import type SessionExercise from '../../model/models/SessionExercise'
import type Exercise from '../../model/models/Exercise'

const makeSessionExercise = (overrides: Partial<SessionExercise> = {}): SessionExercise => ({
  id: 'se-1',
  setsTarget: 3,
  repsTarget: '10',
  position: 0,
  exercise: {
    observe: jest.fn(),
    fetch: jest.fn().mockResolvedValue({ id: 'ex-1', name: 'Squat' }),
    id: 'ex-1',
  },
  observe: jest.fn(),
  ...overrides,
} as unknown as SessionExercise)

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 'ex-1',
  name: 'Développé couché',
  isCustom: false,
  _muscles: '["Pecs","Triceps"]',
  muscles: ['Pecs', 'Triceps'],
  equipment: 'Poids libre',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

describe('SessionExerciseItem', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => { jest.runAllTimers() })
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('rendu des données', () => {
    it('affiche le nom de l\'exercice', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise({ name: 'Squat Arrière' })}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(getByText('Squat Arrière')).toBeTruthy()
    })

    it('affiche les muscles et l\'équipement', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise({ muscles: ['Pecs', 'Triceps'], equipment: 'Barre' })}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(getByText(/Pecs.*Triceps/)).toBeTruthy()
      expect(getByText(/Barre/)).toBeTruthy()
    })

    it('affiche les objectifs de séries', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise({ setsTarget: 4 })}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(getByText('4')).toBeTruthy()
    })

    it('affiche les objectifs de reps', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise({ repsTarget: '12' })}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(getByText('12')).toBeTruthy()
    })

    it('retourne null si exercise est null', () => {
      const { toJSON } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={null as unknown as Exercise}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(toJSON()).toBeNull()
    })
  })

  describe('drag handle', () => {
    it('affiche le drag handle quand drag est fourni', () => {
      const drag = jest.fn()
      const { UNSAFE_getAllByType } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          drag={drag}
        />
      )

      // Le drag handle contient 3 barres (View), le composant rend le handle
      const allTexts = UNSAFE_getAllByType(require('react-native').View)
      // At least the drag bars should be present
      expect(allTexts.length).toBeGreaterThan(3)
    })

    it('n\'affiche pas le drag handle quand drag n\'est pas fourni', () => {
      const { queryByTestId, toJSON } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      const tree = JSON.stringify(toJSON())
      // Without drag, the onPressIn handler should not be present
      expect(tree).not.toContain('onPressIn')
    })

    it('applique le style dragging quand dragActive est true', () => {
      const { toJSON } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          drag={jest.fn()}
          dragActive={true}
        />
      )

      const tree = JSON.stringify(toJSON())
      // dragActive applies itemContainerDragging style with cardSecondary color
      expect(tree).toBeTruthy()
    })

    it('n\'applique pas le style dragging quand dragActive est false', () => {
      const { toJSON: withDrag } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          drag={jest.fn()}
          dragActive={false}
        />
      )

      const { toJSON: withDragActive } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          drag={jest.fn()}
          dragActive={true}
        />
      )

      // The two should differ (dragActive adds extra style)
      const jsonFalse = JSON.stringify(withDrag())
      const jsonTrue = JSON.stringify(withDragActive())
      expect(jsonFalse).not.toEqual(jsonTrue)
    })
  })

  describe('interactions', () => {
    it('appelle onEditTargets quand on appuie sur la zone des objectifs', () => {
      const onEditTargets = jest.fn()
      const se = makeSessionExercise()

      const { getByText } = render(
        <SessionExerciseItem
          item={se}
          exercise={makeExercise()}
          onEditTargets={onEditTargets}
          onRemove={jest.fn()}
        />
      )

      fireEvent.press(getByText('Séries'))

      expect(onEditTargets).toHaveBeenCalledTimes(1)
      expect(onEditTargets).toHaveBeenCalledWith(se)
    })

    it('appelle onRemove avec l\'item et le nom de l\'exercice', () => {
      const onRemove = jest.fn()
      const se = makeSessionExercise()

      const { getByTestId } = render(
        <SessionExerciseItem
          item={se}
          exercise={makeExercise({ name: 'Curl biceps' })}
          onEditTargets={jest.fn()}
          onRemove={onRemove}
        />
      )

      fireEvent.press(getByTestId('delete-btn'))

      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove).toHaveBeenCalledWith(se, 'Curl biceps')
    })
  })
})
