import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { updateHistoryNote } from '../model/utils/databaseHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { RecapExerciseData, RecapComparisonData } from '../types/workout'

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
  recapExercises: RecapExerciseData[]
  recapComparison: RecapComparisonData
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

interface StatBlockProps {
  label: string
  value: string
  icon: string
  colors: ThemeColors
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value, icon, colors }) => {
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <View style={styles.statBlock}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
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
    return { text: t.motivationProgress, color: colors.success }
  }
  return { text: t.motivationDefault, color: colors.success }
}

function formatWeight(w: number): string {
  return w % 1 === 0 ? `${w}` : `${w}`
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
  recapExercises,
  recapComparison,
}) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()
  const noteRef = useRef('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

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
    }, 500)
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

  const motivation = getMotivationMessage(totalPrs, recapComparison.volumeGain, colors, t.workoutSummary)

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
          <StatBlock label={t.workoutSummary.duration} value={formatDuration(durationSeconds)} icon="timer-outline" colors={colors} />
          <StatBlock label={t.workoutSummary.volume} value={`${totalVolume.toFixed(1)} kg`} icon="barbell-outline" colors={colors} />
          <StatBlock label={t.workoutSummary.sets} value={`${totalSets} ${t.workoutSummary.setsValidated}`} icon="checkmark-circle-outline" colors={colors} />
          <StatBlock label={t.workoutSummary.records} value={`${totalPrs} PR`} icon="trophy-outline" colors={colors} />
        </View>

        {/* Section gamification */}
        <View style={styles.gamificationSection}>
          <View style={styles.gamRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star-outline" size={14} color={colors.primary} />
              <Text style={styles.gamItem}>+{xpGained} XP</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="navigate-outline" size={14} color={colors.primary} />
              <Text style={styles.gamItem}>{t.workoutSummary.levelLabel} {level}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
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
                        ? <Ionicons name="checkmark-circle" size={18} color={colors.success} />
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.progressionDelta, { color: colors.success }]}>
                      +{recapComparison.volumeGain.toFixed(1)} kg
                    </Text>
                    <Ionicons name="chevron-up-outline" size={12} color={colors.success} />
                  </View>
                ) : recapComparison.volumeGain < 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[
                    styles.progressionDelta,
                    { color: exo.currMaxWeight > exo.prevMaxWeight ? colors.success : colors.danger }
                  ]}>
                    {formatWeight(exo.prevMaxWeight)} → {formatWeight(exo.currMaxWeight)} kg
                  </Text>
                  <Ionicons
                    name={exo.currMaxWeight > exo.prevMaxWeight ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={12}
                    color={exo.currMaxWeight > exo.prevMaxWeight ? colors.success : colors.danger}
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
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleClose}
          enableHaptics={false}
        >
          {t.workoutSummary.finish}
        </Button>
      </ScrollView>
    </BottomSheet>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      color: colors.success,
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
  })
}
