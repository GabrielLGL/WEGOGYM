import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  computeMuscleRepartition,
  computeWeeklySetsChart,
  computeSetsPerMuscleWeek,
  formatVolume,
  PERIOD_LABELS,
  labelToPeriod,
} from '../model/utils/statsHelpers'
import { ChipSelector } from '../components/ChipSelector'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useHaptics } from '../hooks/useHaptics'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

export function StatsRepartitionScreenBase({ sets, exercises, histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const chartConfig = createChartConfig({ colors })
  const haptics = useHaptics()
  const { t } = useLanguage()
  const { width: screenWidth } = useWindowDimensions()

  const [periodLabel, setPeriodLabel] = useState<string>('1 mois')
  const [weekOffset, setWeekOffset] = useState<number>(0)
  const [muscleChartFilter, setMuscleChartFilter] = useState<string | null>(null)

  const period = labelToPeriod(periodLabel)

  // ── Répartition musculaire (existant) ─────────────────────────────────────
  const repartition = useMemo(
    () => computeMuscleRepartition(sets, exercises, histories, period),
    [sets, exercises, histories, period]
  )

  const totalVolume = useMemo(
    () => repartition.reduce((sum, r) => sum + r.volume, 0),
    [repartition]
  )

  // ── Chart séries par semaine ──────────────────────────────────────────────
  const availableMuscles = useMemo(() => {
    const muscleSet = new Set<string>()
    exercises.forEach(e => e.muscles.forEach(m => { if (m.trim()) muscleSet.add(m.trim()) }))
    return Array.from(muscleSet).sort()
  }, [exercises])

  const muscleChartItems = useMemo(
    () => ['Global', ...availableMuscles],
    [availableMuscles]
  )

  const muscleLabelMap = useMemo(
    () => ({ Global: t.statsRepartition.global, ...t.muscleNames }),
    [t]
  )

  const weeklySetsChart = useMemo(
    () => computeWeeklySetsChart(sets, exercises, histories, {
      muscleFilter: muscleChartFilter,
      weekOffset,
    }),
    [sets, exercises, histories, muscleChartFilter, weekOffset]
  )

  const setsBarChartData = useMemo(() => ({
    labels: weeklySetsChart.labels,
    datasets: [{ data: weeklySetsChart.data.map(v => Math.max(v, 0)) }],
  }), [weeklySetsChart])

  const hasChartData = weeklySetsChart.data.some(v => v > 0)

  // ── Sets par muscle cette semaine ─────────────────────────────────────────
  const setsPerMuscle = useMemo(
    () => computeSetsPerMuscleWeek(sets, exercises, histories),
    [sets, exercises, histories]
  )
  const maxSetsThisWeek = setsPerMuscle[0]?.sets ?? 1

  function handleMuscleChartChange(label: string | null) {
    setMuscleChartFilter(!label || label === 'Global' ? null : label)

    setWeekOffset(0)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Filtre période */}
      <ChipSelector
        items={PERIOD_LABELS}
        selectedValue={periodLabel}
        onChange={label => { if (label) setPeriodLabel(label) }}
        allowNone={false}
        noneLabel=""
      />

      {/* ── Répartition musculaire ── */}
      {repartition.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t.statsRepartition.noDataPeriod}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.barsList}>
            {repartition.map(item => (
              <View key={item.muscle} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.muscleName}>{t.muscleNames[item.muscle as keyof typeof t.muscleNames] ?? item.muscle}</Text>
                  <Text style={styles.musclePct}>{item.pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${item.pct}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.totalText}>
            {t.statsRepartition.volumeAnalyzed} {formatVolume(totalVolume)}
          </Text>
        </>
      )}

      {/* ── Séries par semaine ── */}
      <Text style={styles.sectionTitle}>{t.statsRepartition.sectionSeriesPerWeek}</Text>

      <ChipSelector
        items={muscleChartItems}
        selectedValue={muscleChartFilter ?? 'Global'}
        onChange={handleMuscleChartChange}
        allowNone={false}
        noneLabel=""
        labelMap={muscleLabelMap}
      />

      {hasChartData ? (
        <View style={styles.chartWrapper}>
          <BarChart
            data={setsBarChartData}
            width={screenWidth - spacing.md * 2}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars={false}
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines={false}
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>{t.statsRepartition.noSeriesThisPeriod}</Text>
        </View>
      )}

      <View style={styles.weekNavRow}>
        <TouchableOpacity
          style={styles.weekNavBtn}
          onPress={() => {
            haptics.onPress()
            setWeekOffset(prev => prev - 1)
          }}
        >
          <Text style={styles.weekNavBtnText}>{t.statsRepartition.prev}</Text>
        </TouchableOpacity>

        <Text style={styles.weekRangeLabel}>{weeklySetsChart.weekRangeLabel}</Text>

        <TouchableOpacity
          style={[styles.weekNavBtn, !weeklySetsChart.hasNext && styles.weekNavBtnDisabled]}
          onPress={() => {
            if (!weeklySetsChart.hasNext) return
            haptics.onPress()
            setWeekOffset(prev => prev + 1)
          }}
          disabled={!weeklySetsChart.hasNext}
        >
          <Text style={[styles.weekNavBtnText, !weeklySetsChart.hasNext && styles.weekNavBtnTextDisabled]}>
            {t.statsRepartition.next}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Sets par muscle cette semaine ── */}
      {setsPerMuscle.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t.statsRepartition.sectionSetsThisWeek}</Text>
          <View style={styles.setsMuscleCard}>
            {setsPerMuscle.map(item => (
              <View key={item.muscle} style={styles.setsMuscleRow}>
                <View style={styles.setsMuscleLabel}>
                  <Text style={styles.setsMuscleText}>{t.muscleNames[item.muscle as keyof typeof t.muscleNames] ?? item.muscle}</Text>
                  <Text style={styles.setsMuscleCnt}>{item.sets} sets</Text>
                </View>
                <View style={styles.setsTrack}>
                  <View
                    style={[
                      styles.setsFill,
                      { width: `${Math.round((item.sets / maxSetsThisWeek) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    barsList: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.md,
      gap: spacing.md,
    },
    barRow: {
      gap: spacing.xs,
    },
    barLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    muscleName: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '500',
    },
    musclePct: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    barTrack: {
      height: 8,
      backgroundColor: colors.cardSecondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    barFill: {
      height: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    totalText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    chartWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginTop: spacing.sm,
    },
    chart: {
      borderRadius: borderRadius.md,
    },
    emptyChart: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    weekNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    weekNavBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    weekNavBtnText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '500',
    },
    weekNavBtnDisabled: {
      opacity: 0.3,
    },
    weekNavBtnTextDisabled: {
      color: colors.textSecondary,
    },
    weekRangeLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    setsMuscleCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
      gap: spacing.md,
    },
    setsMuscleRow: {
      gap: spacing.xs,
    },
    setsMuscleLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    setsMuscleText: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '500',
    },
    setsMuscleCnt: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    setsTrack: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    setsFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
  })
}

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
}))

export default enhance(StatsRepartitionScreenBase)
