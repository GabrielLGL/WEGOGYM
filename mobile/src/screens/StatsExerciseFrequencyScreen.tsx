import React, { memo, useCallback, useMemo, useState } from 'react'
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
import History from '../model/models/History'
import {
  computeExerciseFrequency,
  type ExerciseFrequencyEntry,
  type FrequencyTrend,
} from '../model/utils/exerciseFrequencyHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { ChipSelector } from '../components/ChipSelector'
import type { ThemeColors } from '../theme'

// ─── Constantes ───────────────────────────────────────────────────────────────

function getTrendColor(trend: FrequencyTrend, colors: ThemeColors): string {
  switch (trend) {
    case 'increasing': return colors.success
    case 'decreasing': return colors.danger
    case 'stable': return colors.textSecondary
  }
}

const TREND_ICONS: Record<FrequencyTrend, string> = {
  increasing: '↑',
  decreasing: '↓',
  stable: '→',
}

type PeriodKey = '30' | '90' | '0'

const PERIOD_VALUES: Record<PeriodKey, number> = {
  '30': 30,
  '90': 90,
  '0': 0,
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

interface CardProps {
  entry: ExerciseFrequencyEntry
  colors: ThemeColors
  lastDoneLabel: string
  daysLabel: string
}

const FrequencyCard = memo<CardProps>(function FrequencyCard({ entry, colors, lastDoneLabel, daysLabel }: CardProps) {
  const styles = useStyles(colors)
  const trendColor = getTrendColor(entry.trend, colors)

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{entry.count}×</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {entry.exerciseName}
          </Text>
          {entry.muscles.length > 0 && (
            <Text style={styles.muscles} numberOfLines={1}>
              {entry.muscles.join(', ')}
            </Text>
          )}
        </View>
        <Text style={[styles.trendIcon, { color: trendColor }]}>
          {TREND_ICONS[entry.trend]}
        </Text>
      </View>

      {entry.daysSinceLastPerformed !== null && (
        <Text style={styles.lastDone}>
          {lastDoneLabel} {entry.daysSinceLastPerformed}{daysLabel}
        </Text>
      )}
    </View>
  )
})

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

export function StatsExerciseFrequencyBase({ sets, exercises, histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const ef = t.exerciseFrequency

  const [period, setPeriod] = useState<PeriodKey>('30')

  const periodItems = ['30', '90', '0'] as const

  const periodLabelMap = useMemo<Record<string, string>>(() => ({
    '30': ef.periods.month,
    '90': ef.periods.quarter,
    '0': ef.periods.all,
  }), [ef])

  const result = useMemo(
    () => computeExerciseFrequency(sets, exercises, histories, PERIOD_VALUES[period]),
    [sets, exercises, histories, period],
  )

  const renderFrequencyItem = useCallback(({ item }: { item: ExerciseFrequencyEntry }) => (
    <FrequencyCard
      entry={item}
      colors={colors}
      lastDoneLabel={ef.lastDone}
      daysLabel="j"
    />
  ), [colors, ef.lastDone])

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{ef.noData}</Text>
      </View>
    )
  }

  return (
    <FlatList<ExerciseFrequencyEntry>
      style={styles.container}
      contentContainerStyle={styles.content}
      data={result.entries}
      keyExtractor={item => item.exerciseId}
      ListHeaderComponent={
        <View>
          {/* Period selector */}
          <View style={styles.chipContainer}>
            <ChipSelector
              items={periodItems}
              selectedValue={period}
              onChange={(v: string | null) => setPeriod((v ?? '30') as PeriodKey)}
              allowNone={false}
              labelMap={periodLabelMap}
            />
          </View>

          {/* Summary card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{result.totalExercisesUsed}</Text>
            <Text style={styles.summaryLabel}>{ef.totalUsed}</Text>

            <View style={styles.summaryRow}>
              {result.mostFrequent && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemValue} numberOfLines={1}>
                    {result.mostFrequent.exerciseName}
                  </Text>
                  <Text style={styles.summaryItemLabel}>{ef.mostFrequent}</Text>
                </View>
              )}
              {result.leastFrequent && result.entries.length > 1 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemValue} numberOfLines={1}>
                    {result.leastFrequent.exerciseName}
                  </Text>
                  <Text style={styles.summaryItemLabel}>{ef.leastFrequent}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Neglected section */}
          {result.neglected.length > 0 && (
            <View style={styles.neglectedHeader}>
              <Text style={styles.sectionTitle}>
                {ef.neglected} ({result.neglected.length})
              </Text>
            </View>
          )}
        </View>
      }
      renderItem={renderFrequencyItem}
      showsVerticalScrollIndicator={false}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    chipContainer: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
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
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.separator,
      paddingTop: spacing.sm,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryItemValue: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    summaryItemLabel: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      marginTop: 2,
    },
    // Neglected
    neglectedHeader: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    // Cards
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
    },
    countBadge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginRight: spacing.sm,
    },
    countText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.primaryText,
    },
    cardInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    muscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    trendIcon: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    lastDone: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      marginTop: spacing.xs,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
}))

const ObservableStatsExerciseFrequency = enhance(StatsExerciseFrequencyBase)

const StatsExerciseFrequencyScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsExerciseFrequency />}
    </View>
  )
}

export default StatsExerciseFrequencyScreen
