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
import { computeVolumeDistribution } from '../model/utils/volumeDistributionHelpers'
import type { VolumeDistributionEntry } from '../model/utils/volumeDistributionHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Constants ───────────────────────────────────────────────────────────────

// BAR_COLORS moved to function using theme tokens

interface PeriodOption {
  days: number | null
  labelKey: 'week' | 'month' | 'quarter' | 'all'
}

const PERIODS: PeriodOption[] = [
  { days: 7, labelKey: 'week' },
  { days: 30, labelKey: 'month' },
  { days: 90, labelKey: 'quarter' },
  { days: null, labelKey: 'all' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBalanceColor(score: number, colors: ThemeColors): string {
  if (score >= 80) return colors.primary
  if (score >= 60) return colors.success
  if (score >= 40) return colors.amber
  return colors.danger
}

// ─── DistributionBar (memo) ──────────────────────────────────────────────────

interface DistributionBarProps {
  item: VolumeDistributionEntry
  barColor: string
  widthPct: number
}

const DistributionBar = React.memo(function DistributionBar({ item, barColor, widthPct }: DistributionBarProps) {
  const colors = useColors()
  const styles = useStyles(colors)

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>{item.muscle}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.barPct}>{item.percentage}%</Text>
    </View>
  )
})

// ─── Composant principal ─────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsVolumeDistributionBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const [periodIndex, setPeriodIndex] = useState(1) // default 30j

  const period = PERIODS[periodIndex]
  const data = useMemo(
    () => computeVolumeDistribution(sets, exercises, period.days),
    [sets, exercises, period.days],
  )

  const periodLabels = t.volumeDistribution.periods

  const maxPct = data.entries[0]?.percentage ?? 1
  const barPalette = [colors.purple, colors.success, colors.amber, colors.pink, colors.blue]

  const renderBar = useCallback(({ item, index }: { item: VolumeDistributionEntry; index: number }) => (
    <DistributionBar
      item={item}
      barColor={barPalette[index % barPalette.length]}
      widthPct={maxPct > 0 ? (item.percentage / maxPct) * 100 : 0}
    />
  ), [maxPct, barPalette])

  if (data.entries.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="pie-chart-outline" size={56} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>{t.volumeDistribution.noData}</Text>
      </View>
    )
  }

  const balanceColor = getBalanceColor(data.balanceScore, colors)

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      data={data.entries}
      keyExtractor={item => item.muscle}
      renderItem={renderBar}
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

          {/* ── Balance card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.volumeDistribution.balance}</Text>
            <Text style={[styles.scoreValue, { color: balanceColor }]}>
              {data.balanceScore}<Text style={styles.scoreUnit}>/100</Text>
            </Text>
            {data.dominantMuscle && (
              <Text style={styles.cardDetail}>
                {t.volumeDistribution.dominant} : {data.dominantMuscle}
              </Text>
            )}
            {data.weakestMuscle && data.weakestMuscle !== data.dominantMuscle && (
              <Text style={styles.cardDetail}>
                {t.volumeDistribution.weakest} : {data.weakestMuscle}
              </Text>
            )}
          </View>

          {/* ── Section title ── */}
          <Text style={styles.sectionTitle}>{t.volumeDistribution.title}</Text>
        </>
      }
    />
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
    // Balance card
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
    cardDetail: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    // Bars section
    sectionTitle: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.ms,
      gap: spacing.sm,
    },
    barLabel: {
      fontSize: fontSize.sm,
      color: colors.text,
      width: 85,
    },
    barTrack: {
      flex: 1,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.cardSecondary,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 6,
    },
    barPct: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.placeholder,
      width: 36,
      textAlign: 'right',
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

const ObservableContent = enhance(StatsVolumeDistributionBase)

const StatsVolumeDistributionScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsVolumeDistributionScreen
