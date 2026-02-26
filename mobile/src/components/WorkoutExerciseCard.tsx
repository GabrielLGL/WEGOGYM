import React, { useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { from, of } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import { validateSetInput } from '../model/utils/validationHelpers'
import { getLastPerformanceForExercise } from '../model/utils/databaseHelpers'
import { suggestProgression } from '../model/utils/progressionHelpers'
import { database } from '../model/index'
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
  onValidate: (setOrder: number, weight: string, reps: string) => Promise<void>
  onUnvalidate: (setOrder: number) => Promise<void>
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

const WorkoutSetRow = React.memo(function WorkoutSetRow({
  setOrder,
  inputKey,
  input,
  validated,
  onUpdateInput,
  onValidate,
  onUnvalidate,
  repsTarget,
}: WorkoutSetRowProps) {
  // Hooks AVANT tout return conditionnel (règle des hooks React)
  const [localWeight, setLocalWeight] = React.useState(input.weight)
  const [localReps, setLocalReps] = React.useState(input.reps)
  const weightTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const repsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    return () => {
      if (weightTimerRef.current) clearTimeout(weightTimerRef.current)
      if (repsTimerRef.current) clearTimeout(repsTimerRef.current)
    }
  }, [])

  const handleWeightChange = useCallback((v: string) => {
    setLocalWeight(v)
    if (weightTimerRef.current) clearTimeout(weightTimerRef.current)
    weightTimerRef.current = setTimeout(() => onUpdateInput(inputKey, 'weight', v), 300)
  }, [inputKey, onUpdateInput])

  const handleRepsChange = useCallback((v: string) => {
    setLocalReps(v)
    if (repsTimerRef.current) clearTimeout(repsTimerRef.current)
    repsTimerRef.current = setTimeout(() => onUpdateInput(inputKey, 'reps', v), 300)
  }, [inputKey, onUpdateInput])

  const handleValidate = useCallback(() => {
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
    // Animation spring sur validation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.25, useNativeDriver: true, speed: 40, bounciness: 10 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 0 }),
    ]).start()
    onValidate(setOrder, localWeight, localReps)
  }, [inputKey, localWeight, localReps, onUpdateInput, onValidate, scaleAnim, setOrder])

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
        <TouchableOpacity onPress={() => onUnvalidate(setOrder)} style={styles.validateBtnActive}>
          <Text style={styles.validateBtnText}>✓</Text>
        </TouchableOpacity>
      </View>
    )
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
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.validateBtn, !valid && styles.validateBtnDisabled]}
          onPress={handleValidate}
          disabled={!valid}
          activeOpacity={0.7}
        >
          <Text style={styles.validateBtnText}>✓</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
})

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
  const [isEditingNote, setIsEditingNote] = React.useState(false)
  const [noteText, setNoteText] = React.useState(exercise.notes ?? '')

  const setsCount = sessionExercise.setsTarget ?? 0
  const setOrders = Array.from({ length: setsCount }, (_, i) => i + 1)
  const completedCount = setOrders.filter(
    i => validatedSets[`${sessionExercise.id}_${i}`]
  ).length
  const isComplete = completedCount === setsCount && setsCount > 0

  const suggestion = lastPerformance
    ? suggestProgression(
        lastPerformance.avgWeight,
        lastPerformance.avgReps,
        sessionExercise.repsTarget
      )
    : null

  const handleSaveNote = async () => {
    setIsEditingNote(false)
    if (noteText !== (exercise.notes ?? '')) {
      await database.write(async () => {
        await exercise.update(e => {
          e.notes = noteText
        })
      })
    }
  }

  const handleValidate = React.useCallback(
    async (setOrder: number, weight: string, reps: string) => {
      const { valid } = validateSetInput(weight, reps)
      if (!valid) { haptics.onError(); return }
      haptics.onSuccess()
      await onValidateSet(sessionExercise, setOrder)
    },
    [haptics, onValidateSet, sessionExercise]
  )

  const handleUnvalidate = React.useCallback(
    async (setOrder: number) => {
      haptics.onDelete()
      await onUnvalidateSet(sessionExercise, setOrder)
    },
    [haptics, onUnvalidateSet, sessionExercise]
  )

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: isComplete ? colors.success : 'transparent' },
      ]}
    >
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {isEditingNote ? (
        <TextInput
          value={noteText}
          onChangeText={setNoteText}
          onBlur={handleSaveNote}
          placeholder="Ajouter une note (grip, tempo, sensation...)"
          placeholderTextColor={colors.placeholder}
          style={styles.noteInput}
          autoFocus
          multiline
        />
      ) : exercise.notes ? (
        <TouchableOpacity onPress={() => setIsEditingNote(true)}>
          <Text style={styles.noteText}>{exercise.notes}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsEditingNote(true)}>
          <Text style={styles.addNoteLink}>+ Ajouter une note</Text>
        </TouchableOpacity>
      )}
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
      {suggestion && (
        <Text style={styles.suggestionText}>
          Suggestion : {suggestion.label}
        </Text>
      )}
      {setsCount === 0 ? (
        <Text style={styles.noSetsText}>Aucune série définie.</Text>
      ) : (
        setOrders.map(setOrder => {
          const key = `${sessionExercise.id}_${setOrder}`
          const input = setInputs[key] ?? { weight: '', reps: '' }
          const validated = validatedSets[key]

          // Note: handleValidate/handleUnvalidate sont des refs stables (useCallback parent).
          // React.memo protège WorkoutSetRow contre les re-renders non liés (ex: note editing).
          return (
            <WorkoutSetRow
              key={key}
              setOrder={setOrder}
              inputKey={key}
              input={input}
              validated={validated}
              onUpdateInput={onUpdateInput}
              repsTarget={sessionExercise.repsTarget}
              onValidate={handleValidate}
              onUnvalidate={handleUnvalidate}
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
    lastPerformance: sessionExercise.exercise.observe().pipe(
      switchMap(exercise =>
        from(getLastPerformanceForExercise(exercise.id, historyId ?? ''))
      ),
      catchError(err => {
        if (__DEV__) console.error('WorkoutExerciseCard: lastPerformance error', err)
        return of(null)
      })
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
    marginBottom: 2,
  },
  suggestionText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  noteInput: {
    color: colors.text,
    fontSize: fontSize.xs,
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 32,
  },
  addNoteLink: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.successBg,
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
    gap: spacing.xs,
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
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  prBadge: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
})
