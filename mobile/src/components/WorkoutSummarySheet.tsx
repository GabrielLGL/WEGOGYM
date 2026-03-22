import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ViewShot from 'react-native-view-shot'
import { BottomSheet } from './BottomSheet'
import { ShareBottomSheet } from './ShareBottomSheet'
import ShareCard from './ShareCard'
import SummaryGratitude from './workout-summary/SummaryGratitude'
import SummaryIntensity from './workout-summary/SummaryIntensity'
import SummaryComparison from './workout-summary/SummaryComparison'
import SummaryExerciseList from './workout-summary/SummaryExerciseList'
import SummaryActions from './workout-summary/SummaryActions'
import { Q } from '@nozbe/watermelondb'
import { database } from '../model/index'
import { updateHistoryNote } from '../model/utils/databaseHelpers'
import type WorkoutSet from '../model/models/Set'
import { computeSessionIntensity } from '../model/utils/sessionIntensityHelpers'
import { computeSessionComparison } from '../model/utils/sessionComparisonHelpers'
import type { SessionComparison } from '../model/utils/sessionComparisonHelpers'
import { formatSecondsToMMSS } from '../model/utils/parseUtils'
import { generateWorkoutShareText, shareText, shareImage } from '../services/shareService'
import { useModalState } from '../hooks/useModalState'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUnits } from '../contexts/UnitContext'
import type { ThemeColors } from '../theme'
import type { RecapExerciseData, RecapComparisonData } from '../types/workout'

const NOTE_DEBOUNCE_MS = 500

interface WorkoutSummarySheetProps {
  visible: boolean
  onClose: () => void
  durationSeconds: number
  totalVolume: number
  totalSets: number
  totalPrs: number
  historyId: string
  xpGained: number
  level: number
  currentStreak: number
  newBadges?: { title: string; icon: string }[]
  recapExercises: RecapExerciseData[]
  recapComparison: RecapComparisonData
}

