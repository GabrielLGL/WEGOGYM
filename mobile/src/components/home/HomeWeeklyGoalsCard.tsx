import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import { computeWeeklyGoals } from '../../model/utils/weeklyGoalsHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface HomeWeeklyGoalsCardProps {
  histories: History[]
  sets: WorkoutSet[]
}

export function HomeWeeklyGoalsCard({ histories, sets }: HomeWeeklyGoalsCardProps) {
  const colors = useColors()
  const { t, language } = useLanguage()
  const styles = useStyles(colors)

  const weeklyGoals = useMemo(() => {
    const mappedHistories = histories.map(h => ({
      id: h.id,
      startTime: h.startTime,
      deletedAt: h.deletedAt,
      isAbandoned: h.isAbandoned,
    }))
    const mappedSets = sets.map(s => ({
      weight: s.weight,
      reps: s.reps,
      historyId: s.history.id,
    }))
    return computeWeeklyGoals(mappedHistories, mappedSets, language)
  }, [histories, sets, language])

  return (
    <View style={styles.goalsCard}>
      <View style={styles.goalsHeader}>
        <Text style={styles.goalsTitle}>{t.home.weeklyGoals.title}</Text>
        <Text style={styles.goalsWeekLabel}>
          {weeklyGoals.completed
            ? t.home.weeklyGoals.completed
            : `${weeklyGoals.daysRemaining} ${t.home.weeklyGoals.daysLeft}`}
        </Text>
      </View>
      {/* Sessions */}
      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>{t.home.weeklyGoals.sessions}</Text>
        <Text style={styles.goalValue}>{weeklyGoals.sessionsCount}/{weeklyGoals.sessionsTarget}</Text>
      </View>
      <View style={styles.goalBarTrack}>
        <View style={[
          styles.goalBarFill,
          {
            width: `${weeklyGoals.sessionsPct}%`,
            backgroundColor: weeklyGoals.sessionsPct >= 100 ? colors.success : colors.primary,
          },
        ]} />
      </View>
      {/* Volume */}
      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>{t.home.weeklyGoals.volume}</Text>
        <Text style={styles.goalValue}>
          {weeklyGoals.volumeKg >= 1000
            ? `${(weeklyGoals.volumeKg / 1000).toFixed(1)}t`
            : `${weeklyGoals.volumeKg} kg`}
          {' / '}
          {weeklyGoals.volumeTarget >= 1000
            ? `${(weeklyGoals.volumeTarget / 1000).toFixed(0)}t`
            : `${weeklyGoals.volumeTarget} kg`}
        </Text>
      </View>
      <View style={styles.goalBarTrack}>
        <View style={[
          styles.goalBarFill,
          {
            width: `${weeklyGoals.volumePct}%`,
            backgroundColor: weeklyGoals.volumePct >= 100 ? colors.success : colors.primary,
          },
        ]} />
      </View>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    goalsCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    goalsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.ms,
    },
    goalsTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    goalsWeekLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    goalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    goalLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    goalValue: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.text,
    },
    goalBarTrack: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xxs,
      overflow: 'hidden',
    },
    goalBarFill: {
      height: '100%',
      borderRadius: borderRadius.xxs,
    },
  }), [colors])
}
