import React, { useCallback, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { from, of } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import { validateSetInput } from '../model/utils/validationHelpers'
import { getLastPerformanceForExercise, updateSessionExerciseNotes } from '../model/utils/databaseHelpers'
import { suggestProgression } from '../model/utils/progressionHelpers'
import { getTipKeyForExercise } from '../model/utils/workoutTipsHelpers'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, borderRadius, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUnits } from '../contexts/UnitContext'
import type { ThemeColors } from '../theme'
import type { SetInputData, ValidatedSetData, LastPerformance } from '../types/workout'

const INPUT_DEBOUNCE_MS = 300
const SET_BADGE_SIZE = 28
const VALIDATE_BTN_SIZE = 40
const UNDO_BTN_SIZE = 28

// --- Types ---

export interface WorkoutSetRowProps {
  setOrder: number
  inputKey: string
  input: SetInputData
  validated: ValidatedSetData | undefined
  onUpdateInput: (key: string, field: 'weight' | 'reps', value: string) => void
  onValidate: (setOrder: number, weight: string, reps: string) => Promise<void>
  onUnvalidate: (setOrder: number) => Promise<void>
  repsTarget?: string | null
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
  isProgressionApplied?: boolean
}

// --- WorkoutSetRow ---

export const WorkoutSetRow = React.memo(function WorkoutSetRow({
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
  const { colors } = useTheme()
  const { t } = useLanguage()
  const { weightUnit } = useUnits()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [localWeight, setLocalWeight] = React.useState(input.weight)
  const [localReps, setLocalReps] = React.useState(input.reps)
  const weightTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const repsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  // Sync local state when parent input changes (e.g. progression suggestion)
  React.useEffect(() => {
    setLocalWeight(input.weight)
  }, [input.weight])

  React.useEffect(() => {
    setLocalReps(input.reps)
  }, [input.reps])

  React.useEffect(() => {
    return () => {
      if (weightTimerRef.current) clearTimeout(weightTimerRef.current)
      if (repsTimerRef.current) clearTimeout(repsTimerRef.current)
    }
  }, [])

  // Reset l'animation quand la série est dé-validée, pour que le bouton
  // reprenne son apparence normale (évite le scale bloqué à 1.25)
  React.useEffect(() => {
    if (!validated) {
      scaleAnim.stopAnimation()
      scaleAnim.setValue(1)
    }
  }, [validated, scaleAnim])

  const handleWeightChange = useCallback((v: string) => {
    setLocalWeight(v)
    if (weightTimerRef.current) clearTimeout(weightTimerRef.current)
    weightTimerRef.current = setTimeout(() => onUpdateInput(inputKey, 'weight', v), INPUT_DEBOUNCE_MS)
  }, [inputKey, onUpdateInput])

  const handleRepsChange = useCallback((v: string) => {
    setLocalReps(v)
    if (repsTimerRef.current) clearTimeout(repsTimerRef.current)
    repsTimerRef.current = setTimeout(() => onUpdateInput(inputKey, 'reps', v), INPUT_DEBOUNCE_MS)
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
        <View style={styles.setBadgeValidated}>
          <Ionicons name="checkmark" size={16} color={colors.background} />
        </View>
        <Text style={styles.validatedWeight}>{validated.weight}</Text>
        <Text style={styles.validatedUnit}>{weightUnit}</Text>
        <Text style={styles.validatedMultiply}>×</Text>
        <Text style={styles.validatedWeight}>{validated.reps}</Text>
        <Text style={styles.validatedUnit}>{t.workout.reps}</Text>
        {validated.isPr && (
          <View style={styles.prChip}>
            <Text style={styles.prBadge}>PR !</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => onUnvalidate(setOrder)}
          style={styles.undoBtn}
          testID="validate-btn"
          accessibilityRole="button"
          accessibilityLabel={t.accessibility.unvalidateSet + ' ' + setOrder}
        >
          <Ionicons name="arrow-undo-outline" size={14} color={colors.textSecondary} />
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
      <View style={styles.setBadge}>
        <Text style={styles.setBadgeText}>{setOrder}</Text>
      </View>
      <View style={[styles.inputBlock, weightError && styles.inputBlockError]}>
        <TextInput
          style={styles.inputField}
          value={localWeight}
          onChangeText={handleWeightChange}
          placeholder="0"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          textAlign="center"
          accessibilityLabel={t.accessibility.weightInput + ', ' + t.accessibility.validateSet + ' ' + setOrder}
        />
        <Text style={styles.inputSuffix}>{weightUnit}</Text>
      </View>
      <View style={[styles.inputBlock, styles.inputBlockReps, repsError && styles.inputBlockError]}>
        <TextInput
          style={styles.inputField}
          value={localReps}
          onChangeText={handleRepsChange}
          placeholder={repsTarget ?? '6-8'}
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          textAlign="center"
          accessibilityLabel={t.accessibility.repsInput + ', ' + t.accessibility.validateSet + ' ' + setOrder}
        />
        <Text style={styles.inputSuffix}>{t.workout.reps}</Text>
      </View>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.validateBtn, valid && styles.validateBtnReady, !valid && styles.validateBtnDisabled]}
          onPress={handleValidate}
          disabled={!valid}
          activeOpacity={0.7}
          testID="validate-btn"
          accessibilityRole="button"
          accessibilityLabel={t.accessibility.validateSet + ' ' + setOrder}
          accessibilityState={{ disabled: !valid }}
        >
          <Ionicons name="checkmark" size={22} color={valid ? colors.primary : colors.border} />
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
  isProgressionApplied,
}) => {
  const { colors, neuShadow } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const haptics = useHaptics()
  const { t } = useLanguage()
  const { convertWeight, weightUnit, unitMode } = useUnits()
  const [isEditingSessionNote, setIsEditingSessionNote] = React.useState(false)
  const sessionNoteRef = React.useRef(sessionExercise.notes ?? '')

  // Sync ref when sessionExercise changes (FlatList recycles views)
  React.useEffect(() => {
    sessionNoteRef.current = sessionExercise.notes ?? ''
  }, [sessionExercise.id, sessionExercise.notes])

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
        sessionExercise.repsTarget,
        unitMode,
      )
    : null

  const handleSaveSessionNote = async () => {
    setIsEditingSessionNote(false)
    if (sessionNoteRef.current !== (sessionExercise.notes ?? '')) {
      try {
        await updateSessionExerciseNotes(sessionExercise, sessionNoteRef.current)
      } catch (e) {
        if (__DEV__) console.error('handleSaveSessionNote error:', e)
      }
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
        neuShadow.elevated,
        { borderLeftColor: isComplete ? colors.primary : 'transparent' },
      ]}
    >
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {exercise.muscles?.length > 0 && (
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText} numberOfLines={2}>
            {(t.workoutTips as Record<string, string>)[getTipKeyForExercise(exercise.id, exercise.muscles)] ?? ''}
          </Text>
        </View>
      )}
      {exercise.notes ? (
        <Text style={styles.exerciseNoteText}>
          {t.workout.exerciseNote} : {exercise.notes}
        </Text>
      ) : null}
      {isEditingSessionNote ? (
        <TextInput
          defaultValue={sessionExercise.notes ?? ''}
          onChangeText={val => { sessionNoteRef.current = val }}
          onBlur={handleSaveSessionNote}
          placeholder={t.workout.sessionNotePlaceholder}
          placeholderTextColor={colors.placeholder}
          style={styles.noteInput}
          autoFocus
          multiline
          accessibilityLabel={t.workout.sessionNotePlaceholder}
        />
      ) : sessionExercise.notes ? (
        <TouchableOpacity
          onPress={() => setIsEditingSessionNote(true)}
          accessibilityRole="button"
          accessibilityLabel={t.common.edit + ' ' + t.common.notes}
        >
          <Text style={styles.noteText}>{sessionExercise.notes}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => { haptics.onPress(); setIsEditingSessionNote(true) }}
          style={styles.addNoteButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t.common.add + ' ' + t.common.notes}
        >
          <Ionicons name="create-outline" size={12} color={colors.primary} />
          <Text style={styles.addNoteLink}>{t.workout.addSessionNote}</Text>
        </TouchableOpacity>
      )}
      {sessionExercise.setsTarget != null && (
        <Text style={styles.target}>
          {t.workout.targetLabel} : {sessionExercise.setsTarget}×{sessionExercise.repsTarget ?? '?'} {t.workout.reps}
        </Text>
      )}
      {lastPerformance && (
        <Text style={styles.lastPerfText}>
          {t.workout.lastPerfLabel} {convertWeight(lastPerformance.avgWeight)} {weightUnit} × {lastPerformance.avgReps} {t.workout.lastPerfOn} {lastPerformance.setsCount} {lastPerformance.setsCount > 1 ? t.workout.lastPerfSets : t.workout.lastPerfSet}
        </Text>
      )}
      {suggestion && (
        isProgressionApplied ? (
          <View style={styles.progressionBadge}>
            <Text style={styles.progressionBadgeText}>
              {t.workout.progressionApplied} ({suggestion.label})
            </Text>
          </View>
        ) : (
          <Text style={styles.suggestionText}>
            {t.workout.suggestionLabel} : {suggestion.label}
          </Text>
        )
      )}
      {setsCount === 0 ? (
        <Text style={styles.noSetsText}>{t.workout.noSetsMessage}</Text>
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
  }) => {
    const exercise$ = sessionExercise.exercise.observe()
    return {
      exercise: exercise$,
      lastPerformance: exercise$.pipe(
        switchMap(exercise =>
          from(getLastPerformanceForExercise(exercise.id, historyId ?? ''))
        ),
        catchError(err => {
          if (__DEV__) console.error('WorkoutExerciseCard: lastPerformance error', err)
          return of(null)
        })
      ),
    }
  }
)(WorkoutExerciseCardContent)

