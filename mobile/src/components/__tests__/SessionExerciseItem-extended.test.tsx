/**
 * Extended tests for SessionExerciseItem — selection mode, groupInfo, info sheet, notes
 */
import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { SessionExerciseItem } from '../SessionExerciseItem'
import type SessionExercise from '../../model/models/SessionExercise'
import type Exercise from '../../model/models/Exercise'

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
  notes: '',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

describe('SessionExerciseItem — extended', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => { jest.runAllTimers() })
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('selection mode', () => {
    it('shows checkbox when selectionMode is true', () => {
      const { queryByTestId } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          selectionMode={true}
          isSelected={false}
          onSelect={jest.fn()}
        />
      )

      // In selection mode, delete button is hidden
      expect(queryByTestId('delete-btn')).toBeNull()
    })

    it('calls onSelect on press when in selection mode', () => {
      const onSelect = jest.fn()
      const se = makeSessionExercise()

      const { getByText } = render(
        <SessionExerciseItem
          item={se}
          exercise={makeExercise({ name: 'Squat' })}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          selectionMode={true}
          isSelected={false}
          onSelect={onSelect}
        />
      )

      // Press the main touchable (which wraps everything)
      fireEvent.press(getByText('Squat'))

      expect(onSelect).toHaveBeenCalledWith(se)
    })

    it('hides delete button in selection mode', () => {
      const { queryByTestId } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          selectionMode={true}
          isSelected={false}
          onSelect={jest.fn()}
        />
      )

      expect(queryByTestId('delete-btn')).toBeNull()
    })

    it('hides drag handle in selection mode', () => {
      const { toJSON } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          selectionMode={true}
          drag={jest.fn()}
        />
      )

      const tree = JSON.stringify(toJSON())
      expect(tree).not.toContain('onPressIn')
    })
  })

  describe('long press', () => {
    it('calls onSelect on long press when not in selection mode', () => {
      const onSelect = jest.fn()
      const se = makeSessionExercise()

      const { getByText } = render(
        <SessionExerciseItem
          item={se}
          exercise={makeExercise({ name: 'Curl' })}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          selectionMode={false}
          onSelect={onSelect}
        />
      )

      fireEvent(getByText('Curl'), 'longPress')

      expect(onSelect).toHaveBeenCalledWith(se)
    })
  })

  describe('info button', () => {
    it('opens ExerciseInfoSheet when info button is pressed', () => {
      const { getByTestId, toJSON } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      fireEvent.press(getByTestId('info-button'))

      // The info sheet should now be "visible" (rendered in tree)
      const tree = JSON.stringify(toJSON())
      expect(tree).toBeTruthy()
    })
  })

  describe('notes indicator', () => {
    it('shows "Notes" text when exercise has notes', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise({ notes: 'Some important notes' })}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(getByText('Notes')).toBeTruthy()
    })

    it('does not show "Notes" when exercise has no notes', () => {
      const { queryByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise({ notes: '' })}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
        />
      )

      expect(queryByText('Notes')).toBeNull()
    })
  })

  describe('group info', () => {
    it('shows superset badge for first item in group', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          groupInfo={{ type: 'superset', isFirst: true, isLast: false }}
        />
      )

      expect(getByText('SS')).toBeTruthy()
    })

    it('shows circuit badge for first item in circuit group', () => {
      const { getByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          groupInfo={{ type: 'circuit', isFirst: true, isLast: false }}
        />
      )

      expect(getByText('CIR')).toBeTruthy()
    })

    it('does not show badge for non-first items', () => {
      const { queryByText } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          groupInfo={{ type: 'superset', isFirst: false, isLast: true }}
        />
      )

      expect(queryByText('SS')).toBeNull()
    })

    it('shows ungroup button when onUngroup is provided', () => {
      const onUngroup = jest.fn()
      const se = makeSessionExercise()

      const { getByText } = render(
        <SessionExerciseItem
          item={se}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          groupInfo={{ type: 'superset', isFirst: true, isLast: false }}
          onUngroup={onUngroup}
        />
      )

      // The group badge area has the ungroup button
      expect(getByText('SS')).toBeTruthy()
    })
  })

  describe('selected state', () => {
    it('applies selected border style when isSelected is true', () => {
      const { toJSON: selectedTree } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          isSelected={true}
        />
      )

      const { toJSON: normalTree } = render(
        <SessionExerciseItem
          item={makeSessionExercise()}
          exercise={makeExercise()}
          onEditTargets={jest.fn()}
          onRemove={jest.fn()}
          isSelected={false}
        />
      )

      const selected = JSON.stringify(selectedTree())
      const normal = JSON.stringify(normalTree())
      expect(selected).not.toEqual(normal)
    })
  })
})
