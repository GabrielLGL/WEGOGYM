import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { BarChart } from 'react-native-chart-kit'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  computeVolumeStats,
  formatVolume,
  PERIOD_LABELS,
  labelToPeriod,
} from '../model/utils/statsHelpers'
import { ChipSelector } from '../components/ChipSelector'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import { createChartConfig } from '../theme/chartConfig'

const chartConfig = createChartConfig()

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

function StatsVolumeScreenBase({ sets, exercises, histories }: Props) {
  const { width: screenWidth } = useWindowDimensions()
  const [periodLabel, setPeriodLabel] = useState<string>('1 mois')
  const period = labelToPeriod(periodLabel)

  const stats = useMemo(
    () => computeVolumeStats(sets, exercises, histories, period),
    [sets, exercises, histories, period]
  )

  const hasChartData = useMemo(
    () => stats.perWeek.some(w => w.volume > 0),
    [stats.perWeek]
  )

  const chartData = useMemo(() => ({
    labels: stats.perWeek.map(w => w.weekLabel),
    datasets: [{ data: stats.perWeek.map(w => Math.max(w.volume, 0)) }],
  }), [stats.perWeek])

  const isPositive = stats.comparedToPrevious >= 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ChipSelector
        items={PERIOD_LABELS}
        selectedValue={periodLabel}
        onChange={label => { if (label) setPeriodLabel(label) }}
        allowNone={false}
        noneLabel=""
      />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Volume total</Text>
        <Text style={styles.totalValue}>{formatVolume(stats.total)}</Text>
        {period !== 'all' && stats.comparedToPrevious !== 0 && (
          <Text style={[styles.comparison, { color: isPositive ? colors.success : colors.danger }]}>
            {isPositive ? '↑' : '↓'} {Math.abs(stats.comparedToPrevious)}% vs période précédente
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Volume par semaine (12 dernières)</Text>
      {hasChartData ? (
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            width={screenWidth - spacing.md * 2}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars={false}
            yAxisLabel=""
            yAxisSuffix="kg"
            withInnerLines={false}
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Aucun volume enregistré sur cette période.</Text>
        </View>
      )}

      {stats.topExercises.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Top exercices par volume</Text>
          <View style={styles.topList}>
            {stats.topExercises.map((ex, i) => (
              <View
                key={ex.exerciseId}
                style={[styles.topRow, i < stats.topExercises.length - 1 && styles.topRowBorder]}
              >
                <Text style={styles.topRank}>{i + 1}</Text>
                <Text style={styles.topName} numberOfLines={1}>{ex.name}</Text>
                <Text style={styles.topVolume}>{formatVolume(ex.volume)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  totalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  comparison: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chartWrapper: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  topList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  topRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  topRank: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
    width: 28,
  },
  topName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
  topVolume: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyChart: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
}))

export default enhance(StatsVolumeScreenBase)
