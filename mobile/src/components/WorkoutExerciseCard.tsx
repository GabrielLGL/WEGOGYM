import React from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { from } from 'rxjs'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import { validateSetInput } from '../model/utils/validationHelpers'
import { getLastPerformanceForExercise } from '../model/utils/databaseHelpers'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import type { SetInputData, ValidatedSetData, LastPerformance } from '../types/workout'

// --- Types ---

interface WorkoutSetRowProps {
  setOrder: number
  inputKey: string
  input: SetInputData
  validated: ValidatedSetData | undefined
  onUpdateInput: (key: string, field: 'weight' | 'reps', value: string) => void
  onValidate: (weight: string, reps: string) => Promise<void>
  onUnvalidate: () => Promise<void>
  repsTarget?: string
}

interface WorkoutExerciseCardContentProps {
  sessionExercise: SessionExercise
  exercise: Exercise
  lastPerformance: LastPerformance | null
  setInputs: Record<string, SetInputData>
  validatedSets: Record<string, ValidatedSetData>
  onUpdateInput: (key: string, field: 'weight' | 'reps', value: string) => void
  onValidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<void>
  onUnvalidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<void>
}

// --- WorkoutSetRow ---

const WorkoutSetRow: React.FC<WorkoutSetRowProps> = ({
  setOrder,
  inputKey,
  input,
  validated,
  onUpdateInput,
  onValidate,
  onUnvalidate,
  repsTarget,
}) => {
  // Hooks AVANT tout return conditionnel (règle des hooks React)
  const [localWeight, setLocalWeight] = React.useState(input.weight)
  const [localReps, setLocalReps] = React.useState(input.reps)
  const weightTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const repsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (weightTimerRef.current) clearTimeout(weightTimerRef.current)
      if (repsTimerRef.current) clearTimeout(repsTimerRef.current)
    }
  }, [])

  if (validated) {
    return (
      <View style={[styles.setRow, styles.setRowValidated]}>
        <Text style={styles.setLabel}>Série {setOrder}</Text>
        <Text style={styles.validatedText}>
          {validated.weight} kg × {validated.reps} reps
        </Text>
        {validated.isPr && (
          <View style={styles.prChip}>
            <Text style={styles.prBadge}>PR !</Text>
          </View>
        )}
        <TouchableOpacity onPress={onUnvalidate} style={styles.validateBtnActive}>
          <Text style={styles.validateBtnText}>✓</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleWeightChange = (v: string) => {
    setLocalWeight(v)
    if (weightTimerRef.current) clearTimeout(weightTimerRef.current)
    weightTimerRef.current = setTimeout(() => onUpdateInput(inputKey, 'weight', v), 300)
  }

  const handleRepsChange = (v: string) => {
    setLocalReps(v)
    if (repsTimerRef.current) clearTimeout(repsTimerRef.current)
    repsTimerRef.current = setTimeout(() => onUpdateInput(inputKey, 'reps', v), 300)
  }

  const handleValidate = () => {
    // Flush debounce immédiatement : évite le desync si le user valide < 300ms après avoir tapé
    if (weightTimerRef.current) {
      clearTimeout(weightTimerRef.current)
      weightTimerRef.current = null
      onUpdateInput(inputKey, 'weight', localWeight)
    }
    if (repsTimerRef.current) {
      clearTimeout(repsTimerRef.current)
      repsTimerRef.current = null
      onUpdateInput(inputKey, 'reps', localReps)
    }
    onValidate(localWeight, localReps)
  }

  const weightNum = Number(localWeight)
  const repsNum = Number(localReps)
  const weightHasValue = localWeight.trim() !== ''
  const repsHasValue = localReps.trim() !== ''
  const weightError = weightHasValue && (isNaN(weightNum) || weightNum < 0)
  const repsError = repsHasValue && (isNaN(repsNum) || repsNum < 1)
  const { valid } = validateSetInput(localWeight, localReps)

  return (
    <View style={styles.setRow}>
      <Text style={styles.setLabel}>Série {setOrder}</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.inputWeight, weightError && styles.inputError]}
          value={localWeight}
          onChangeText={handleWeightChange}
          placeholder="0"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          editable
          textAlign="center"
        />
        <Text style={styles.inputSuffix}>kg</Text>
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.inputReps, repsError && styles.inputError]}
          value={localReps}
          onChangeText={handleRepsChange}
          placeholder={repsTarget ?? '6-8'}
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          editable
          textAlign="center"
        />
        <Text style={styles.inputSuffix}>reps</Text>
      </View>
      <TouchableOpacity
        style={[styles.validateBtn, !valid && styles.validateBtnDisabled]}
        onPress={handleValidate}
        disabled={!valid}
        activeOpacity={0.7}
      >
        <Text style={styles.validateBtnText}>✓</Text>
      </TouchableOpacity>
    </View>
  )
}

