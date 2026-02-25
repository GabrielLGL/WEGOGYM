// Mocks AVANT les imports
jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/utils/databaseHelpers', () => ({
  getLastPerformanceForExercise: jest.fn().mockResolvedValue(null),
}))

jest.mock('../../model/utils/progressionHelpers', () => ({
  suggestProgression: jest.fn().mockReturnValue(null),
}))

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn((fn: () => Promise<void>) => fn()),
    get: jest.fn(),
  },
}))

jest.mock('../../model/utils/validationHelpers', () => ({
  validateSetInput: jest.fn().mockReturnValue({ valid: true }),
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

jest.mock('../../components/LastPerformanceBadge', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    LastPerformanceBadge: () => React.createElement(View, null),
  }
})

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { WorkoutExerciseCard } from '../WorkoutExerciseCard'
import { validateSetInput } from '../../model/utils/validationHelpers'
import type SessionExercise from '../../model/models/SessionExercise'
import type Exercise from '../../model/models/Exercise'
import type { SetInputData, ValidatedSetData } from '../../types/workout'

const mockValidateSetInput = validateSetInput as jest.Mock

const makeSessionExercise = (overrides: Partial<SessionExercise> = {}): SessionExercise => ({
  id: 'se-1',
  setsTarget: 3,
  repsTarget: '10',
  weightTarget: 60,
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
  _muscles: '["Pecs"]',
  muscles: ['Pecs'],
  equipment: 'Poids libre',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

describe('WorkoutExerciseCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateSetInput.mockReturnValue({ valid: true })
  })

  describe('rendu initial', () => {
    it('affiche le nom de l\'exercice', () => {
      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise()}
          exercise={makeExercise({ name: 'Squat Arrière' })}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{}}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('Squat Arrière')).toBeTruthy()
    })

    it('affiche "Aucune série définie" quand setsTarget est 0', () => {
      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 0 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{}}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('Aucune série définie.')).toBeTruthy()
    })

    it('affiche les labels de séries pour chaque série cible', () => {
      const { getByText, getAllByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 3 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{
            'se-1_1': { weight: '60', reps: '10' },
            'se-1_2': { weight: '60', reps: '10' },
            'se-1_3': { weight: '60', reps: '10' },
          }}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('Série 1')).toBeTruthy()
      expect(getByText('Série 2')).toBeTruthy()
      expect(getByText('Série 3')).toBeTruthy()
      expect(getAllByText(/Série \d/).length).toBe(3)
    })

    it('se rend sans crasher avec setsTarget undefined', () => {
      expect(() =>
        render(
          <WorkoutExerciseCard
            sessionExercise={makeSessionExercise({ setsTarget: undefined })}
            exercise={makeExercise()}
            lastPerformance={null}
            historyId="hist-1"
            setInputs={{}}
            validatedSets={{}}
            onUpdateInput={jest.fn()}
            onValidateSet={jest.fn()}
            onUnvalidateSet={jest.fn()}
          />
        )
      ).not.toThrow()
    })
  })

  describe('série validée', () => {
    it('affiche le résumé de la série validée', () => {
      const validatedSets: Record<string, ValidatedSetData> = {
        'se-1_1': { weight: 80, reps: 10, isPr: false },
      }

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{ 'se-1_1': { weight: '80', reps: '10' } }}
          validatedSets={validatedSets}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('80 kg × 10 reps')).toBeTruthy()
    })

    it('affiche le badge PR quand isPr est true', () => {
      const validatedSets: Record<string, ValidatedSetData> = {
        'se-1_1': { weight: 100, reps: 5, isPr: true },
      }

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{ 'se-1_1': { weight: '100', reps: '5' } }}
          validatedSets={validatedSets}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('PR !')).toBeTruthy()
    })

    it('n\'affiche pas le badge PR quand isPr est false', () => {
      const validatedSets: Record<string, ValidatedSetData> = {
        'se-1_1': { weight: 60, reps: 10, isPr: false },
      }

      const { queryByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{ 'se-1_1': { weight: '60', reps: '10' } }}
          validatedSets={validatedSets}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(queryByText('PR !')).toBeNull()
    })

    it('affiche le bouton de dé-validation (✓) sur une série validée', () => {
      const validatedSets: Record<string, ValidatedSetData> = {
        'se-1_1': { weight: 80, reps: 10, isPr: false },
      }

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{ 'se-1_1': { weight: '80', reps: '10' } }}
          validatedSets={validatedSets}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('✓')).toBeTruthy()
    })
  })

  describe('série non validée — inputs', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('affiche les champs de saisie poids et reps', () => {
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }

      const { getAllByDisplayValue } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getAllByDisplayValue('60').length).toBeGreaterThan(0)
      expect(getAllByDisplayValue('10').length).toBeGreaterThan(0)
    })

    it('appelle onUpdateInput après 300ms de pause (debounce poids)', () => {
      const onUpdateInput = jest.fn()
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }

      const { getAllByDisplayValue } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={onUpdateInput}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      const weightInput = getAllByDisplayValue('60')[0]
      fireEvent.changeText(weightInput, '80')

      // Pas encore appelé (debounce en attente)
      expect(onUpdateInput).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)

      expect(onUpdateInput).toHaveBeenCalledWith('se-1_1', 'weight', '80')
    })

    it('n\'appelle onUpdateInput qu\'une seule fois pour plusieurs frappes rapides', () => {
      const onUpdateInput = jest.fn()
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }

      const { getAllByDisplayValue } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={onUpdateInput}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      const weightInput = getAllByDisplayValue('60')[0]
      fireEvent.changeText(weightInput, '7')
      jest.advanceTimersByTime(100)
      fireEvent.changeText(weightInput, '70')
      jest.advanceTimersByTime(100)
      fireEvent.changeText(weightInput, '705')
      jest.advanceTimersByTime(300)

      expect(onUpdateInput).toHaveBeenCalledTimes(1)
      expect(onUpdateInput).toHaveBeenCalledWith('se-1_1', 'weight', '705')
    })

    it('affiche le bouton de validation ✓', () => {
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('✓')).toBeTruthy()
    })

    it('affiche les suffixes "kg" et "reps"', () => {
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      expect(getByText('kg')).toBeTruthy()
      expect(getByText('reps')).toBeTruthy()
    })

    it('flush le debounce et valide avec les valeurs locales si validate tapé < 300ms après la saisie', async () => {
      const onUpdateInput = jest.fn()
      const onValidateSet = jest.fn().mockResolvedValue(undefined)
      // setInputs avec valeurs vides (état parent "stale")
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '', reps: '' },
      }
      mockValidateSetInput.mockReturnValue({ valid: true })

      const { getAllByDisplayValue, getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={onUpdateInput}
          onValidateSet={onValidateSet}
          onUnvalidateSet={jest.fn()}
        />
      )

      // L'utilisateur tape une valeur
      const weightInput = getAllByDisplayValue('')[0]
      fireEvent.changeText(weightInput, '100')
      // Immédiatement (< 300ms), tape sur le bouton de validation
      fireEvent.press(getByText('✓'))

      // Le debounce doit avoir été flushé : onUpdateInput appelé immédiatement
      expect(onUpdateInput).toHaveBeenCalledWith('se-1_1', 'weight', '100')
      // La validation doit utiliser '100' (local), pas '' (parent stale)
      const lastCall = mockValidateSetInput.mock.calls[mockValidateSetInput.mock.calls.length - 1]
      expect(lastCall[0]).toBe('100')
    })

    it('appelle onUpdateInput après 300ms pour les reps (debounce reps)', () => {
      const onUpdateInput = jest.fn()
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }

      const { getAllByDisplayValue } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={onUpdateInput}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      const repsInput = getAllByDisplayValue('10')[0]
      fireEvent.changeText(repsInput, '12')

      expect(onUpdateInput).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)

      expect(onUpdateInput).toHaveBeenCalledWith('se-1_1', 'reps', '12')
    })

    it('flush le debounce reps si validate tapé < 300ms après changement reps', () => {
      const onUpdateInput = jest.fn()
      const onValidateSet = jest.fn().mockResolvedValue(undefined)
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '' },
      }

      const { getAllByDisplayValue, getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={onUpdateInput}
          onValidateSet={onValidateSet}
          onUnvalidateSet={jest.fn()}
        />
      )

      const repsInput = getAllByDisplayValue('')[0]
      fireEvent.changeText(repsInput, '8')
      fireEvent.press(getByText('✓'))

      expect(onUpdateInput).toHaveBeenCalledWith('se-1_1', 'reps', '8')
    })
  })

  describe('gestion des inputs manquants', () => {
    it('utilise des valeurs vides par défaut si la clé n\'existe pas dans setInputs', () => {
      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={{}}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={jest.fn()}
        />
      )

      // La série est quand même affichée
      expect(getByText('Série 1')).toBeTruthy()
    })
  })

  describe('validation — input invalide', () => {
    it('ne valide pas quand validateSetInput retourne invalid', () => {
      const onValidateSet = jest.fn().mockResolvedValue(undefined)
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }
      // First call (WorkoutSetRow render): valid=true so button is enabled
      // Second call (onValidate callback): valid=false so validation stops
      mockValidateSetInput
        .mockReturnValueOnce({ valid: true })
        .mockReturnValue({ valid: false })

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={{}}
          onUpdateInput={jest.fn()}
          onValidateSet={onValidateSet}
          onUnvalidateSet={jest.fn()}
        />
      )

      fireEvent.press(getByText('✓'))

      expect(onValidateSet).not.toHaveBeenCalled()
    })
  })

  describe('série validée — dé-validation', () => {
    it('appelle onUnvalidateSet quand la série validée est pressée', async () => {
      const onUnvalidateSet = jest.fn().mockResolvedValue(undefined)
      const setInputs: Record<string, SetInputData> = {
        'se-1_1': { weight: '60', reps: '10' },
      }
      const validatedSets: Record<string, ValidatedSetData> = {
        'se-1_1': { weight: 60, reps: 10, isPr: false },
      }

      const { getByText } = render(
        <WorkoutExerciseCard
          sessionExercise={makeSessionExercise({ setsTarget: 1 })}
          exercise={makeExercise()}
          lastPerformance={null}
          historyId="hist-1"
          setInputs={setInputs}
          validatedSets={validatedSets}
          onUpdateInput={jest.fn()}
          onValidateSet={jest.fn()}
          onUnvalidateSet={onUnvalidateSet}
        />
      )

      fireEvent.press(getByText('✓'))

      expect(onUnvalidateSet).toHaveBeenCalledTimes(1)
    })
  })
})
