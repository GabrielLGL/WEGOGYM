import React, { useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { from, of } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import { validateSetInput } from '../model/utils/validationHelpers'
import { getLastPerformanceForExercise } from '../model/utils/databaseHelpers'
import { suggestProgression } from '../model/utils/progressionHelpers'
import { useHaptics } from '../hooks/useHaptics'
import { WorkoutSetRow } from './WorkoutExerciseCard'
import { spacing, borderRadius, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { SetInputData, ValidatedSetData, LastPerformance } from '../types/workout'

// --- Exercise letter colors (consistent palette) ---
const EXERCISE_LETTERS = ['A', 'B', 'C', 'D', 'E']

// --- Types ---

interface SupersetExerciseInfoContentProps {
  sessionExercise: SessionExercise
  exercise: Exercise
  lastPerformance: LastPerformance | null
  letter: string
  letterColor: string
}

interface WorkoutSupersetBlockProps {
  sessionExercises: SessionExercise[]
  supersetType: string
  historyId: string
  setInputs: Record<string, SetInputData>
  validatedSets: Record<string, ValidatedSetData>
  onUpdateInput: (key: string, field: 'weight' | 'reps', value: string) => void
  onValidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<void>
  onUnvalidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<boolean>
}

// --- SupersetExerciseInfo (compact header per exercise) ---

const SupersetExerciseInfoContent: React.FC<SupersetExerciseInfoContentProps> = ({
  sessionExercise,
  exercise,
  lastPerformance,
  letter,
  letterColor,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()

  const suggestion = lastPerformance
    ? suggestProgression(
        lastPerformance.avgWeight,
        lastPerformance.avgReps,
        sessionExercise.repsTarget
      )
    : null

  return (
    <View style={styles.exerciseInfoRow}>
      <View style={[styles.letterBadge, { borderColor: letterColor }]}>
        <Text style={[styles.letterBadgeText, { color: letterColor }]}>{letter}</Text>
      </View>
      <View style={styles.exerciseInfoContent}>
        <Text style={styles.exerciseInfoName} numberOfLines={1}>{exercise.name}</Text>
        <View style={styles.exerciseInfoMeta}>
          {sessionExercise.setsTarget != null && (
            <Text style={styles.exerciseInfoMetaText}>
              {t.workout.targetLabel}: {sessionExercise.setsTarget}×{sessionExercise.repsTarget ?? '?'}
            </Text>
          )}
          {lastPerformance && (
            <Text style={styles.exerciseInfoMetaText}>
              {t.workout.lastPerfLabel} {lastPerformance.avgWeight}kg × {lastPerformance.avgReps}
            </Text>
          )}
        </View>
        {suggestion && (
          <Text style={styles.exerciseInfoSuggestion}>
            {t.workout.suggestionLabel}: {suggestion.label}
          </Text>
        )}
      </View>
    </View>
  )
}

const SupersetExerciseInfo = withObservables(
  ['sessionExercise', 'historyId'],
  ({
    sessionExercise,
    historyId,
  }: {
    sessionExercise: SessionExercise
    historyId: string
    letter: string
    letterColor: string
  }) => {
    const exercise$ = sessionExercise.exercise.observe()
    return {
      exercise: exercise$,
      lastPerformance: exercise$.pipe(
        switchMap(exercise =>
          from(getLastPerformanceForExercise(exercise.id, historyId ?? ''))
        ),
        catchError(err => {
          if (__DEV__) console.error('SupersetExerciseInfo: lastPerformance error', err)
          return of(null)
        })
      ),
    }
  }
)(SupersetExerciseInfoContent)

// --- Interleaved set row with exercise label ---

interface SupersetSetRowWrapperProps {
  letter: string
  letterColor: string
  sessionExercise: SessionExercise
  setOrder: number
  setInputs: Record<string, SetInputData>
  validatedSets: Record<string, ValidatedSetData>
  onUpdateInput: (key: string, field: 'weight' | 'reps', value: string) => void
  onValidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<void>
  onUnvalidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<boolean>
}

const SupersetSetRowWrapper = React.memo(function SupersetSetRowWrapper({
  letter,
  letterColor,
  sessionExercise,
  setOrder,
  setInputs,
  validatedSets,
  onUpdateInput,
  onValidateSet,
  onUnvalidateSet,
}: SupersetSetRowWrapperProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const haptics = useHaptics()

  const key = `${sessionExercise.id}_${setOrder}`
  const input = setInputs[key] ?? { weight: '', reps: '' }
  const validated = validatedSets[key]

  const handleValidate = useCallback(
    async (order: number, weight: string, reps: string) => {
      const { valid } = validateSetInput(weight, reps)
      if (!valid) { haptics.onError(); return }
      haptics.onSuccess()
      await onValidateSet(sessionExercise, order)
    },
    [haptics, onValidateSet, sessionExercise]
  )

  const handleUnvalidate = useCallback(
    async (order: number) => {
      haptics.onDelete()
      await onUnvalidateSet(sessionExercise, order)
    },
    [haptics, onUnvalidateSet, sessionExercise]
  )

  return (
    <View style={styles.setRowWithLabel}>
      <View style={[styles.setLetterBadge, { backgroundColor: letterColor + '20', borderColor: letterColor }]}>
        <Text style={[styles.setLetterText, { color: letterColor }]}>{letter}</Text>
      </View>
      <View style={styles.setRowContent}>
        <WorkoutSetRow
          setOrder={setOrder}
          inputKey={key}
          input={input}
          validated={validated}
          onUpdateInput={onUpdateInput}
          repsTarget={sessionExercise.repsTarget}
          onValidate={handleValidate}
          onUnvalidate={handleUnvalidate}
        />
      </View>
    </View>
  )
})

// --- Main SupersetBlock ---

export const WorkoutSupersetBlock: React.FC<WorkoutSupersetBlockProps> = ({
  sessionExercises,
  supersetType,
  historyId,
  setInputs,
  validatedSets,
  onUpdateInput,
  onValidateSet,
  onUnvalidateSet,
}) => {
  const { colors, neuShadow } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()

  const color = supersetType === 'circuit' ? colors.warning : colors.primary
  const icon = supersetType === 'circuit' ? 'repeat' as const : 'swap-horizontal' as const
  const label = supersetType === 'circuit' ? t.workout.circuitRound : t.workout.supersetRound
  const count = sessionExercises.length

  // Max sets across all exercises in the group
  const maxSets = Math.max(...sessionExercises.map(se => se.setsTarget ?? 0))
  const rounds = Array.from({ length: maxSets }, (_, i) => i + 1)

  // Exercise letter colors: alternate between primary shades
  const exerciseColors = useMemo(() => {
    const palette = [colors.primary, colors.warning, colors.danger, colors.textSecondary]
    return sessionExercises.map((_, i) => palette[i % palette.length])
  }, [sessionExercises.length, colors])

  return (
    <View style={[styles.block, neuShadow.elevated, { borderLeftColor: color }]}>
      {/* Header banner */}
      <View style={[styles.blockHeader, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.blockHeaderText, { color }]}>
          {label} ({count})
        </Text>
      </View>

      {/* Compact exercise info headers */}
      {sessionExercises.map((se, i) => (
        <SupersetExerciseInfo
          key={se.id}
          sessionExercise={se}
          historyId={historyId}
          letter={EXERCISE_LETTERS[i] ?? String(i + 1)}
          letterColor={exerciseColors[i]}
        />
      ))}

      {/* Separator */}
      <View style={[styles.blockSeparator, { backgroundColor: color + '30' }]} />

      {/* Interleaved set rows */}
      {rounds.map(roundNum => (
        <View key={roundNum}>
          <View style={styles.roundHeader}>
            <View style={[styles.roundHeaderLine, { backgroundColor: colors.border + '50' }]} />
            <Text style={styles.roundHeaderText}>
              {t.workout.roundLabel} {roundNum}
            </Text>
            <View style={[styles.roundHeaderLine, { backgroundColor: colors.border + '50' }]} />
          </View>
          {sessionExercises.map((se, exIdx) => {
            if ((se.setsTarget ?? 0) < roundNum) return null
            return (
              <SupersetSetRowWrapper
                key={`${se.id}_${roundNum}`}
                letter={EXERCISE_LETTERS[exIdx] ?? String(exIdx + 1)}
                letterColor={exerciseColors[exIdx]}
                sessionExercise={se}
                setOrder={roundNum}
                setInputs={setInputs}
                validatedSets={validatedSets}
                onUpdateInput={onUpdateInput}
                onValidateSet={onValidateSet}
                onUnvalidateSet={onUnvalidateSet}
              />
            )
          })}
        </View>
      ))}
    </View>
  )
}

// --- Styles ---

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    block: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderLeftWidth: 4,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    blockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    blockHeaderText: {
      fontSize: fontSize.sm,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    blockSeparator: {
      height: 1,
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm,
    },

    // Exercise info header
    exerciseInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    letterBadge: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    letterBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: '800',
    },
    exerciseInfoContent: {
      flex: 1,
    },
    exerciseInfoName: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
    },
    exerciseInfoMeta: {
      flexDirection: 'row',
      gap: spacing.ms,
      flexWrap: 'wrap',
    },
    exerciseInfoMetaText: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    exerciseInfoSuggestion: {
      color: colors.warning,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },

    // Round header
    roundHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    roundHeaderLine: {
      flex: 1,
      height: 1,
    },
    roundHeaderText: {
      color: colors.textSecondary,
      fontSize: fontSize.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Set row with label
    setRowWithLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: spacing.sm,
      gap: spacing.xs,
    },
    setLetterBadge: {
      width: 22,
      height: 22,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    setLetterText: {
      fontSize: fontSize.caption,
      fontWeight: '800',
    },
    setRowContent: {
      flex: 1,
    },
  })
}
