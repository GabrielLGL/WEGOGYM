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
import { MINUTE_MS, DAY_MS } from '../model/constants'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'
import ScreenLoading from '../components/ScreenLoading'

// ─── Types ────────────────────────────────────────────────────────────────────

type ComparePeriod = 'this_month' | 'last_month' | 'last_3m' | 'last_6m' | 'this_year'

interface PeriodStats {
  label: string
  sessions: number
  volumeKg: number
  prs: number
  avgDurationMin: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPeriodRange(period: ComparePeriod): { start: number; end: number } {
  const now = Date.now()
  const today = new Date()

  switch (period) {
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime()
      return { start, end: now }
    }
    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime()
      const end = new Date(today.getFullYear(), today.getMonth(), 1).getTime() - 1
      return { start, end }
    }
    case 'last_3m':
      return { start: now - 90 * DAY_MS, end: now }
    case 'last_6m':
      return { start: now - 180 * DAY_MS, end: now }
    case 'this_year': {
      const start = new Date(today.getFullYear(), 0, 1).getTime()
      return { start, end: now }
    }
  }
}

function computePeriodStats(
  histories: History[],
  sets: WorkoutSet[],
  period: ComparePeriod,
  label: string,
): PeriodStats {
  const { start, end } = getPeriodRange(period)

  const filtered = histories.filter(h => {
    const t = h.startTime.getTime()
    return t >= start && t <= end
  })

  const historyIds = new Set(filtered.map(h => h.id))
  const periodSets = sets.filter(s => historyIds.has(s.historyId))

  const volumeKg = periodSets.reduce((acc, s) => acc + s.weight * s.reps, 0)
  const prs = periodSets.filter(s => s.isPr).length

  const durations = filtered
    .filter(h => h.endTime !== null)
    .map(h => (h.endTime!.getTime() - h.startTime.getTime()) / MINUTE_MS)

  const avgDurationMin =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

  return { label, sessions: filtered.length, volumeKg, prs, avgDurationMin }
}

function formatVolumePeriod(kg: number): string {
  if (kg >= 1000) return `${Math.round(kg / 100) / 10} t`
  return `${Math.round(kg)} kg`
}

// ─── Composant principal ──────────────────────────────────────────────────────

const PERIODS: ComparePeriod[] = ['this_month', 'last_month', 'last_3m', 'last_6m', 'this_year']

interface Props {
  histories: History[]
  sets: WorkoutSet[]
}

