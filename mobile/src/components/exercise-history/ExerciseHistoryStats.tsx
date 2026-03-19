import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { spacing, borderRadius, fontSize } from '../../theme'
import type { ThemeColors } from '../../theme'
import type { Translations } from '../../i18n'
import type { ExerciseSessionStat } from '../../model/utils/exerciseStatsUtils'
import type { RepMaxEstimate } from '../../model/utils/repMaxHelpers'

interface ExerciseHistoryStatsProps {
  pr: { weight: number; reps: number } | null
  oneRM: number | null
  repMaxData: RepMaxEstimate | null
  statsForExercise: ExerciseSessionStat[]
  reversedStats: ExerciseSessionStat[]
  colors: ThemeColors
  t: Translations
  language: string
  onHistoryPress: (historyId: string) => void
}

function ExerciseHistoryStats({
  pr,
  oneRM,
  repMaxData,
  statsForExercise,
  reversedStats,
  colors,
  t,
  language,
  onHistoryPress,
}: ExerciseHistoryStatsProps) {
  const styles = useStyles(colors)
  const dateLocale = language === 'fr' ? 'fr-FR' : 'en-US'

  return (
    <>
      {/* PR Card */}
      <View style={styles.prCard}>
        <View style={styles.prHeader}>
          <Ionicons name="trophy-outline" size={20} color={colors.warning} />
          <Text style={styles.prTitle}>{t.exerciseHistory.pr}</Text>
        </View>
        {pr ? (
          <>
            <Text style={styles.prValue}>{pr.weight} {t.statsMeasurements.weightUnit} × {pr.reps} {t.workout.reps}</Text>
            <Text style={styles.prOneRM}>{t.exerciseHistory.prOneRM}{oneRM} {t.exerciseHistory.prOneRMUnit}</Text>
          </>
        ) : (
          <Text style={styles.prEmpty}>{t.exerciseHistory.prEmpty}</Text>
        )}
      </View>

      {/* Rep Max Estimator */}
      {repMaxData && (
        <View style={styles.repMaxCard}>
          <Text style={styles.repMaxTitle}>{t.exerciseHistory.repMax.title}</Text>
          <View style={styles.repMaxRow}>
            <View style={styles.repMaxStat}>
              <Text style={styles.repMaxValue}>{repMaxData.estimated1RM} {t.statsMeasurements.weightUnit}</Text>
              <Text style={styles.repMaxLabel}>{t.exerciseHistory.repMax.estimated1RM}</Text>
            </View>
            <View style={styles.repMaxStat}>
              <Text style={styles.repMaxValue}>{repMaxData.estimated3RM} {t.statsMeasurements.weightUnit}</Text>
              <Text style={styles.repMaxLabel}>{t.exerciseHistory.repMax.estimated3RM}</Text>
            </View>
            <View style={styles.repMaxStat}>
              <Text style={styles.repMaxValue}>{repMaxData.estimated5RM} {t.statsMeasurements.weightUnit}</Text>
              <Text style={styles.repMaxLabel}>{t.exerciseHistory.repMax.estimated5RM}</Text>
            </View>
          </View>
          <Text style={styles.repMaxBestSet}>
            {t.exerciseHistory.repMax.bestSet
              .replace('{weight}', String(repMaxData.bestWeight))
              .replace('{reps}', String(repMaxData.bestReps))}
          </Text>
          <Text style={styles.repMaxDisclaimer}>{t.exerciseHistory.repMax.disclaimer}</Text>
        </View>
      )}

      {/* History list */}
      <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
        {t.exerciseHistory.fullHistory} ({statsForExercise.length} {statsForExercise.length !== 1 ? t.home.sessions : t.home.session})
      </Text>

      {reversedStats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.exerciseHistory.noHistory}</Text>
        </View>
      ) : (
        <View style={styles.historyCard}>
          {reversedStats.map((stat, index) => (
            <View key={stat.historyId}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historySession}>{stat.sessionName}</Text>
                  <Text style={styles.historyDate}>
                    {stat.startTime.toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.historySets}>
                  {stat.sets.map((s, si) => (
                    <Text key={si} style={styles.setChip}>
                      {s.weight > 0 ? `${s.weight} ${t.statsMeasurements.weightUnit}` : t.exerciseHistory.bodyweight} × {s.reps}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => onHistoryPress(stat.historyId)}
                  style={styles.editBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  )
}

export default React.memo(ExerciseHistoryStats)

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    historySectionTitle: {
      marginTop: spacing.lg,
    },
    prCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    prHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    prTitle: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    prValue: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    prOneRM: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    prEmpty: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    repMaxCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    repMaxTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    repMaxRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: spacing.sm,
    },
    repMaxStat: {
      alignItems: 'center' as const,
      flex: 1,
    },
    repMaxValue: {
      fontSize: fontSize.md,
      fontWeight: '700' as const,
      color: colors.primary,
    },
    repMaxLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    repMaxBestSet: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
    },
    repMaxDisclaimer: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    historyInfo: {
      flex: 1,
    },
    historySession: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    historyDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    historySets: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      flex: 1,
      justifyContent: 'flex-end',
    },
    setChip: {
      fontSize: fontSize.xs,
      color: colors.primary,
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    editBtn: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  }), [colors])
}
