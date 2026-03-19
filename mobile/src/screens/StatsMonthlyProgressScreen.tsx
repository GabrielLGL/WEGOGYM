import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  computeMonthlyProgress,
  getAvailableMonths,
  formatMonthLabel,
  type MonthlyProgressResult,
  type MonthlyTrend,
} from '../model/utils/monthlyProgressHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDeltaColor(delta: number, colors: ThemeColors): string {
  if (delta > 0) return colors.success
  if (delta < 0) return colors.danger
  return colors.textSecondary
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}%`
  if (delta < 0) return `${delta}%`
  return '0%'
}

function formatVolume(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(Math.round(value))
}

function getCurrentYearMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ─── DeltaCard ──────────────────────────────────────────────────────────────

function DeltaCard({
  label,
  value,
  delta,
  colors,
  styles,
}: {
  label: string
  value: string
  delta: number
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
}) {
  return (
    <View style={styles.deltaCard}>
      <Text style={styles.deltaLabel}>{label}</Text>
      <Text style={styles.deltaValue}>{value}</Text>
      <Text style={[styles.deltaPct, { color: getDeltaColor(delta, colors) }]}>
        {formatDelta(delta)}
      </Text>
    </View>
  )
}

// ─── TrendCard ──────────────────────────────────────────────────────────────

function getTrendIcon(trend: MonthlyTrend, colors: ThemeColors): { icon: keyof typeof Ionicons.glyphMap; color: string } {
  switch (trend) {
    case 'up': return { icon: 'trending-up', color: colors.success }
    case 'down': return { icon: 'trending-down', color: colors.negative }
    case 'stable': return { icon: 'remove-outline', color: colors.neutralGray }
  }
}

function TrendCard({
  trend,
  trendText,
  colors,
  styles,
}: {
  trend: MonthlyTrend
  trendText: string
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
}) {
  const info = getTrendIcon(trend, colors)
  return (
    <View style={styles.trendCard}>
      <Ionicons name={info.icon} size={28} color={info.color} />
      <Text style={[styles.trendText, { color: info.color }]}>{trendText}</Text>
    </View>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsMonthlyProgressContent({ histories, sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const mp = t.monthlyProgress

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth)

  const availableMonths = useMemo(() => getAvailableMonths(histories), [histories])

  const result: MonthlyProgressResult = useMemo(
    () => computeMonthlyProgress(histories, sets, exercises, selectedMonth),
    [histories, sets, exercises, selectedMonth],
  )

  const canGoPrev = availableMonths.length > 0 && availableMonths[0] <= prevMonth(selectedMonth)
  const canGoNext = selectedMonth < getCurrentYearMonth()

  const handlePrev = () => {
    if (canGoPrev) setSelectedMonth(prevMonth(selectedMonth))
  }
  const handleNext = () => {
    if (canGoNext) setSelectedMonth(nextMonth(selectedMonth))
  }

  const hasData = result.current.sessionCount > 0 || result.previous.sessionCount > 0

  const trendTexts: Record<MonthlyTrend, string> = {
    up: mp.trendUp,
    down: mp.trendDown,
    stable: mp.trendStable,
  }

  if (!hasData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{mp.noData}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Month Navigation ── */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePrev} disabled={!canGoPrev} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={canGoPrev ? colors.text : colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthLabel(selectedMonth, language)}</Text>
        <TouchableOpacity onPress={handleNext} disabled={!canGoNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoNext ? colors.text : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Trend ── */}
      <TrendCard trend={result.trend} trendText={trendTexts[result.trend]} colors={colors} styles={styles} />

      {/* ── Delta Grid ── */}
      <View style={styles.grid}>
        <DeltaCard
          label={mp.volume}
          value={`${formatVolume(result.current.totalVolume)} kg`}
          delta={result.deltas.volume}
          colors={colors}
          styles={styles}
        />
        <DeltaCard
          label={mp.sessions}
          value={String(result.current.sessionCount)}
          delta={result.deltas.sessions}
          colors={colors}
          styles={styles}
        />
        <DeltaCard
          label={mp.prs}
          value={String(result.current.prCount)}
          delta={result.deltas.prs}
          colors={colors}
          styles={styles}
        />
        <DeltaCard
          label={mp.activeDays}
          value={String(result.current.activeDays)}
          delta={result.deltas.activeDays}
          colors={colors}
          styles={styles}
        />
        <DeltaCard
          label={mp.setsTotal}
          value={String(result.current.setsTotal)}
          delta={result.deltas.setsTotal}
          colors={colors}
          styles={styles}
        />
        <DeltaCard
          label={mp.avgPerWeek}
          value={String(result.current.avgSessionsPerWeek)}
          delta={result.deltas.avgPerWeek}
          colors={colors}
          styles={styles}
        />
      </View>

      {/* ── Top Exercise ── */}
      {result.current.topExercise && (
        <View style={styles.topCard}>
          <Text style={styles.topLabel}>{mp.topExercise}</Text>
          <Text style={styles.topName}>{result.current.topExercise.name}</Text>
          <Text style={styles.topVolume}>
            {formatVolume(result.current.topExercise.volume)} kg
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

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
    // Month Nav
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    monthLabel: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    // Trend
    trendCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    trendText: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    // Grid
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    deltaCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      width: '48%',
      flexGrow: 1,
    },
    deltaLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    deltaValue: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    deltaPct: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    // Top Exercise
    topCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    topLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    topName: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    topVolume: {
      fontSize: fontSize.sm,
      color: colors.primary,
      marginTop: spacing.xs,
    },
  }), [colors])
}

// ─── withObservables ────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableContent = enhance(StatsMonthlyProgressContent)

const StatsMonthlyProgressScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsMonthlyProgressScreen
