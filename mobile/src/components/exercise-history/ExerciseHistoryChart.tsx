import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

import { spacing, borderRadius, fontSize } from '../../theme'
import type { ThemeColors } from '../../theme'
import type { Translations } from '../../i18n'
import { useUnits } from '../../contexts/UnitContext'

export type ChartMetric = 'weight' | 'reps' | 'orm' | 'volume'

interface ExerciseHistoryChartProps {
  chartData: { labels: string[]; datasets: { data: number[] }[] } | null
  chartMetric: ChartMetric
  onMetricChange: (metric: ChartMetric) => void
  screenWidth: number
  chartConfig: ReturnType<typeof import('../../theme/chartConfig').createChartConfig>
  colors: ThemeColors
  t: Translations
}

function ExerciseHistoryChart({
  chartData,
  chartMetric,
  onMetricChange,
  screenWidth,
  chartConfig,
  colors,
  t,
}: ExerciseHistoryChartProps) {
  const styles = useStyles(colors)
  const { weightUnit, convertWeight } = useUnits()

  return (
    <>
      <View style={styles.metricToggle}>
        {(['weight', 'reps', 'orm', 'volume'] as ChartMetric[]).map(metric => (
          <TouchableOpacity
            key={metric}
            style={[styles.metricChip, chartMetric === metric && styles.metricChipActive]}
            onPress={() => onMetricChange(metric)}
          >
            <Text style={[styles.metricChipText, chartMetric === metric && styles.metricChipTextActive]}>
              {t.exerciseHistory.chartMetric[metric]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>{t.exerciseHistory.chartMetric[chartMetric]}</Text>
      {chartData ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={screenWidth - spacing.md * 2}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            formatYLabel={val => (chartMetric === 'weight' || chartMetric === 'orm') ? `${convertWeight(Number(val))}${weightUnit}` : val}
            formatXLabel={val => (chartData.labels.length > 6 ? '' : val)}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t.exerciseHistory.chartEmpty}
          </Text>
        </View>
      )}
    </>
  )
}

export default React.memo(ExerciseHistoryChart)

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    metricToggle: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.sm,
      flexWrap: 'wrap' as const,
    },
    metricChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
    },
    metricChipActive: {
      backgroundColor: colors.primary,
    },
    metricChipText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500' as const,
    },
    metricChipTextActive: {
      color: colors.background,
      fontWeight: '700' as const,
    },
    chartWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    chart: {
      borderRadius: borderRadius.md,
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