interface StatBlockProps {
  label: string
  value: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  colors: ThemeColors
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value, icon, colors }) => {
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <View style={styles.statBlock}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function getMotivationMessage(totalPrs: number, volumeGain: number, colors: ThemeColors, t: { motivationPR: string; motivationProgress: string; motivationDefault: string }): { text: string; color: string } {
  if (totalPrs > 0) {
    return { text: t.motivationPR, color: colors.primary }
  }
  if (volumeGain > 0) {
    return { text: t.motivationProgress, color: colors.warning }
  }
  return { text: t.motivationDefault, color: colors.textSecondary }
}

export const WorkoutSummarySheet: React.FC<WorkoutSummarySheetProps> = ({
  visible,
  onClose,
  durationSeconds,
  totalVolume,
  totalSets,
  totalPrs,
  historyId,
  xpGained,
  level,
  currentStreak,
  newBadges = [],
  recapExercises,
  recapComparison,
}) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()
  const { weightUnit, convertWeight } = useUnits()
  const noteRef = useRef('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const viewShotRef = useRef<ViewShot>(null)
  const shareSheet = useModalState()
  const haptics = useHaptics()

  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [gratitudeNote, setGratitudeNote] = useState('')
  const [gratitudeSubmitted, setGratitudeSubmitted] = useState(false)
  const [comparison, setComparison] = useState<SessionComparison | null>(null)

  useEffect(() => {
    if (!visible) {
      setSelectedEmoji(null)
      setGratitudeNote('')
      setGratitudeSubmitted(false)
      setComparison(null)
    }
  }, [visible])

  // Load historical sets for comparison
  useEffect(() => {
    if (!visible || recapExercises.length === 0 || !historyId) return

    const exerciseIds = [...new Set(recapExercises.map(e => e.exerciseId))]
    if (exerciseIds.length === 0) return

    let cancelled = false
    database.get<WorkoutSet>('sets')
      .query(
        Q.where('exercise_id', Q.oneOf(exerciseIds)),
        Q.on('histories', Q.and(
          Q.where('deleted_at', null),
          Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
        )),
        Q.sortBy('created_at', Q.desc),
        Q.take(500),
      )
      .fetch()
      .then(prevSets => {
        if (cancelled) return
        const currentSets = recapExercises.flatMap(e =>
          e.sets.map(s => ({ ...s, exerciseId: e.exerciseId })),
        )
        const exercises = recapExercises.map(e => ({ id: e.exerciseId, name: e.exerciseName }))
        const historicalSets = prevSets.map(s => ({
          weight: s.weight,
          reps: s.reps,
          exerciseId: s.exerciseId,
          historyId: s.historyId,
          createdAt: s.createdAt,
        }))
        const result = computeSessionComparison(currentSets, historicalSets, exercises, historyId)
        setComparison(result)
      })
      .catch(e => {
        if (__DEV__) console.error('[WorkoutSummarySheet] comparison fetch:', e)
      })

    return () => { cancelled = true }
  }, [visible, recapExercises, historyId])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleNoteChange = useCallback((text: string) => {
    noteRef.current = text
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (historyId) updateHistoryNote(historyId, text).catch(e => { if (__DEV__) console.error('[WorkoutSummarySheet] updateHistoryNote (debounce):', e) })
    }, NOTE_DEBOUNCE_MS)
  }, [historyId])

  const handleClose = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      if (historyId && noteRef.current) {
        updateHistoryNote(historyId, noteRef.current).catch(e => { if (__DEV__) console.error('[WorkoutSummarySheet] updateHistoryNote (flush):', e) })
      }
    }
    onClose()
  }, [historyId, onClose])

  const handleSharePress = useCallback(() => {
    haptics.onPress()
    shareSheet.open()
  }, [haptics, shareSheet])

  const handleShareText = useCallback(async () => {
    shareSheet.close()
    try {
      const text = generateWorkoutShareText({
        durationSeconds,
        totalVolume,
        totalSets,
        totalPrs,
        xpGained,
        level,
        currentStreak,
        newBadges,
        exerciseNames: recapExercises.map(e => e.exerciseName),
      }, t, weightUnit)
      await shareText(text)
    } catch (e) {
      if (__DEV__) console.warn('[WorkoutSummarySheet] shareText error:', e)
    }
  }, [shareSheet, durationSeconds, totalVolume, totalSets, totalPrs, xpGained, level, currentStreak, newBadges, recapExercises, t, weightUnit])

  const handleShareImage = useCallback(async () => {
    shareSheet.close()
    try {
      await shareImage(viewShotRef)
    } catch (e) {
      if (__DEV__) console.warn('[WorkoutSummarySheet] shareImage error:', e)
    }
  }, [shareSheet])

  const handleEmojiSelect = useCallback((emoji: string) => {
    haptics.onSelect()
    setSelectedEmoji(prev => prev === emoji ? null : emoji)
  }, [haptics])

  const handleGratitudeSubmit = useCallback(() => {
    haptics.onSuccess()
    setGratitudeSubmitted(true)
  }, [haptics])

  const motivation = getMotivationMessage(totalPrs, recapComparison.volumeGain, colors, t.workoutSummary)

  const intensity = useMemo(() => {
    if (totalSets === 0) return null
    return computeSessionIntensity(totalVolume, totalPrs, recapExercises, colors)
  }, [totalVolume, totalPrs, totalSets, recapExercises, colors])

  // Muscles uniques de tous les exercices
  const allMuscles = Array.from(
    new Set(recapExercises.flatMap(e => e.muscles))
  ).filter(m => m.trim().length > 0)

  // Exercices avec delta poids max (pour section Progression)
  const exercisesWithDelta = useMemo(() =>
    recapExercises.filter(e => e.prevMaxWeight > 0 && e.currMaxWeight !== e.prevMaxWeight),
    [recapExercises],
  )

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={t.workoutSummary.title}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <SummaryGratitude
          selectedEmoji={selectedEmoji}
          gratitudeNote={gratitudeNote}
          gratitudeSubmitted={gratitudeSubmitted}
          onEmojiSelect={handleEmojiSelect}
          onNoteChange={setGratitudeNote}
          onSubmit={handleGratitudeSubmit}
        />

        <View style={styles.sectionDivider} />

        {intensity && <SummaryIntensity intensity={intensity} />}

        {comparison?.hasComparison && (
          <SummaryComparison comparison={comparison} />
        )}

        {/* Message motivant */}
        <Text style={[styles.motivationText, { color: motivation.color }]}>
          {motivation.text}
        </Text>

        {/* Chips muscles travaillés */}
        {allMuscles.length > 0 && (
          <View style={styles.muscleChips}>
            {allMuscles.map(muscle => (
              <View key={muscle} style={styles.muscleChip}>
                <Text style={styles.muscleChipText}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats grid 2×2 */}
        <View style={styles.statsGrid}>
          <StatBlock label={t.workoutSummary.duration} value={formatSecondsToMMSS(durationSeconds)} icon="timer-outline" colors={colors} />
          <StatBlock label={t.workoutSummary.volume} value={`${convertWeight(totalVolume).toFixed(1)} ${weightUnit}`} icon="barbell-outline" colors={colors} />
          <StatBlock label={t.workoutSummary.sets} value={`${totalSets} ${t.workoutSummary.setsValidated}`} icon="checkmark-circle-outline" colors={colors} />
          <StatBlock label={t.workoutSummary.records} value={`${totalPrs} PR`} icon="trophy-outline" colors={colors} />
        </View>

        {/* Section gamification */}
        <View style={styles.gamificationSection}>
          <View style={styles.gamRow}>
            <View style={styles.row}>
              <Ionicons name="star-outline" size={14} color={colors.primary} />
              <Text style={styles.gamItem}>+{xpGained} XP</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="navigate-outline" size={14} color={colors.primary} />
              <Text style={styles.gamItem}>{t.workoutSummary.levelLabel} {level}</Text>
            </View>
          </View>
          <View style={[styles.row, { justifyContent: 'center' }]}>
            <Ionicons name="flame-outline" size={14} color={colors.primary} />
            <Text style={[styles.gamItem, styles.gamCenter]}>{t.workoutSummary.streakLabel} {currentStreak}</Text>
          </View>
        </View>

        <SummaryExerciseList
          recapExercises={recapExercises}
          recapComparison={recapComparison}
          exercisesWithDelta={exercisesWithDelta}
        />

        <SummaryActions
          onNoteChange={handleNoteChange}
          onSharePress={handleSharePress}
          onClose={handleClose}
        />
      </ScrollView>

      {/* Off-screen ViewShot for image capture */}
      <View style={{ position: 'absolute', left: -9999 }}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <ShareCard
            variant="workout"
            durationSeconds={durationSeconds}
            totalVolume={totalVolume}
            totalSets={totalSets}
            totalPrs={totalPrs}
            xpGained={xpGained}
            level={level}
            currentStreak={currentStreak}
            newBadges={newBadges}
          />
        </ViewShot>
      </View>

      <ShareBottomSheet
        visible={shareSheet.isOpen}
        onClose={shareSheet.close}
        onShareText={handleShareText}
        onShareImage={handleShareImage}
      />
    </BottomSheet>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    motivationText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    muscleChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    muscleChip: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    muscleChipText: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: '500',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statBlock: {
      width: '47.5%',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      alignItems: 'center',
    },
    statValue: {
      color: colors.text,
      fontSize: fontSize.xxxl,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    gamificationSection: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    gamRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    gamItem: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    gamCenter: {
      textAlign: 'center',
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
  })
}
