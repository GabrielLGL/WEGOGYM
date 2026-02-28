import React, { useState, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  computeWeeklySetsChart,
  computeMonthlySetsChart,
  getMondayOfCurrentWeek,
  PERIOD_LABELS,
  labelToPeriod,
} from '../model/utils/statsHelpers'
import { ChipSelector } from '../components/ChipSelector'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'

const chartConfig = createChartConfig({ showDots: true })

const BAR_PERIOD_LABELS = ['Semaine', '1 mois', '3 mois', 'Tout'] as const
type BarPeriodLabel = typeof BAR_PERIOD_LABELS[number]

const pad = (n: number) => String(n).padStart(2, '0')

function computeBarWindow(
  barPeriod: BarPeriodLabel,
  offset: number,
  monthAbbr: string[],
  monthFull: string[],
  labelAll: string,
): {
  windowStart: number
  windowEnd: number
  windowLabel: string
  showNav: boolean
} {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000
  const now = new Date()

  if (barPeriod === 'Tout') {
    return { windowStart: 0, windowEnd: Date.now() + 1, windowLabel: labelAll, showNav: false }
  }

  if (barPeriod === 'Semaine') {
    const monday = getMondayOfCurrentWeek()
    const windowStart = monday + offset * WEEK_MS
    const windowEnd = windowStart + WEEK_MS
    const s = new Date(windowStart)
    const e = new Date(windowEnd - 1)
    const windowLabel = `${pad(s.getDate())}/${pad(s.getMonth() + 1)} – ${pad(e.getDate())}/${pad(e.getMonth() + 1)}`
    return { windowStart, windowEnd, windowLabel, showNav: true }
  }

  if (barPeriod === '1 mois') {
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const windowStart = target.getTime()
    const windowEnd = new Date(target.getFullYear(), target.getMonth() + 1, 1).getTime()
    const windowLabel = `${monthFull[target.getMonth()]} ${target.getFullYear()}`
    return { windowStart, windowEnd, windowLabel, showNav: true }
  }

  // '3 mois'
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1 + offset * 3, 1)
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1)
  const windowStart = startDate.getTime()
  const windowEnd = endDate.getTime()
  const lastDay = new Date(windowEnd - 1)
  const sy = startDate.getFullYear()
  const ey = lastDay.getFullYear()
  const windowLabel = sy === ey
    ? `${monthAbbr[startDate.getMonth()]} – ${monthAbbr[lastDay.getMonth()]} ${ey}`
    : `${monthAbbr[startDate.getMonth()]} ${sy} – ${monthAbbr[lastDay.getMonth()]} ${ey}`
  return { windowStart, windowEnd, windowLabel, showNav: true }
}

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

