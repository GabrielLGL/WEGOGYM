import React, { useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  computeRestTimeAnalysis,
  formatRestTime,
  type RestTimeEntry,
  type RestRecommendation,
} from '../model/utils/restTimeAnalysisHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Badge couleur ───────────────────────────────────────────────────────────

function getBadgeColor(rec: RestRecommendation, colors: ThemeColors): string {
  switch (rec) {
    case 'short': return colors.amber
    case 'optimal': return colors.success
    case 'long': return colors.danger
  }
}

// ─── ExerciseCard ────────────────────────────────────────────────────────────

interface CardProps {
  entry: RestTimeEntry
  colors: ThemeColors
  labels: Record<string, string>
}

function ExerciseRestCard({ entry, colors, labels }: CardProps) {
  const styles = useStyles(colors)
  const badgeColor = getBadgeColor(entry.recommendation, colors)

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {entry.exerciseName}
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {labels[entry.recommendation]}
          </Text>
        </View>
      </View>

      <Text style={styles.avgValue}>{formatRestTime(entry.averageRest)}</Text>
      <Text style={styles.avgLabel}>{labels.average}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatRestTime(entry.minRest)}</Text>
          <Text style={styles.statLabel}>Min</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatRestTime(entry.maxRest)}</Text>
          <Text style={styles.statLabel}>Max</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{entry.sampleCount}</Text>
          <Text style={styles.statLabel}>{labels.samples}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsRestTimeBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const rt = t.restTime

  const result = useMemo(
    () => computeRestTimeAnalysis(sets, exercises),
    [sets, exercises],
  )

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{rt.noData}</Text>
      </View>
    )
  }

  return (
    <FlatList<RestTimeEntry>
      style={styles.container}
      contentContainerStyle={styles.content}
      data={result.entries}
      keyExtractor={item => item.exerciseId}
      ListHeaderComponent={
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {formatRestTime(result.globalAverage)}
          </Text>
          <Text style={styles.summaryLabel}>{rt.globalAverage}</Text>
          <Text style={styles.summarySubLabel}>
            {result.totalSamples} {rt.samples}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <ExerciseRestCard
          entry={item}
          colors={colors}
          labels={rt.recommendations}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: spacing.xxl,
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      textAlign: 'center',
    },
    // Summary card
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: fontSize.jumbo,
      fontWeight: '900',
      color: colors.text,
    },
    summaryLabel: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      marginTop: spacing.xs,
    },
    summarySubLabel: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      marginTop: 2,
    },
    // Exercise cards
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    exerciseName: {
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      marginRight: spacing.sm,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
    },
    badgeText: {
      fontSize: fontSize.caption,
      fontWeight: '700',
      color: colors.primaryText,
    },
    avgValue: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    avgLabel: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      marginBottom: spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: colors.separator,
      paddingTop: spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    statLabel: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      marginTop: 2,
    },
  }), [colors])
}

// ─── withObservables ─────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableStatsRestTime = enhance(StatsRestTimeBase)

const StatsRestTimeScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsRestTime />}
    </View>
  )
}

export default StatsRestTimeScreen