export function StatsCompareBase({ histories, sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const [periodA, setPeriodA] = useState<ComparePeriod>('this_month')
  const [periodB, setPeriodB] = useState<ComparePeriod>('last_month')

  const periodLabels: Record<ComparePeriod, string> = useMemo(() => ({
    this_month: t.compare.periods.this_month,
    last_month: t.compare.periods.last_month,
    last_3m:    t.compare.periods.last_3m,
    last_6m:    t.compare.periods.last_6m,
    this_year:  t.compare.periods.this_year,
  }), [t])

  const statsA = useMemo(
    () => computePeriodStats(histories, sets, periodA, periodLabels[periodA]),
    [histories, sets, periodA, periodLabels],
  )
  const statsB = useMemo(
    () => computePeriodStats(histories, sets, periodB, periodLabels[periodB]),
    [histories, sets, periodB, periodLabels],
  )

  // Wins count
  const aWins = [
    statsA.sessions > statsB.sessions,
    statsA.volumeKg > statsB.volumeKg,
    statsA.prs > statsB.prs,
    statsA.avgDurationMin > statsB.avgDurationMin,
  ].filter(Boolean).length

  const bWins = [
    statsB.sessions > statsA.sessions,
    statsB.volumeKg > statsA.volumeKg,
    statsB.prs > statsA.prs,
    statsB.avgDurationMin > statsA.avgDurationMin,
  ].filter(Boolean).length

  const summaryText =
    aWins > bWins
      ? t.compare.summaryAWins.replace('{n}', String(aWins))
      : bWins > aWins
        ? t.compare.summaryBWins.replace('{n}', String(bWins))
        : t.compare.summaryEqual

  interface MetricRow {
    label: string
    valueA: string
    valueB: string
    aWins: boolean
    equal: boolean
  }

  const rows: MetricRow[] = [
    {
      label: t.compare.metrics.sessions,
      valueA: String(statsA.sessions),
      valueB: String(statsB.sessions),
      aWins: statsA.sessions > statsB.sessions,
      equal: statsA.sessions === statsB.sessions,
    },
    {
      label: t.compare.metrics.volume,
      valueA: formatVolumePeriod(statsA.volumeKg),
      valueB: formatVolumePeriod(statsB.volumeKg),
      aWins: statsA.volumeKg > statsB.volumeKg,
      equal: statsA.volumeKg === statsB.volumeKg,
    },
    {
      label: t.compare.metrics.prs,
      valueA: String(statsA.prs),
      valueB: String(statsB.prs),
      aWins: statsA.prs > statsB.prs,
      equal: statsA.prs === statsB.prs,
    },
    {
      label: t.compare.metrics.avgDuration,
      valueA: `${Math.round(statsA.avgDurationMin)} min`,
      valueB: `${Math.round(statsB.avgDurationMin)} min`,
      aWins: statsA.avgDurationMin > statsB.avgDurationMin,
      equal: Math.round(statsA.avgDurationMin) === Math.round(statsB.avgDurationMin),
    },
  ]

  const noDataA = statsA.sessions === 0
  const noDataB = statsB.sessions === 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Sélecteur Période A ── */}
      <Text style={styles.sectionLabel}>{t.compare.periodA}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        <View style={styles.chipsRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, periodA === p && styles.chipActive]}
              onPress={() => setPeriodA(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, periodA === p && styles.chipTextActive]}>
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Sélecteur Période B ── */}
      <Text style={[styles.sectionLabel, styles.sectionLabelB]}>{t.compare.periodB}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        <View style={styles.chipsRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, periodB === p && styles.chipActive]}
              onPress={() => setPeriodB(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, periodB === p && styles.chipTextActive]}>
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Tableau comparatif ── */}
      <View style={styles.table}>
        {/* En-tête */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.metricCol]} />
          <Text style={[styles.headerCell, styles.valueCol]}>{t.compare.periodA}</Text>
          <Text style={[styles.headerCell, styles.valueCol]}>{t.compare.periodB}</Text>
          <Text style={[styles.headerCell, styles.winnerCol]}>{t.compare.winner}</Text>
        </View>

        {/* Lignes */}
        {rows.map((row, i) => (
          <View key={row.label} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
            <Text style={[styles.rowLabel, styles.metricCol]}>{row.label}</Text>
            <Text
              style={[
                styles.rowValue,
                styles.valueCol,
                row.aWins && styles.winnerValue,
                !row.aWins && !row.equal && styles.loserValue,
              ]}
            >
              {row.valueA}
            </Text>
            <Text
              style={[
                styles.rowValue,
                styles.valueCol,
                !row.aWins && !row.equal && styles.winnerValue,
                row.aWins && styles.loserValue,
              ]}
            >
              {row.valueB}
            </Text>
            <View style={[styles.winnerCol, styles.winnerIconCell]}>
              {row.equal ? (
                <Text style={styles.equalText}>=</Text>
              ) : (
                <View style={styles.winnerTag}>
                  <Ionicons
                    name="arrow-up-outline"
                    size={14}
                    color={colors.primary}
                    style={row.aWins ? undefined : styles.arrowDown}
                  />
                  <Text style={styles.winnerTagText}>{row.aWins ? 'A' : 'B'}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* ── Aucune donnée ── */}
      {(noDataA || noDataB) && (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataText}>{t.compare.noData}</Text>
        </View>
      )}

      {/* ── Résumé ── */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{summaryText}</Text>
      </View>
    </ScrollView>
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
      paddingBottom: spacing.xl + 60,
    },
    sectionLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    sectionLabelB: {
      marginTop: spacing.md,
    },
    chipsScroll: {
      marginBottom: spacing.xs,
    },
    chipsRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingRight: spacing.md,
    },
    chip: {
      paddingHorizontal: spacing.ms,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.separator,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
    // Tableau
    table: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginTop: spacing.md,
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.ms,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    headerCell: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.ms,
      paddingHorizontal: spacing.ms,
    },
    tableRowAlt: {
      backgroundColor: colors.background,
    },
    rowLabel: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
    rowValue: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
    },
    // Colonnes
    metricCol: {
      flex: 2,
    },
    valueCol: {
      flex: 2,
      textAlign: 'center',
      color: colors.text,
    },
    winnerCol: {
      flex: 1.5,
      alignItems: 'center',
    },
    winnerIconCell: {
      justifyContent: 'center',
    },
    winnerValue: {
      color: colors.primary,
    },
    loserValue: {
      color: colors.textSecondary,
    },
    winnerTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    winnerTagText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.primary,
    },
    arrowDown: {
      transform: [{ rotate: '180deg' }],
    },
    equalText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    // No data
    noDataCard: {
      marginTop: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    noDataText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    // Résumé
    summaryCard: {
      marginTop: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    summaryText: {
      fontSize: fontSize.bodyMd,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

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
}))

const ObservableStatsCompare = enhance(StatsCompareBase)

const StatsCompareScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted ? <ObservableStatsCompare /> : <ScreenLoading />}
    </View>
  )
}

export default StatsCompareScreen
