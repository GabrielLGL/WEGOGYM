import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { Model } from '@nozbe/watermelondb'
import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Session from '../model/models/Session'
import Exercise from '../model/models/Exercise'
import {
  softDeleteHistory,
  addRetroactiveSet,
  recalculateSetPrs,
  recalculateSetPrsBatch,
} from '../model/utils/databaseHelpers'
import { DEFAULT_REPS, MINUTE_MS } from '../model/constants'
import { AlertDialog } from '../components/AlertDialog'
import { Button } from '../components/Button'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { RootStackParamList } from '../navigation'

type HistoryDetailRouteProp = RouteProp<RootStackParamList, 'HistoryDetail'>
type HistoryDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'HistoryDetail'>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the exercise FK from a Set model without fetching the relation. */
const getExerciseId = (s: WorkoutSet): string => s.exercise.id

// ─── Types ───────────────────────────────────────────────────────────────────

interface SetEdit {
  weight: string
  reps: string
}

interface GroupedSets {
  exerciseId: string
  sets: WorkoutSet[]
}

interface ContentProps {
  history: History
  sets: WorkoutSet[]
  session: Session
}

// ─── Inner content (receives withObservables data) ───────────────────────────

function HistoryDetailContent({ history, sets, session }: ContentProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<HistoryDetailNavProp>()
  const dateLocale = language === 'fr' ? 'fr-FR' : 'en-US'

  // Local edit buffer: setId → { weight, reps }
  const [edits, setEdits] = useState<Record<string, SetEdit>>({})
  const [noteText, setNoteText] = useState(history.note ?? '')
  const [deleteSetTarget, setDeleteSetTarget] = useState<WorkoutSet | null>(null)
  const deleteWorkoutModal = useModalState()

  // Initialize edits from sets — merge with existing edits to preserve unsaved changes
  useEffect(() => {
    setEdits(prev => {
      const newEdits: Record<string, SetEdit> = {}
      for (const s of sets) {
        newEdits[s.id] = prev[s.id] ?? {
          weight: String(s.weight),
          reps: String(s.reps),
        }
      }
      return newEdits
    })
  }, [sets])

  // Sync note when history changes
  useEffect(() => {
    setNoteText(history.note ?? '')
  }, [history.note])

  // Group sets by exercise
  const grouped = useMemo<GroupedSets[]>(() => {
    const map = new Map<string, WorkoutSet[]>()
    for (const s of sets) {
      const exId = getExerciseId(s)
      if (!map.has(exId)) map.set(exId, [])
      map.get(exId)!.push(s)
    }
    const result: GroupedSets[] = []
    for (const [exId, exSets] of map) {
      result.push({
        exerciseId: exId,
        sets: exSets.sort((a, b) => a.setOrder - b.setOrder),
      })
    }
    return result
  }, [sets])

  // Check if anything was modified
  const hasChanges = useMemo(() => {
    if ((noteText ?? '') !== (history.note ?? '')) return true
    for (const s of sets) {
      const edit = edits[s.id]
      if (!edit) continue
      if (edit.weight !== String(s.weight) || edit.reps !== String(s.reps)) return true
    }
    return false
  }, [edits, sets, noteText, history.note])

  // Duration display
  const durationText = useMemo(() => {
    if (!history.endTime) return null
    const ms = history.endTime.getTime() - history.startTime.getTime()
    const mins = Math.round(ms / MINUTE_MS)
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`
  }, [history.startTime, history.endTime])

  const updateEdit = useCallback((setId: string, field: 'weight' | 'reps', value: string) => {
    setEdits(prev => ({
      ...prev,
      [setId]: { ...prev[setId], [field]: value },
    }))
  }, [])

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    try {
      const affectedExerciseIds = new Set<string>()

      await database.write(async () => {
        const batch: Model[] = []

        // Update modified sets
        for (const s of sets) {
          const edit = edits[s.id]
          if (!edit) continue
          const newWeight = parseFloat(edit.weight) || 0
          const newReps = parseInt(edit.reps, 10) || 0
          if (newWeight !== s.weight || newReps !== s.reps) {
            batch.push(
              s.prepareUpdate(rec => {
                rec.weight = newWeight
                rec.reps = newReps
              })
            )
            affectedExerciseIds.add(getExerciseId(s))
          }
        }

        // Update note if changed
        if ((noteText ?? '') !== (history.note ?? '')) {
          batch.push(
            history.prepareUpdate(h => {
              h.note = noteText
            })
          )
        }

        if (batch.length > 0) {
          await database.batch(...batch)
        }
      })

      // Recalculate PRs OUTSIDE of database.write() — concurrent (each targets different exercise)
      await recalculateSetPrsBatch([...affectedExerciseIds])

      haptics.onSuccess()
    } catch (e) {
      if (__DEV__) console.error('[HistoryDetailScreen] handleSave:', e)
    }
  }, [sets, edits, noteText, history, haptics])

  const handleAddSet = useCallback(async (exerciseId: string, existingSets: WorkoutSet[]) => {
    const lastSet = existingSets[existingSets.length - 1]
    const nextOrder = lastSet ? lastSet.setOrder + 1 : 1
    const defaultWeight = lastSet ? lastSet.weight : 0
    const defaultReps = lastSet ? lastSet.reps : DEFAULT_REPS

    try {
      await addRetroactiveSet({
        historyId: history.id,
        exerciseId,
        weight: defaultWeight,
        reps: defaultReps,
        setOrder: nextOrder,
      })
      haptics.onPress()
    } catch (e) {
      if (__DEV__) console.error('[HistoryDetailScreen] handleAddSet:', e)
    }
  }, [history.id, haptics])

  const handleDeleteSet = useCallback(async () => {
    if (!deleteSetTarget) return
    const exerciseId = getExerciseId(deleteSetTarget)

    try {
      await database.write(async () => {
        await deleteSetTarget.destroyPermanently()
      })
      // Recalculate PRs OUTSIDE of write
      await recalculateSetPrs(exerciseId)
      haptics.onDelete()
    } catch (e) {
      if (__DEV__) console.error('[HistoryDetailScreen] handleDeleteSet:', e)
    } finally {
      setDeleteSetTarget(null)
    }
  }, [deleteSetTarget, haptics])

  const handleDeleteWorkout = useCallback(async () => {
    try {
      await softDeleteHistory(history.id)
      haptics.onDelete()
      navigation.goBack()
    } catch (e) {
      if (__DEV__) console.error('[HistoryDetailScreen] handleDeleteWorkout:', e)
    } finally {
      deleteWorkoutModal.close()
    }
  }, [history.id, haptics, navigation])

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={styles.title}>{session.name || t.historyDetail.sessionFallback}</Text>
      <Text style={styles.subtitle}>
        {history.startTime.toLocaleDateString(dateLocale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
      {durationText && (
        <Text style={styles.duration}>
          {t.historyDetail.duration} : {durationText}
        </Text>
      )}

      {/* Note */}
      <View style={styles.noteCard}>
        <Text style={styles.noteLabel}>{t.historyDetail.noteLabel}</Text>
        <TextInput
          style={styles.noteInput}
          value={noteText}
          onChangeText={setNoteText}
          placeholder={t.historyDetail.notePlaceholder}
          placeholderTextColor={colors.placeholder}
          multiline
        />
      </View>

      {/* Exercises & Sets */}
      {grouped.map(group => (
        <ExerciseCard
          key={group.exerciseId}
          exerciseId={group.exerciseId}
          sets={group.sets}
          edits={edits}
          updateEdit={updateEdit}
          handleAddSet={handleAddSet}
          haptics={haptics}
          setDeleteSetTarget={setDeleteSetTarget}
          colors={colors}
          styles={styles}
          t={t}
        />
      ))}

      {/* Save button */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleSave}
        disabled={!hasChanges}
        style={styles.saveBtn}
      >
        {t.historyDetail.saveChanges}
      </Button>

      {/* Delete workout button */}
      <Button
        variant="danger"
        size="lg"
        onPress={() => {
          haptics.onPress()
          deleteWorkoutModal.open()
        }}
        style={styles.deleteBtn}
      >
        {t.historyDetail.deleteWorkout}
      </Button>

      {/* AlertDialog: delete set */}
      <AlertDialog
        visible={deleteSetTarget !== null}
        title={t.historyDetail.deleteSetTitle}
        message={t.historyDetail.deleteSetMessage}
        onConfirm={handleDeleteSet}
        onCancel={() => setDeleteSetTarget(null)}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        confirmColor={colors.danger}
      />

      {/* AlertDialog: delete workout */}
      <AlertDialog
        visible={deleteWorkoutModal.isOpen}
        title={t.historyDetail.deleteWorkoutTitle}
        message={t.historyDetail.deleteWorkoutMessage}
        onConfirm={handleDeleteWorkout}
        onCancel={() => deleteWorkoutModal.close()}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        confirmColor={colors.danger}
      />
    </ScrollView>
  )
}

// ─── ExerciseCard (reactive exercise name via withObservables) ───────────────

interface ExerciseCardInnerProps {
  exercise: Exercise
  sets: WorkoutSet[]
  edits: Record<string, SetEdit>
  updateEdit: (setId: string, field: 'weight' | 'reps', value: string) => void
  handleAddSet: (exerciseId: string, existingSets: WorkoutSet[]) => void
  haptics: ReturnType<typeof useHaptics>
  setDeleteSetTarget: (s: WorkoutSet) => void
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: ReturnType<typeof useLanguage>['t']
}

function ExerciseCardInner({
  exercise,
  sets,
  edits,
  updateEdit,
  handleAddSet,
  haptics,
  setDeleteSetTarget,
  colors,
  styles,
  t,
}: ExerciseCardInnerProps) {
  const exerciseInfo = [exercise.muscles?.join(', '), exercise.equipment].filter(Boolean).join(' · ')

  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {exerciseInfo !== '' && (
        <Text style={styles.exerciseInfo}>{exerciseInfo}</Text>
      )}

      {/* Set rows */}
      {sets.map(s => {
        const edit = edits[s.id]
        return (
          <View key={s.id} style={styles.setRow}>
            <Text style={styles.setLabel}>
              {t.historyDetail.set} {s.setOrder}
            </Text>
            <TextInput
              style={styles.setInput}
              value={edit?.weight ?? String(s.weight)}
              onChangeText={v => updateEdit(s.id, 'weight', v)}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <Text style={styles.setUnit}>kg</Text>
            <TextInput
              style={styles.setInput}
              value={edit?.reps ?? String(s.reps)}
              onChangeText={v => updateEdit(s.id, 'reps', v)}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <Text style={styles.setUnit}>{t.historyDetail.reps.toLowerCase()}</Text>
            <TouchableOpacity
              onPress={() => {
                haptics.onPress()
                setDeleteSetTarget(s)
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )
      })}

      {/* Add set button */}
      <TouchableOpacity
        style={styles.addSetBtn}
        onPress={() => handleAddSet(exercise.id, sets)}
      >
        <Text style={styles.addSetText}>{t.historyDetail.addSet}</Text>
      </TouchableOpacity>
    </View>
  )
}

const enhanceExerciseCard = withObservables(
  ['exerciseId'],
  ({ exerciseId }: { exerciseId: string }) => ({
    exercise: database.get<Exercise>('exercises').findAndObserve(exerciseId),
  }),
)

const ExerciseCard = enhanceExerciseCard(ExerciseCardInner)

// ─── Styles ──────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    duration: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    noteCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.lg,
    },
    noteLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    noteInput: {
      fontSize: fontSize.bodyMd,
      color: colors.text,
      minHeight: 60,
      textAlignVertical: 'top',
    },
    exerciseCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    exerciseName: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    exerciseInfo: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: spacing.sm,
    },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    setLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      width: 55,
    },
    setInput: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: fontSize.bodyMd,
      color: colors.text,
      textAlign: 'center',
      width: 60,
    },
    setUnit: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    addSetBtn: {
      paddingVertical: spacing.sm,
      marginTop: spacing.xs,
    },
    addSetText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    saveBtn: {
      marginTop: spacing.lg,
    },
    deleteBtn: {
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
  }), [colors])
}

// ─── withObservables layer 2: history → sets + session ───────────────────────

const enhanceContent = withObservables(
  ['history'],
  ({ history }: { history: History }) => ({
    history: history.observe(),
    sets: database
      .get<WorkoutSet>('sets')
      .query(Q.where('history_id', history.id))
      .observe(),
    session: history.session.observe(),
  }),
)

const EnhancedContent = enhanceContent(HistoryDetailContent)

// ─── withObservables layer 1: historyId → history ────────────────────────────

const enhanceWrapper = withObservables(
  ['historyId'],
  ({ historyId }: { historyId: string }) => ({
    history: database.get<History>('histories').findAndObserve(historyId),
  }),
)

function HistoryDetailInner({ history }: { history: History }) {
  return <EnhancedContent history={history} />
}

const EnhancedWrapper = enhanceWrapper(HistoryDetailInner)

// ─── Screen wrapper ──────────────────────────────────────────────────────────

export default function HistoryDetailScreen() {
  const route = useRoute<HistoryDetailRouteProp>()
  const { historyId } = route.params
  const colors = useColors()
  const mounted = useDeferredMount()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <EnhancedWrapper historyId={historyId} />}
    </View>
  )
}