// --- Styles ---

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderLeftWidth: 3,
    },
    exerciseName: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    tipRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    tipIcon: {
      fontSize: fontSize.xs,
    },
    tipText: {
      flex: 1,
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      lineHeight: 16,
      fontStyle: 'italic' as const,
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
      color: colors.warning,
      fontSize: fontSize.xs,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    progressionBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary + '26',
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
    },
    progressionBadgeText: {
      color: colors.primary,
      fontSize: fontSize.caption,
      fontWeight: '700',
    },
    exerciseNoteText: {
      color: colors.placeholder,
      fontSize: fontSize.xs,
      fontStyle: 'italic',
      marginBottom: spacing.xs,
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
    addNoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-start',
      marginBottom: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.primary + '40',
    },
    addNoteLink: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: '500',
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
      paddingVertical: spacing.ms,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    setRowValidated: {
      backgroundColor: colors.primary + '18',
      borderRadius: borderRadius.sm,
    },

    // Badge circulaire numerote (etat non valide)
    setBadge: {
      width: SET_BADGE_SIZE,
      height: SET_BADGE_SIZE,
      borderRadius: SET_BADGE_SIZE / 2,
      backgroundColor: colors.cardSecondary,
      borderWidth: 1.5,
      borderColor: colors.border + '60',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Badge avec checkmark (etat valide)
    setBadgeValidated: {
      width: SET_BADGE_SIZE,
      height: SET_BADGE_SIZE,
      borderRadius: SET_BADGE_SIZE / 2,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    setBadgeText: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: '700',
    },

    // Unified input block (input + suffix together)
    inputBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border + '30',
      paddingRight: spacing.xs,
      flex: 1,
    },
    inputBlockReps: {
      flex: 1,
    },
    inputBlockError: {
      borderColor: colors.danger,
    },
    inputField: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      textAlign: 'center',
    },
    inputSuffix: {
      color: colors.placeholder,
      fontSize: fontSize.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Validate button
    validateBtn: {
      width: VALIDATE_BTN_SIZE,
      height: VALIDATE_BTN_SIZE,
      borderRadius: borderRadius.lg,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    validateBtnReady: {
      backgroundColor: colors.primaryBg,
      borderColor: colors.primary,
    },
    validateBtnDisabled: {
      borderColor: colors.border + '50',
      backgroundColor: 'transparent',
    },

    // Undo button (validated state)
    undoBtn: {
      width: UNDO_BTN_SIZE,
      height: UNDO_BTN_SIZE,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
    },

    // Validated state text
    validatedWeight: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      fontWeight: '800',
    },
    validatedUnit: {
      color: colors.textSecondary,
      fontSize: fontSize.caption,
      fontWeight: '600',
      marginLeft: 2,
    },
    validatedMultiply: {
      color: colors.placeholder,
      fontSize: fontSize.sm,
      fontWeight: '400',
      marginHorizontal: spacing.xs,
    },
    prChip: {
      backgroundColor: colors.primary + '25',
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginLeft: spacing.xs,
    },
    prBadge: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  })
}