// --- WorkoutExerciseCard ---

const WorkoutExerciseCardContent: React.FC<WorkoutExerciseCardContentProps> = ({
  sessionExercise,
  exercise,
  lastPerformance,
  setInputs,
  validatedSets,
  onUpdateInput,
  onValidateSet,
  onUnvalidateSet,
}) => {
  const haptics = useHaptics()
  const setsCount = sessionExercise.setsTarget ?? 0
  const setOrders = Array.from({ length: setsCount }, (_, i) => i + 1)
  const completedCount = setOrders.filter(
    i => validatedSets[`${sessionExercise.id}_${i}`]
  ).length
  const isComplete = completedCount === setsCount && setsCount > 0

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: isComplete ? colors.success : 'transparent' },
      ]}
    >
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {sessionExercise.setsTarget != null && (
        <Text style={styles.target}>
          Objectif : {sessionExercise.setsTarget}×{sessionExercise.repsTarget ?? '?'} reps
        </Text>
      )}
      {lastPerformance && (
        <Text style={styles.lastPerfText}>
          Dernière : Moy. {lastPerformance.avgWeight} kg × {lastPerformance.avgReps} sur {lastPerformance.setsCount} série{lastPerformance.setsCount > 1 ? 's' : ''}
        </Text>
      )}
      {setsCount === 0 ? (
        <Text style={styles.noSetsText}>Aucune série définie.</Text>
      ) : (
        setOrders.map(setOrder => {
          const key = `${sessionExercise.id}_${setOrder}`
          const input = setInputs[key] ?? { weight: '', reps: '' }
          const validated = validatedSets[key]

          return (
            <WorkoutSetRow
              key={key}
              setOrder={setOrder}
              inputKey={key}
              input={input}
              validated={validated}
              onUpdateInput={onUpdateInput}
              repsTarget={sessionExercise.repsTarget}
              onValidate={async (weight, reps) => {
                const { valid } = validateSetInput(weight, reps)
                if (!valid) {
                  haptics.onError()
                  return
                }
                haptics.onSuccess()
                await onValidateSet(sessionExercise, setOrder)
              }}
              onUnvalidate={async () => {
                haptics.onDelete()
                await onUnvalidateSet(sessionExercise, setOrder)
              }}
            />
          )
        })
      )}
    </View>
  )
}

export const WorkoutExerciseCard = withObservables(
  ['sessionExercise', 'historyId'],
  ({
    sessionExercise,
    historyId,
  }: {
    sessionExercise: SessionExercise
    historyId: string
  }) => ({
    exercise: sessionExercise.exercise.observe(),
    lastPerformance: from(
      getLastPerformanceForExercise(sessionExercise.exercise.id, historyId ?? '')
    ),
  })
)(WorkoutExerciseCardContent)

// --- Styles ---

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
  },
  exerciseName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  target: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  lastPerfText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  noSetsText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },

  // Set row
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  setRowValidated: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  setLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    width: 62,
  },

  // Input group
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWeight: { width: 62 },
  inputReps: { width: 52 },
  inputError: {
    borderColor: colors.danger,
  },
  inputSuffix: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    width: 28,
  },

  // Validate button (not validated)
  validateBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  validateBtnDisabled: {
    backgroundColor: colors.cardSecondary,
  },
  validateBtnActive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  validateBtnText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },

  // Validated state
  validatedText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  prChip: {
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prBadge: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
})
