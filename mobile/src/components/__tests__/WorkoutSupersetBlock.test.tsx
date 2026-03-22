// Mocks AVANT les imports
import React from 'react'
import { render } from '@testing-library/react-native'
import { WorkoutSupersetBlock } from '../WorkoutSupersetBlock'
import { mockSessionExercise } from '../../model/utils/__tests__/testFactories'
import type { SetInputData, ValidatedSetData } from '../../types/workout'

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn((fn: () => Promise<void>) => fn()),
    get: jest.fn(),
    batch: jest.fn(),
  },
}))

jest.mock('../../model/utils/validationHelpers', () => ({
  validateSetInput: jest.fn().mockReturnValue({ valid: true }),
}))

jest.mock('../../model/utils/databaseHelpers', () => ({
  getLastPerformanceForExercise: jest.fn().mockResolvedValue(null),
}))

jest.mock('../../model/utils/progressionHelpers', () => ({
  suggestProgression: jest.fn().mockReturnValue(null),
}))

jest.mock('../../model/utils/workoutTipsHelpers', () => ({
  getTipKeyForExercise: jest.fn().mockReturnValue('tip_key'),
}))

jest.mock('@nozbe/with-observables', () => {
  return (_keys: string[], _fn: Function) => (Component: React.ComponentType<Record<string, unknown>>) => {
    return (props: Record<string, unknown>) => {
      const exercise = { id: 'ex-1', name: 'Bench Press', muscles: ['chest'] }
      return <Component {...props} exercise={exercise} lastPerformance={null} />
    }
  }
})

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    onPress: jest.fn(),
    onDelete: jest.fn(),
    onSuccess: jest.fn(),
    onSelect: jest.fn(),
    onError: jest.fn(),
    onMajorSuccess: jest.fn(),
  }),
}))

jest.mock('../WorkoutExerciseCard', () => ({
  WorkoutSetRow: (props: Record<string, unknown>) => {
    const { View, Text } = require('react-native')
    return <View testID={`set-row-${props.inputKey}`}><Text>{String(props.inputKey)}</Text></View>
  },
}))

describe('WorkoutSupersetBlock', () => {
  const defaultProps = {
    historyId: 'hist-1',
    setInputs: {} as Record<string, SetInputData>,
    validatedSets: {} as Record<string, ValidatedSetData>,
    onUpdateInput: jest.fn(),
    onValidateSet: jest.fn().mockResolvedValue(undefined),
    onUnvalidateSet: jest.fn().mockResolvedValue(true),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('en-tete superset', () => {
    it('affiche le label superset avec le nombre d\'exercices', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 3 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 3 }),
      ]

      const { getByText } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      expect(getByText('Superset (2)')).toBeTruthy()
    })

    it('affiche le label superset avec accessibilityLabel correct', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 2 }),
      ]

      const { getByLabelText } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      expect(getByLabelText('Superset (2)')).toBeTruthy()
    })
  })

  describe('en-tete circuit', () => {
    it('affiche le label circuit avec le nombre d\'exercices', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 3 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 3 }),
        mockSessionExercise({ id: 'se-3', setsTarget: 3 }),
      ]

      const { getByText } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="circuit"
        />
      )

      expect(getByText('Circuit (3)')).toBeTruthy()
    })
  })

  describe('infos exercices', () => {
    it('affiche le nom de chaque exercice via SupersetExerciseInfo', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 2 }),
      ]

      const { getAllByText } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      // withObservables mock injects exercise.name = 'Bench Press' for each
      expect(getAllByText('Bench Press').length).toBe(2)
    })

    it('affiche les lettres A et B pour deux exercices', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 2 }),
      ]

      const { getByLabelText } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      expect(getByLabelText('Exercice du superset A')).toBeTruthy()
      expect(getByLabelText('Exercice du superset B')).toBeTruthy()
    })
  })

  describe('rounds et series', () => {
    it('affiche le bon nombre de rounds selon le max setsTarget', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 3 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 2 }),
      ]

      const { getAllByText } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      // 3 rounds based on max(3, 2)
      const roundLabels = getAllByText(/^Série \d$/)
      expect(roundLabels.length).toBe(3)
    })

    it('affiche les set rows pour chaque exercice dans chaque round', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 2 }),
      ]

      const { getByTestId } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      // 2 exercises x 2 rounds = 4 set rows
      expect(getByTestId('set-row-se-1_1')).toBeTruthy()
      expect(getByTestId('set-row-se-2_1')).toBeTruthy()
      expect(getByTestId('set-row-se-1_2')).toBeTruthy()
      expect(getByTestId('set-row-se-2_2')).toBeTruthy()
    })

    it('n\'affiche pas de set row quand setsTarget < roundNum', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 3 }),
        mockSessionExercise({ id: 'se-2', setsTarget: 1 }),
      ]

      const { getByTestId, queryByTestId } = render(
        <WorkoutSupersetBlock
          {...defaultProps}
          sessionExercises={sessionExercises}
          supersetType="superset"
        />
      )

      // se-2 has only 1 set, so rounds 2 and 3 should not have se-2
      expect(getByTestId('set-row-se-2_1')).toBeTruthy()
      expect(queryByTestId('set-row-se-2_2')).toBeNull()
      expect(queryByTestId('set-row-se-2_3')).toBeNull()

      // se-1 has 3 sets, all rounds present
      expect(getByTestId('set-row-se-1_1')).toBeTruthy()
      expect(getByTestId('set-row-se-1_2')).toBeTruthy()
      expect(getByTestId('set-row-se-1_3')).toBeTruthy()
    })
  })

  describe('cas limites', () => {
    it('se rend sans crasher avec un seul exercice', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
      ]

      expect(() =>
        render(
          <WorkoutSupersetBlock
            {...defaultProps}
            sessionExercises={sessionExercises}
            supersetType="superset"
          />
        )
      ).not.toThrow()
    })

    it('se rend sans crasher avec setsTarget null', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: null }),
        mockSessionExercise({ id: 'se-2', setsTarget: null }),
      ]

      expect(() =>
        render(
          <WorkoutSupersetBlock
            {...defaultProps}
            sessionExercises={sessionExercises}
            supersetType="superset"
          />
        )
      ).not.toThrow()
    })

    it('gere suggestedExerciseIds comme undefined', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
      ]

      expect(() =>
        render(
          <WorkoutSupersetBlock
            {...defaultProps}
            sessionExercises={sessionExercises}
            supersetType="superset"
            suggestedExerciseIds={undefined}
          />
        )
      ).not.toThrow()
    })

    it('gere suggestedExerciseIds avec des IDs', () => {
      const sessionExercises = [
        mockSessionExercise({ id: 'se-1', setsTarget: 2 }),
      ]

      expect(() =>
        render(
          <WorkoutSupersetBlock
            {...defaultProps}
            sessionExercises={sessionExercises}
            supersetType="superset"
            suggestedExerciseIds={new Set(['ex-1'])}
          />
        )
      ).not.toThrow()
    })
  })
})
