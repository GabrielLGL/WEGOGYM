import React, { useMemo, useState } from 'react'
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
  computeSetQuality,
  type SetQualityEntry,
} from '../model/utils/setQualityHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { ChipSelector } from '../components/ChipSelector'
import type { ThemeColors } from '../theme'

// ─── Constantes ───────────────────────────────────────────────────────────────

type PeriodKey = '30' | '90' | '0'

const PERIOD_VALUES: Record<PeriodKey, number | null> = {
  '30': 30,
  '90': 90,
  '0': null,
}

function getGradeColor(grade: 'A' | 'B' | 'C' | 'D', colors: ThemeColors): string {
  switch (grade) {
    case 'A': return colors.success
    case 'B': return colors.primary
    case 'C': return colors.amber
    case 'D': return colors.danger
  }
}

// ─── QualityCard ──────────────────────────────────────────────────────────────

interface CardProps {
  entry: SetQualityEntry
  colors: ThemeColors
  labels: {
    avgWeight: string
    consistency: string
    dropSets: string
  }
}

function QualityCard({ entry, colors, labels }: CardProps) {
  const styles = useStyles(colors)

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {entry.exerciseName}
          </Text>
          <Text style={styles.exerciseSets}>{entry.totalSets} sets</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(entry.grade, colors) }]}>
          <Text style={styles.gradeText}>{entry.grade}</Text>
        </View>
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{entry.avgWeight.toFixed(1)}kg</Text>
          <Text style={styles.metricLabel}>{labels.avgWeight}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{entry.repConsistency}%</Text>
          <Text style={styles.metricLabel}>{labels.consistency}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{entry.dropSetsDetected}</Text>
          <Text style={styles.metricLabel}>{labels.dropSets}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsSetQualityBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const sq = t.setQuality

  const [period, setPeriod] = useState<PeriodKey>('30')

  const periodItems = ['30', '90', '0'] as const

  const periodLabelMap = useMemo<Record<string, string>>(() => ({
    '30': sq.periods.month,
    '90': sq.periods.quarter,
    '0': sq.periods.all,
  }), [sq])

  const setsData = useMemo(() =>
    sets.map(s => ({
      weight: s.weight ?? 0,
      reps: s.reps ?? 0,
      exerciseId: s.exerciseId ?? '',
      historyId: s.historyId ?? '',
      createdAt: s.createdAt ?? 0,
    })),
    [sets],
  )

  const exercisesData = useMemo(() =>
    exercises.map(e => ({ id: e.id, name: e.name ?? '' })),
    [exercises],
  )

  const result = useMemo(
    () => computeSetQuality(setsData, exercisesData, PERIOD_VALUES[period]),
    [setsData, exercisesData, period],
  )

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{sq.noData}</Text>
      </View>
    )
  }

  const cardLabels = {
    avgWeight: sq.avgWeight,
    consistency: sq.consistency,
    dropSets: sq.dropSets,
  }

  return (
    <FlatList<SetQualityEntry>
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
            <View style={[styles.overallGradeBadge, { backgroundColor: getGradeColor(result.overallGrade, colors) }]}>
              <Text style={styles.overallGradeText}>{result.overallGrade}</Text>
            </View>
            <Text style={styles.summaryScore}>{result.overallScore}/100</Text>
            <Text style={styles.summaryLabel}>{sq.overallScore}</Text>

            <View style={styles.summaryRow}>
              {result.mostConsistent && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemValue} numberOfLines={1}>
                    {result.mostConsistent}
                  </Text>
                  <Text style={styles.summaryItemLabel}>{sq.mostConsistent}</Text>
                </View>
              )}
              {result.leastConsistent && result.entries.length > 1 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemValue} numberOfLines={1}>
                    {result.leastConsistent}
                  </Text>
                  <Text style={styles.summaryItemLabel}>{sq.leastConsistent}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <QualityCard
          entry={item}
          colors={colors}
          labels={cardLabels}
        />
      )}
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
    overallGradeBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    overallGradeText: {
      fontSize: fontSize.xxl,
      fontWeight: '900',
      color: colors.primaryText,
    },
    summaryScore: {
      fontSize: fontSize.xl,
      fontWeight: '700',
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
      marginBottom: spacing.sm,
    },
    cardInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    exerciseSets: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    gradeBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    gradeText: {
      fontSize: fontSize.md,
      fontWeight: '900',
      color: colors.primaryText,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: colors.separator,
      paddingTop: spacing.sm,
    },
    metricItem: {
      alignItems: 'center',
      flex: 1,
    },
    metricValue: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    metricLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
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
}))

const ObservableStatsSetQuality = enhance(StatsSetQualityBase)

const StatsSetQualityScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsSetQuality />}
    </View>
  )
}

export default StatsSetQualityScreen
