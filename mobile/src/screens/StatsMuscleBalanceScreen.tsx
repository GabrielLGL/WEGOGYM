import React, { useMemo, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { computeMuscleBalance } from '../model/utils/muscleBalanceHelpers'
import type { MusclePair } from '../model/utils/muscleBalanceHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Constants ───────────────────────────────────────────────────────────────

interface PeriodOption {
  days: number | null
  labelKey: 'month' | 'quarter' | 'all'
}

const PERIODS: PeriodOption[] = [
  { days: 30, labelKey: 'month' },
  { days: 90, labelKey: 'quarter' },
  { days: null, labelKey: 'all' },
]

function getStatusColor(status: string, colors: ThemeColors): string {
  switch (status) {
    case 'balanced': return colors.success
    case 'slight': return colors.amber
    default: return colors.danger
  }
}

// ─── Pair names ─────────────────────────────────────────────────────────────

interface PairLabels {
  left: string
  right: string
}

function getPairLabels(nameKey: string, t: ReturnType<typeof useLanguage>['t']): PairLabels {
  const labels = t.muscleBalance.pairs as Record<string, { left: string; right: string }>
  return labels[nameKey] ?? { left: nameKey, right: nameKey }
}

// ─── MusclePairCard (memo) ───────────────────────────────────────────────────

interface MusclePairCardProps {
  item: MusclePair
  t: ReturnType<typeof useLanguage>['t']
}

const MusclePairCard = React.memo(function MusclePairCard({ item, t }: MusclePairCardProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const labels = getPairLabels(item.nameKey, t)
  const statusColor = getStatusColor(item.status, colors)
  const statusLabel = t.muscleBalance.statuses[item.status]
  const total = item.leftVolume + item.rightVolume
  const leftPct = total > 0 ? (item.leftVolume / total) * 100 : 50
  const rightPct = total > 0 ? (item.rightVolume / total) * 100 : 50

  return (
    <View style={styles.pairCard}>
      <View style={styles.pairHeader}>
        <Text style={styles.pairLabel}>{labels.left}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        <Text style={[styles.pairLabel, { textAlign: 'right' }]}>{labels.right}</Text>
      </View>

      <View style={styles.barsRow}>
        <View style={styles.barTrackLeft}>
          <View style={[styles.barFillLeft, { width: `${leftPct}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={styles.ratioText}>{item.ratio.toFixed(2)}</Text>
        <View style={styles.barTrackRight}>
          <View style={[styles.barFillRight, { width: `${rightPct}%`, backgroundColor: statusColor }]} />
        </View>
      </View>

      <View style={styles.volumeRow}>
        <Text style={styles.volumeText}>{formatVolume(item.leftVolume)}</Text>
        <Text style={styles.volumeText}>{formatVolume(item.rightVolume)}</Text>
      </View>
    </View>
  )
})

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsMuscleBalanceBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const [periodIndex, setPeriodIndex] = useState(0) // default 30j

  const period = PERIODS[periodIndex]
  const data = useMemo(
    () => computeMuscleBalance(sets, exercises, period.days),
    [sets, exercises, period.days],
  )

  const periodLabels = t.muscleBalance.periods

  const renderPair = useCallback(({ item }: { item: MusclePair }) => (
    <MusclePairCard item={item} t={t} />
  ), [t])

  if (data.pairs.every(p => p.leftVolume === 0 && p.rightVolume === 0)) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="swap-horizontal-outline" size={56} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>{t.muscleBalance.noData}</Text>
      </View>
    )
  }

  const scoreColor = data.overallBalance >= 80
    ? colors.success
    : data.overallBalance >= 60
      ? colors.amber
      : colors.danger

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      data={data.pairs}
      keyExtractor={item => item.nameKey}
      renderItem={renderPair}
      ListHeaderComponent={
        <>
          {/* ── Filtre période ── */}
          <View style={styles.periodRow}>
            {PERIODS.map((p, i) => (
              <TouchableOpacity
                key={p.labelKey}
                style={[styles.periodBtn, i === periodIndex && { backgroundColor: colors.primary }]}
                onPress={() => setPeriodIndex(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodText, i === periodIndex && { color: colors.primaryText }]}>
                  {periodLabels[p.labelKey]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Score global ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.muscleBalance.overallBalance}</Text>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {data.overallBalance}<Text style={styles.scoreUnit}>/100</Text>
            </Text>
          </View>

          {/* ── Section title ── */}
          <Text style={styles.sectionTitle}>{t.muscleBalance.title}</Text>
        </>
      }
    />
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`
  return Math.round(vol).toString()
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
      paddingBottom: spacing.xl + 60,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.xl * 2,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    // Period filter
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
    periodText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    // Score card
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    scoreValue: {
      fontSize: fontSize.jumbo,
      fontWeight: '700',
    },
    scoreUnit: {
      fontSize: fontSize.lg,
      fontWeight: '400',
    },
    sectionTitle: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    // Pair card
    pairCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    pairHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    pairLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.xs,
    },
    statusText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
    },
    barsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    barTrackLeft: {
      flex: 1,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.cardSecondary,
      overflow: 'hidden',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    barFillLeft: {
      height: '100%',
      borderRadius: 6,
    },
    ratioText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      minWidth: 36,
      textAlign: 'center',
    },
    barTrackRight: {
      flex: 1,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.cardSecondary,
      overflow: 'hidden',
    },
    barFillRight: {
      height: '100%',
      borderRadius: 6,
    },
    volumeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    volumeText: {
      fontSize: fontSize.xs,
      color: colors.placeholder,
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
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableContent = enhance(StatsMuscleBalanceBase)

const StatsMuscleBalanceScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsMuscleBalanceScreen
