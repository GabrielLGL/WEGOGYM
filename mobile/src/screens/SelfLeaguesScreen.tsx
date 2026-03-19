import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { Ionicons } from '@expo/vector-icons'

import { database } from '../model'
import { EmptyState } from '../components/EmptyState'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import {
  computeSelfLeaguePeriods,
  buildSelfLeaguesRanking,
} from '../model/utils/selfLeaguesHelpers'
import type { SelfLeaguesMetric, SelfLeaguesPeriodSize, SelfLeaguesEntry } from '../model/utils/selfLeaguesHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatMetricValue(entry: SelfLeaguesEntry, metric: SelfLeaguesMetric): string {
  switch (metric) {
    case 'volume':
    case 'tonnage': {
      const kg = entry.value
      return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg)} kg`
    }
    case 'sessions': return `${entry.value}`
    case 'prs': return `${entry.value} PR${entry.value > 1 ? 's' : ''}`
    case 'duration': {
      const h = Math.floor(entry.value / 60)
      const m = entry.value % 60
      return h > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : `${m}m`
    }
  }
}

// ─── Row item ─────────────────────────────────────────────────────────────────

interface RowProps {
  entry: SelfLeaguesEntry
  metric: SelfLeaguesMetric
  colors: ThemeColors
  tAbove: string
  tBelow: string
}

const RankRow = React.memo(function RankRow({ entry, metric, colors, tAbove, tBelow }: RowProps) {
  const isTop3 = entry.rank <= 3
  const rankColors = [colors.gold, colors.silver, colors.bronze]

  const pctLabel = entry.pctFromAvg === 0
    ? null
    : entry.pctFromAvg > 0
      ? tAbove.replace('{n}', String(entry.pctFromAvg))
      : tBelow.replace('{n}', String(Math.abs(entry.pctFromAvg)))

  return (
    <View style={[
      styles.row,
      entry.isCurrentPeriod && { backgroundColor: colors.cardSecondary, borderRadius: borderRadius.sm },
    ]}>
      <Text style={[
        styles.rankText,
        { color: isTop3 ? rankColors[entry.rank - 1] : colors.textSecondary },
      ]}>
        #{entry.rank}
      </Text>
      <View style={styles.rowCenter}>
        <Text style={[styles.periodLabel, { color: colors.text }]} numberOfLines={1}>
          {entry.label}
        </Text>
        {entry.isCurrentPeriod && (
          <Text style={[styles.currentBadge, { color: colors.primary }]}>●</Text>
        )}
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.valueText, { color: entry.rank === 1 ? colors.primary : colors.text }]}>
          {formatMetricValue(entry, metric)}
        </Text>
        {pctLabel != null && (
          <Text style={[
            styles.pctText,
            { color: entry.pctFromAvg > 0 ? colors.primary : colors.danger },
          ]}>
            {pctLabel}
          </Text>
        )}
      </View>
    </View>
  )
})

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  histories: History[]
  sets: WorkoutSet[]
}

export function SelfLeaguesScreenBase({ histories, sets }: Props) {
  const colors = useColors()
  const { t } = useLanguage()
  const sl = t.selfLeagues

  const [periodSize, setPeriodSize] = useState<SelfLeaguesPeriodSize>('week')
  const [metric, setMetric] = useState<SelfLeaguesMetric>('volume')

  const periods = useMemo(
    () => computeSelfLeaguePeriods(histories, sets, periodSize),
    [histories, sets, periodSize],
  )

  const ranking = useMemo(
    () => buildSelfLeaguesRanking(periods, metric),
    [periods, metric],
  )

  const METRICS: { key: SelfLeaguesMetric; label: string }[] = [
    { key: 'volume',   label: sl.metricVolume },
    { key: 'sessions', label: sl.metricSessions },
    { key: 'prs',      label: sl.metricPrs },
    { key: 'tonnage',  label: sl.metricTonnage },
    { key: 'duration', label: sl.metricDuration },
  ]

  const renderItem = useCallback(({ item }: { item: SelfLeaguesEntry }) => (
    <RankRow
      entry={item}
      metric={metric}
      colors={colors}
      tAbove={sl.above}
      tBelow={sl.below}
    />
  ), [metric, colors, sl.above, sl.below])

  const footerText = periodSize === 'week'
    ? sl.footerBased.replace('{n}', String(ranking.length))
    : sl.footerBasedMonths.replace('{n}', String(ranking.length))

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Toggle Semaines / Mois ── */}
      <View style={[styles.toggleRow, { backgroundColor: colors.card }]}>
        {(['week', 'month'] as SelfLeaguesPeriodSize[]).map(size => (
          <TouchableOpacity
            key={size}
            style={[
              styles.toggleBtn,
              periodSize === size && { backgroundColor: colors.primary },
            ]}
            onPress={() => setPeriodSize(size)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.toggleLabel,
              { color: periodSize === size ? colors.background : colors.textSecondary },
            ]}>
              {size === 'week' ? sl.toggleWeeks : sl.toggleMonths}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Sélecteur de métrique ── */}
      <View style={styles.metricsRow}>
        {METRICS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.metricChip,
              { borderColor: colors.separator },
              metric === m.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setMetric(m.key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.metricLabel,
              { color: metric === m.key ? colors.background : colors.textSecondary },
            ]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Liste ── */}
      {ranking.length < 2 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="trophy-outline"
            title={t.emptyStates.leaguesTitle}
            message={t.emptyStates.leaguesMessage}
          />
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={item => `${item.startDate}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListFooterComponent={
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>{footerText}</Text>
          }
        />
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    margin: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  metricChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  rankText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    width: 36,
  },
  rowCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  periodLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  currentBadge: {
    fontSize: fontSize.xs,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  pctText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
})

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    ))
  ).observe(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
}))

const ObservableSelfLeaguesContent = enhance(SelfLeaguesScreenBase)

const SelfLeaguesScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableSelfLeaguesContent />}
    </View>
  )
}

export default SelfLeaguesScreen
