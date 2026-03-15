import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ViewShot from 'react-native-view-shot'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { ShareBottomSheet } from './ShareBottomSheet'
import ShareCard from './ShareCard'
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

function formatWeight(w: number): string {
  return w % 1 === 0 ? `${w}` : `${w.toFixed(1)}`
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

  const handleNoteChange = (text: string) => {
    noteRef.current = text
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (historyId) updateHistoryNote(historyId, text).catch(e => { if (__DEV__) console.error('[WorkoutSummarySheet] updateHistoryNote (debounce):', e) })
    }, NOTE_DEBOUNCE_MS)
  }

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
      }, t)
      await shareText(text)
    } catch (e) {
      if (__DEV__) console.warn('[WorkoutSummarySheet] shareText error:', e)
    }
  }, [shareSheet, durationSeconds, totalVolume, totalSets, totalPrs, xpGained, level, currentStreak, newBadges, recapExercises, t])

  const handleShareImage = useCallback(async () => {
    shareSheet.close()
    try {
      await shareImage(viewShotRef)
    } catch (e) {
      if (__DEV__) console.warn('[WorkoutSummarySheet] shareImage error:', e)
    }
  }, [shareSheet])

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
  const exercisesWithDelta = recapExercises.filter(
    e => e.prevMaxWeight > 0 && e.currMaxWeight !== e.prevMaxWeight
  )

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={t.workoutSummary.title}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Section Gratitude ── */}
        {!gratitudeSubmitted && (
          <View style={styles.gratitudeSection}>
            <Text style={styles.gratitudeQuestion}>{t.gratitude.question}</Text>
            <View style={styles.emojiRow}>
              {['💪', '🔥', '😌', '😤'].map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiBtn,
                    selectedEmoji === emoji && styles.emojiBtnActive,
                  ]}
                  onPress={() => {
                    haptics.onSelect()
                    setSelectedEmoji(prev => prev === emoji ? null : emoji)
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedEmoji && (
              <>
                <TextInput
                  style={styles.gratitudeInput}
                  placeholder={t.gratitude.placeholder}
                  placeholderTextColor={colors.placeholder}
                  value={gratitudeNote}
                  onChangeText={setGratitudeNote}
                  maxLength={120}
                  multiline
                />
                <TouchableOpacity
                  style={styles.gratitudeSubmitBtn}
                  onPress={() => {
                    haptics.onSuccess()
                    setGratitudeSubmitted(true)
                  }}
                >
                  <Text style={styles.gratitudeSubmitText}>{t.gratitude.save}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {gratitudeSubmitted && (
          <View style={styles.gratitudeDoneRow}>
            <Text style={styles.gratitudeDoneText}>{selectedEmoji} {t.gratitude.saved}</Text>
          </View>
        )}

        <View style={styles.sectionDivider} />

        {/* ── Section Intensité ── */}
        {intensity && (
          <>
            <View style={styles.intensitySection}>
              <Text style={styles.intensityTitle}>{t.intensity.title}</Text>
              <View style={styles.intensityScoreRow}>
                <Text style={[styles.intensityScore, { color: intensity.color }]}>
                  {intensity.score}
                </Text>
                <Text style={[styles.intensityLabel, { color: intensity.color }]}>
                  {t.intensity.levels[intensity.label]}
                </Text>
              </View>
              <View style={styles.intensityBarBg}>
                <View style={[
                  styles.intensityBarFill,
                  { width: `${intensity.score}%`, backgroundColor: intensity.color },
                ]} />
              </View>
              <View style={styles.intensityBreakdown}>
                <Text style={styles.intensityBreakdownItem}>
                  {t.intensity.volume}: {intensity.breakdown.volumeScore}/33
                </Text>
                <Text style={styles.intensityBreakdownItem}>
                  {t.intensity.prs}: {intensity.breakdown.prScore}/33
                </Text>
                <Text style={styles.intensityBreakdownItem}>
                  {t.intensity.effort}: {intensity.breakdown.effortScore}/34
                </Text>
              </View>
            </View>
            <View style={styles.sectionDivider} />
          </>
        )}

        {/* ── Section Comparaison ── */}
        {comparison?.hasComparison && (
          <>
            <View style={styles.comparisonSection}>
              <Text style={styles.comparisonTitle}>{t.sessionComparison.title}</Text>

              <View style={styles.comparisonOverall}>
                <Text style={styles.comparisonOverallLabel}>{t.sessionComparison.totalVolume}</Text>
                <Text style={[
                  styles.comparisonOverallDelta,
                  { color: comparison.overallVolumeDelta >= 0 ? colors.primary : colors.danger }
                ]}>
                  {comparison.overallVolumeDelta >= 0 ? '↑' : '↓'}
                  {' '}{Math.abs(comparison.overallVolumeDeltaPercent).toFixed(1)}%
                  {' '}({comparison.overallVolumeDelta >= 0 ? '+' : ''}{Math.round(comparison.overallVolumeDelta)} kg)
                </Text>
              </View>

              {comparison.exercises.filter(e => e.deltas).map((ex) => (
                <View key={ex.exerciseId} style={styles.comparisonExRow}>
                  <Text style={styles.comparisonExName} numberOfLines={1}>{ex.exerciseName}</Text>
                  <View style={styles.comparisonExDeltas}>
                    <Text style={[
                      styles.comparisonExDelta,
                      { color: ex.deltas!.volume >= 0 ? colors.primary : colors.danger }
                    ]}>
                      {ex.deltas!.volume >= 0 ? '+' : ''}{Math.round(ex.deltas!.volume)} kg
                    </Text>
                    {ex.deltas!.maxWeight !== 0 && (
                      <Text style={[
                        styles.comparisonExDelta,
                        { color: ex.deltas!.maxWeight >= 0 ? colors.primary : colors.danger }
                      ]}>
                        max {ex.deltas!.maxWeight >= 0 ? '+' : ''}{ex.deltas!.maxWeight} kg
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.sectionDivider} />
          </>
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
          <StatBlock label={t.workoutSummary.volume} value={`${totalVolume.toFixed(1)} kg`} icon="barbell-outline" colors={colors} />
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

        {/* Section "Ce que tu as fait" */}
        {recapExercises.length > 0 && (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>{t.workoutSummary.sectionDone}</Text>
            {recapExercises.map((exo, idx) => {
              const isComplete = exo.setsValidated >= exo.setsTarget && exo.setsTarget > 0
              return (
                <View key={idx} style={styles.exoRow}>
                  <View style={styles.exoHeader}>
                    <Text style={styles.exoName}>{exo.exerciseName}</Text>
                    {exo.setsTarget > 0 && (
                      isComplete
                        ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                        : <Text style={styles.incompleteBadge}>
                            {exo.setsValidated}/{exo.setsTarget}
                          </Text>
                    )}
                  </View>
                  <Text style={styles.exoSets}>
                    {exo.sets.map(s => `${s.reps}×${formatWeight(s.weight)} kg`).join('  ·  ')}
                  </Text>
                </View>
              )
            })}
          </>
        )}

        {/* Section "Progression" */}
        {recapExercises.length > 0 && (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>{t.workoutSummary.sectionProgression}</Text>

            {/* Delta volume total */}
            {recapComparison.prevVolume === null ? (
              <Text style={styles.progressionFirstTime}>{t.workoutSummary.firstSession}</Text>
            ) : (
              <View style={styles.progressionVolRow}>
                <Text style={styles.progressionLabel}>{t.workoutSummary.totalVolume}</Text>
                {recapComparison.volumeGain > 0 ? (
                  <View style={styles.row}>
                    <Text style={[styles.progressionDelta, { color: colors.primary }]}>
                      +{recapComparison.volumeGain.toFixed(1)} kg
                    </Text>
                    <Ionicons name="chevron-up-outline" size={12} color={colors.primary} />
                  </View>
                ) : recapComparison.volumeGain < 0 ? (
                  <View style={styles.row}>
                    <Text style={[styles.progressionDelta, { color: colors.danger }]}>
                      {recapComparison.volumeGain.toFixed(1)} kg
                    </Text>
                    <Ionicons name="chevron-down-outline" size={12} color={colors.danger} />
                  </View>
                ) : (
                  <Text style={[styles.progressionDelta, { color: colors.textSecondary }]}>
                    {t.workoutSummary.sameVolume}
                  </Text>
                )}
              </View>
            )}

            {/* Delta poids max par exercice */}
            {exercisesWithDelta.map((exo, idx) => (
              <View key={idx} style={styles.progressionExoRow}>
                <Text style={styles.progressionExoName}>{exo.exerciseName}</Text>
                <View style={styles.row}>
                  <Text style={[
                    styles.progressionDelta,
                    { color: exo.currMaxWeight > exo.prevMaxWeight ? colors.primary : colors.danger }
                  ]}>
                    {formatWeight(exo.prevMaxWeight)} → {formatWeight(exo.currMaxWeight)} kg
                  </Text>
                  <Ionicons
                    name={exo.currMaxWeight > exo.prevMaxWeight ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={12}
                    color={exo.currMaxWeight > exo.prevMaxWeight ? colors.primary : colors.danger}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.separator} />

        <Text style={styles.noteLabel}>{t.workoutSummary.noteLabel}</Text>
        <TextInput
          style={styles.noteInput}
          multiline
          numberOfLines={3}
          defaultValue=""
          onChangeText={handleNoteChange}
          placeholder={t.workoutSummary.notePlaceholder}
          placeholderTextColor={colors.placeholder}
          textAlignVertical="top"
        />

        <Button
          variant="secondary"
          size="md"
          fullWidth
          onPress={handleSharePress}
          enableHaptics={false}
        >
          {t.share.shareButton}
        </Button>

        <View style={{ height: spacing.sm }} />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleClose}
          enableHaptics={false}
        >
          {t.workoutSummary.finish}
        </Button>
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
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
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
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
    },
    exoRow: {
      marginBottom: spacing.sm,
    },
    exoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: 2,
    },
    exoName: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
      flex: 1,
    },
    incompleteBadge: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      backgroundColor: colors.cardSecondary,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
      borderRadius: borderRadius.sm,
    },
    exoSets: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    progressionFirstTime: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    progressionVolRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    progressionLabel: {
      color: colors.text,
      fontSize: fontSize.sm,
    },
    progressionDelta: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    progressionExoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    progressionExoName: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      flex: 1,
      marginRight: spacing.sm,
    },
    noteLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
    },
    noteInput: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.separator,
      color: colors.text,
      fontSize: fontSize.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
      minHeight: 80,
    },
    gratitudeSection: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    gratitudeQuestion: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emojiRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    emojiBtn: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardSecondary,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    emojiBtnActive: {
      backgroundColor: colors.primary + '33',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    emojiText: {
      fontSize: 26,
    },
    gratitudeInput: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.text,
      minHeight: 60,
      textAlignVertical: 'top' as const,
      marginBottom: spacing.sm,
    },
    gratitudeSubmitBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.xs,
      alignItems: 'center' as const,
    },
    gratitudeSubmitText: {
      fontSize: fontSize.sm,
      color: colors.background,
      fontWeight: '600',
    },
    gratitudeDoneRow: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center' as const,
    },
    gratitudeDoneText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    intensitySection: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    intensityTitle: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    intensityScoreRow: {
      flexDirection: 'row' as const,
      alignItems: 'baseline' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    intensityScore: {
      fontSize: fontSize.jumbo,
      fontWeight: '900',
    },
    intensityLabel: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    intensityBarBg: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: 3,
      marginBottom: spacing.sm,
      overflow: 'hidden' as const,
    },
    intensityBarFill: {
      height: '100%' as const,
      borderRadius: 3,
    },
    intensityBreakdown: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
    },
    intensityBreakdownItem: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    comparisonSection: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    comparisonTitle: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    comparisonOverall: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    comparisonOverallLabel: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
    comparisonOverallDelta: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    comparisonExRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.xs,
    },
    comparisonExName: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    comparisonExDeltas: {
      flexDirection: 'row' as const,
      gap: spacing.sm,
    },
    comparisonExDelta: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },
  })
}
