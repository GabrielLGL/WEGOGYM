import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import { computeVolumeForecast, type VolumeForecast, type VolumeTrend } from '../model/utils/volumeForecastHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatVolume(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

function getTrendColor(trend: VolumeTrend, colors: ThemeColors): string {
  if (trend === 'increasing') return colors.primary
  if (trend === 'decreasing') return colors.danger
  return colors.textSecondary
}

const TREND_ARROWS: Record<VolumeTrend, string> = {
  increasing: '\u2191',
  decreasing: '\u2193',
  stable: '\u2192',
}

const DAY_LABELS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DAY_LABELS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
}

export function StatsVolumeForecastBase({ sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const vf = t.volumeForecast

  const forecast = useMemo(() => computeVolumeForecast(sets), [sets])

  if (!forecast) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{vf.noData}</Text>
      </View>
    )
  }

  const maxVolume = Math.max(
    ...forecast.weeklyHistory.map(w => w.volume),
    forecast.predictedVolume,
  )

  const dayLabels = language === 'fr' ? DAY_LABELS_FR : DAY_LABELS_EN

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Carte Prédiction ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{vf.nextWeek}</Text>
        <Text style={styles.bigNumber}>{formatVolume(forecast.predictedVolume)} kg</Text>
        <Text style={styles.range}>
          {formatVolume(forecast.lowerBound)} – {formatVolume(forecast.upperBound)} kg
        </Text>
        <View style={styles.trendRow}>
          <Text style={[styles.trendArrow, { color: getTrendColor(forecast.trend, colors) }]}>
            {TREND_ARROWS[forecast.trend]}
          </Text>
          <Text style={[styles.trendLabel, { color: getTrendColor(forecast.trend, colors) }]}>
            {vf.trends[forecast.trend]}
          </Text>
        </View>
      </View>

      {/* ── Progression semaine en cours ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{vf.thisWeek}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>
            {formatVolume(forecast.currentWeekVolume)} kg
          </Text>
          <Text style={styles.progressProjected}>
            {vf.projected} : {formatVolume(forecast.currentWeekProjected)} kg
          </Text>
        </View>
        {/* Barre de progression par jours */}
        <View style={styles.daysRow}>
          {dayLabels.map((label, i) => {
            const filled = i < forecast.currentWeekDay
            return (
              <View key={i} style={styles.dayItem}>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: filled ? colors.primary : colors.cardSecondary },
                  ]}
                />
                <Text style={styles.dayLabel}>{label}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* ── Histogramme 8 semaines ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{vf.weeklyHistory}</Text>
        <View style={styles.histogramContainer}>
          {forecast.weeklyHistory.map((week, i) => {
            const height = maxVolume > 0 ? (week.volume / maxVolume) * 120 : 0
            const weekLabel = `S-${forecast.weeklyHistory.length - i}`
            return (
              <View key={i} style={styles.barWrapper}>
                <Text style={styles.barValue}>{formatVolume(week.volume)}</Text>
                <View style={[styles.bar, { height, backgroundColor: colors.primary }]} />
                <Text style={styles.barLabel}>{weekLabel}</Text>
              </View>
            )
          })}
          {/* Barre prédite */}
          <View style={styles.barWrapper}>
            <Text style={styles.barValue}>{formatVolume(forecast.predictedVolume)}</Text>
            <View
              style={[
                styles.bar,
                {
                  height: maxVolume > 0 ? (forecast.predictedVolume / maxVolume) * 120 : 0,
                  backgroundColor: colors.primary,
                  opacity: 0.4,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  borderStyle: 'dashed',
                },
              ]}
            />
            <Text style={styles.barLabel}>{vf.predicted}</Text>
          </View>
        </View>
      </View>

      {/* ── Pace mensuel ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{vf.monthlyPace}</Text>
        <View style={styles.paceRow}>
          <View style={styles.paceItem}>
            <Text style={styles.paceValue}>{formatVolume(forecast.monthlyPace.current)} kg</Text>
            <Text style={styles.paceLabel}>{vf.thisMonth}</Text>
          </View>
          <View style={styles.paceDivider} />
          <View style={styles.paceItem}>
            <Text style={styles.paceValue}>{formatVolume(forecast.monthlyPace.projected)} kg</Text>
            <Text style={styles.paceLabel}>{vf.projected}</Text>
          </View>
          <View style={styles.paceDivider} />
          <View style={styles.paceItem}>
            <Text style={styles.paceValue}>{formatVolume(forecast.monthlyPace.average)} kg</Text>
            <Text style={styles.paceLabel}>{vf.monthlyAvg}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
      padding: spacing.md,
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
    // Cards
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // Prédiction
    bigNumber: {
      fontSize: fontSize.xxxl,
      fontWeight: '900',
      color: colors.text,
    },
    range: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      marginTop: spacing.xs,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    trendArrow: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      marginRight: spacing.xs,
    },
    trendLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    // Semaine en cours
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: spacing.sm,
    },
    progressValue: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    progressProjected: {
      fontSize: fontSize.xs,
      color: colors.placeholder,
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.xs,
    },
    dayItem: {
      alignItems: 'center',
    },
    dayDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginBottom: 4,
    },
    dayLabel: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
    },
    // Histogramme
    histogramContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 160,
      paddingTop: spacing.md,
    },
    barWrapper: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: 20,
      borderRadius: borderRadius.xs,
      minHeight: 2,
    },
    barValue: {
      fontSize: 9,
      color: colors.placeholder,
      marginBottom: 4,
    },
    barLabel: {
      fontSize: 9,
      color: colors.placeholder,
      marginTop: 4,
    },
    // Pace mensuel
    paceRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    paceItem: {
      alignItems: 'center',
      flex: 1,
    },
    paceDivider: {
      width: 1,
      backgroundColor: colors.separator,
    },
    paceValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    paceLabel: {
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
}))

const ObservableVolumeForecast = enhance(StatsVolumeForecastBase)

const StatsVolumeForecastScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableVolumeForecast />}
    </View>
  )
}

export default StatsVolumeForecastScreen
