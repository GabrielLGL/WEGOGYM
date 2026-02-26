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
import { BarChart, LineChart } from 'react-native-chart-kit'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  computeVolumeStats,
  computeSetsPerMuscleWeek,
  computeSetsPerMuscleHistory,
  formatVolume,
  PERIOD_LABELS,
  labelToPeriod,
} from '../model/utils/statsHelpers'
import { ChipSelector } from '../components/ChipSelector'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import { createChartConfig } from '../theme/chartConfig'

const chartConfig = createChartConfig()
const lineChartConfig = createChartConfig({ showDots: true })

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

export function StatsVolumeScreenBase({ sets, exercises, histories }: Props) {
  const { width: screenWidth } = useWindowDimensions()
  const [periodLabel, setPeriodLabel] = useState<string>('1 mois')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
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
    labels: stats.perWeek.map((w, i) => i % 3 === 0 ? w.weekLabel : ''),
    datasets: [{ data: stats.perWeek.map(w => Math.max(w.volume, 0)) }],
  }), [stats.perWeek])

  const isPositive = stats.comparedToPrevious >= 0

  // S02 — sets par muscle cette semaine
  const setsPerMuscle = useMemo(
    () => computeSetsPerMuscleWeek(sets, exercises, histories),
    [sets, exercises, histories]
  )
  const maxSetsThisWeek = setsPerMuscle[0]?.sets ?? 1

  // S03 — liste muscles entraînés + évolution
  const muscleList = useMemo(() => {
    const trainedExerciseIds = new Set(sets.map(s => s.exercise.id))
    const muscleSet = new Set<string>()
    exercises
      .filter(e => trainedExerciseIds.has(e.id))
      .forEach(e => e.muscles.forEach(m => { if (m.trim()) muscleSet.add(m.trim()) }))
    return Array.from(muscleSet).sort()
  }, [sets, exercises])

  const effectiveMuscle = selectedMuscle && muscleList.includes(selectedMuscle)
    ? selectedMuscle
    : (muscleList[0] ?? null)

  const muscleHistoryData = useMemo(
    () => effectiveMuscle
      ? computeSetsPerMuscleHistory(sets, exercises, histories, effectiveMuscle, 8)
      : [],
    [sets, exercises, histories, effectiveMuscle]
  )

  const hasHistoryData = muscleHistoryData.some(e => e.sets > 0)

  const lineChartData = useMemo(() => ({
    labels: muscleHistoryData.map((e, i) => i % 2 === 0 ? e.weekLabel : ''),
    datasets: [{ data: muscleHistoryData.map(e => Math.max(e.sets, 0)) }],
  }), [muscleHistoryData])

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

      {/* S02 — Sets par muscle cette semaine */}
      <Text style={[styles.sectionTitle, styles.sectionSpacingTop]}>
        Sets par muscle — semaine actuelle
      </Text>
      <View style={styles.muscleCard}>
        {setsPerMuscle.length > 0 ? (
          setsPerMuscle.map(entry => (
            <View key={entry.muscle} style={styles.muscleRow}>
              <View style={styles.muscleLabelRow}>
                <Text style={styles.muscleName} numberOfLines={1}>{entry.muscle}</Text>
                <Text style={styles.muscleSets}>{entry.sets} set{entry.sets > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round((entry.sets / maxSetsThisWeek) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun set enregistré cette semaine.</Text>
        )}
      </View>

      {/* S03 — Évolution par muscle */}
      {muscleList.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.sectionSpacingTop]}>
            Évolution par muscle
          </Text>
          <ChipSelector
            items={muscleList}
            selectedValue={effectiveMuscle}
            onChange={m => { if (m) setSelectedMuscle(m) }}
            allowNone={false}
            noneLabel=""
          />
          {hasHistoryData ? (
            <View style={[styles.chartWrapper, styles.sectionSpacingTop]}>
              <LineChart
                data={lineChartData}
                width={screenWidth - spacing.md * 2}
                height={180}
                chartConfig={lineChartConfig}
                style={styles.chart}
                fromZero
                withInnerLines={false}
                yAxisSuffix=""
                yAxisLabel=""
                bezier
              />
            </View>
          ) : (
            <View style={[styles.emptyChart, styles.sectionSpacingTop]}>
              <Text style={styles.emptyText}>
                Aucun set enregistré pour {effectiveMuscle} sur les 8 dernières semaines.
              </Text>
            </View>
          )}
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
  sectionSpacingTop: {
    marginTop: spacing.lg,
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
  // S02 — muscle week bars
  muscleCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  muscleRow: {
    gap: spacing.xs,
  },
  muscleLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleName: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  muscleSets: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.separator,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
})

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
}))

export default enhance(StatsVolumeScreenBase)
