import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import Svg, { Polyline } from 'react-native-svg'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import BodyMeasurement from '../model/models/BodyMeasurement'
import {
  computeBodyCompTrends,
  type BodyCompPeriod,
  type BodyCompTrend,
  type BodyCompMetricKey,
} from '../model/utils/bodyCompTrendsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PERIODS: BodyCompPeriod[] = [30, 90, 180]

const UNIT_MAP: Record<BodyCompMetricKey, string> = {
  weight: 'kg',
  waist: 'cm',
  hips: 'cm',
  chest: 'cm',
  arms: 'cm',
}

function getTrendColor(
  trend: BodyCompTrend,
  colors: ThemeColors,
): string {
  if (trend.trend === 'stable') return colors.textSecondary
  // Weight is inverted: down = good (primary), up = bad (danger)
  if (trend.metric === 'weight') {
    return trend.trend === 'down' ? colors.primary : colors.danger
  }
  return trend.trend === 'up' ? colors.primary : colors.danger
}

function buildSparklinePath(
  dataPoints: number[],
  width: number,
  height: number,
): string {
  if (dataPoints.length < 2) return ''
  const min = Math.min(...dataPoints)
  const max = Math.max(...dataPoints)
  const range = max - min || 1
  const padding = 2

  return dataPoints
    .map((v, i) => {
      const x = (i / (dataPoints.length - 1)) * width
      const y = padding + ((max - v) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ dataPoints, color }: { dataPoints: number[]; color: string }) {
  const width = 100
  const height = 32
  const points = buildSparklinePath(dataPoints, width, height)
  if (!points) return null

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  trend: BodyCompTrend
  colors: ThemeColors
  labels: Record<BodyCompMetricKey, string>
  noDataLabel: string
}

function MetricCard({ trend, colors, labels, noDataLabel }: MetricCardProps) {
  const styles = useStyles(colors)
  const trendColor = getTrendColor(trend, colors)
  const unit = UNIT_MAP[trend.metric]
  const sign = trend.delta >= 0 ? '+' : ''

  if (!trend.hasData) {
    return (
      <View style={styles.card}>
        <Text style={styles.metricLabel}>{labels[trend.metric]}</Text>
        <Text style={styles.noData}>{noDataLabel}</Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.metricLabel}>{labels[trend.metric]}</Text>
          <Text style={styles.currentValue}>
            {trend.current.toFixed(1)} {unit}
          </Text>
          <Text style={[styles.deltaText, { color: trendColor }]}>
            {sign}{trend.delta.toFixed(1)} {unit} ({sign}{trend.deltaPercent.toFixed(1)}%)
          </Text>
        </View>
        <Sparkline dataPoints={trend.dataPoints} color={trendColor} />
      </View>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  measurements: BodyMeasurement[]
}

export function StatsBodyCompBase({ measurements }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const bc = t.bodyComp

  const [period, setPeriod] = useState<BodyCompPeriod>(90)

  const trends = useMemo(
    () => computeBodyCompTrends(measurements, period),
    [measurements, period],
  )

  const metricLabels: Record<BodyCompMetricKey, string> = {
    weight: bc.metrics.weight,
    waist: bc.metrics.waist,
    hips: bc.metrics.hips,
    chest: bc.metrics.chest,
    arms: bc.metrics.arms,
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={trends}
      keyExtractor={item => item.metric}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && { backgroundColor: colors.primary }]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  period === p && { color: colors.background },
                ]}
              >
                {bc[`period${p}` as 'period30' | 'period90' | 'period180']}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      }
      renderItem={({ item }) => (
        <MetricCard
          trend={item}
          colors={colors}
          labels={metricLabels}
          noDataLabel={bc.noData}
        />
      )}
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
      padding: spacing.md,
      paddingBottom: spacing.xxl,
    },
    // Period toggle
    periodRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    periodBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    periodBtnText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    // Cards
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    metricLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    currentValue: {
      fontSize: fontSize.xl,
      fontWeight: '900',
      color: colors.text,
      marginTop: 2,
    },
    deltaText: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      marginTop: 2,
    },
    noData: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      marginTop: spacing.xs,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  measurements: database
    .get<BodyMeasurement>('body_measurements')
    .query(Q.sortBy('date', Q.desc))
    .observe(),
}))

const ObservableStatsBodyComp = enhance(StatsBodyCompBase)

const StatsBodyCompScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsBodyComp />}
    </View>
  )
}

export default StatsBodyCompScreen