export function StatsVolumeScreenBase({ sets, exercises, histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const { width: screenWidth } = useWindowDimensions()

  // ── Graphique ────────────────────────────────────────────────────────────
  const [periodLabel, setPeriodLabel] = useState<string>('1 mois')
  const period = labelToPeriod(periodLabel)

  const [muscleLabel, setMuscleLabel] = useState<string>('Total')

  const availableMuscles = useMemo(() => {
    const trainedExerciseIds = new Set(sets.map(s => s.exercise.id))
    const muscleSet = new Set<string>()
    exercises
      .filter(e => trainedExerciseIds.has(e.id))
      .forEach(e => e.muscles.forEach(m => { if (m.trim()) muscleSet.add(m.trim()) }))
    return Array.from(muscleSet).sort()
  }, [sets, exercises])

  const muscleItems = useMemo(() => [t.statsVolume.total, ...availableMuscles], [availableMuscles, t.statsVolume.total])
  const muscleFilter = muscleLabel === t.statsVolume.total ? null : muscleLabel
  const muscleLabelMap = useMemo(() => ({ [t.statsVolume.total]: t.statsVolume.total, ...t.muscleNames }), [t])

  const barPeriodLabelMap = useMemo<Record<string, string>>(() => ({
    'Semaine': t.statsVolume.periodWeek,
    '1 mois': t.statsVolume.periodMonth,
    '3 mois': t.statsVolume.period3Months,
    'Tout': t.statsVolume.periodAll,
  }), [t])

  // ── Progress bars ────────────────────────────────────────────────────────
  const [barPeriodLabel, setBarPeriodLabel] = useState<BarPeriodLabel>('Semaine')
  const [timeOffset, setTimeOffset] = useState(0)

  useEffect(() => { setTimeOffset(0) }, [barPeriodLabel])

  // ── Données line chart ───────────────────────────────────────────────────
  const chartResult = useMemo(() => {
    if (period === 'all') {
      return computeMonthlySetsChart(sets, exercises, histories, muscleFilter)
    }
    const weeksToShow = period === '3m' ? 12 : 4
    return computeWeeklySetsChart(sets, exercises, histories, {
      muscleFilter,
      weekOffset: 0,
      weeksToShow,
    })
  }, [sets, exercises, histories, period, muscleFilter])

  const chartLabels = useMemo(() => {
    if (period === '3m') {
      return chartResult.labels.map((label, i) => (i % 3 === 0 ? label : ''))
    }
    return chartResult.labels
  }, [chartResult.labels, period])

  const hasChartData = chartResult.data.some(v => v > 0)

  const chartData = useMemo(() => ({
    labels: chartLabels.length > 0 ? chartLabels : [''],
    datasets: [{ data: chartResult.data.length > 0 ? chartResult.data.map(v => Math.max(v, 0)) : [0] }],
  }), [chartLabels, chartResult.data])

  // ── Données progress bars ────────────────────────────────────────────────
  const { windowLabel, setsPerMuscle, hasNext, showNav } = useMemo(() => {
    const { windowStart, windowEnd, windowLabel: label, showNav } = computeBarWindow(barPeriodLabel, timeOffset, t.statsVolume.monthAbbr, t.statsVolume.monthFull, t.statsVolume.totalGlobal)

    const activeHistories = histories.filter(h => h.deletedAt === null)
    const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
    const activeHistoryIds = new Set(activeHistories.map(h => h.id))
    const exerciseMuscles = new Map<string, string[]>(
      exercises.map(e => [e.id, e.muscles] as [string, string[]])
    )

    const muscleSets = new Map<string, number>()
    sets.forEach(s => {
      if (!activeHistoryIds.has(s.history.id)) return
      const d = historyDates.get(s.history.id) ?? 0
      if (d < windowStart || d >= windowEnd) return
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      muscles.forEach(m => {
        const trimmed = m.trim()
        if (!trimmed) return
        muscleSets.set(trimmed, (muscleSets.get(trimmed) ?? 0) + 1)
      })
    })

    const result = Array.from(muscleSets.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([muscle, count]) => ({ muscle, sets: count }))

    return { windowLabel: label, setsPerMuscle: result, hasNext: timeOffset < 0, showNav }
  }, [sets, exercises, histories, barPeriodLabel, timeOffset, t])

  const maxSets = setsPerMuscle[0]?.sets ?? 1

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Graphique ── */}
      <ChipSelector
        items={PERIOD_LABELS}
        selectedValue={periodLabel}
        onChange={label => { if (label) setPeriodLabel(label) }}
        allowNone={false}
        noneLabel=""
      />
      <ChipSelector
        items={muscleItems}
        selectedValue={muscleLabel}
        onChange={label => { if (label) setMuscleLabel(label) }}
        allowNone={false}
        noneLabel=""
        labelMap={muscleLabelMap}
      />
      {hasChartData ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={screenWidth - spacing.md * 2}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            bezier
            withInnerLines={false}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>{t.statsVolume.noDataPeriod}</Text>
        </View>
      )}

      {/* ── Progress bars ── */}
      <ChipSelector
        items={BAR_PERIOD_LABELS}
        selectedValue={barPeriodLabel}
        onChange={label => { if (label) setBarPeriodLabel(label as BarPeriodLabel) }}
        allowNone={false}
        noneLabel=""
        labelMap={barPeriodLabelMap}
      />
      <View style={styles.barSection}>
        <View style={styles.barHeader}>
          {showNav && (
            <TouchableOpacity
              testID="nav-prev"
              style={styles.navBtn}
              onPress={() => setTimeOffset(o => o - 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.windowLabel}>{windowLabel}</Text>
          {showNav && (
            <TouchableOpacity
              testID="nav-next"
              style={[styles.navBtn, !hasNext && styles.navBtnDisabled]}
              onPress={() => { if (hasNext) setTimeOffset(o => o + 1) }}
              activeOpacity={hasNext ? 0.7 : 1}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={hasNext ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {setsPerMuscle.length > 0 ? (
          setsPerMuscle.map(entry => (
            <View key={entry.muscle} style={styles.muscleRow}>
              <View style={styles.muscleLabelRow}>
                <Text style={styles.muscleName} numberOfLines={1}>{t.muscleNames[entry.muscle as keyof typeof t.muscleNames] ?? entry.muscle}</Text>
                <Text style={styles.muscleSets}>{entry.sets} set{entry.sets > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round((entry.sets / maxSets) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{t.statsVolume.noSetsThisPeriod}</Text>
        )}
      </View>
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
    chartWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginTop: spacing.md,
    },
    chart: {
      borderRadius: borderRadius.md,
    },
    emptyChart: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    barSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    barHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    windowLabel: {
      flex: 1,
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    navBtn: {
      padding: spacing.xs,
    },
    navBtnDisabled: {
      opacity: 0.3,
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
}

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
}))

export default enhance(StatsVolumeScreenBase)
