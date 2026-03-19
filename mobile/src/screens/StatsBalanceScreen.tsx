import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Groupes musculaires ─────────────────────────────────────────────────────

const PUSH_MUSCLES = ['Pecs', 'Epaules', 'Triceps']
const PULL_MUSCLES = ['Dos', 'Biceps', 'Trapèzes']
const LEGS_MUSCLES = ['Quadriceps', 'Ischios', 'Mollets']

// ─── Types ────────────────────────────────────────────────────────────────────

interface BalanceData {
  pushVolume: number
  pullVolume: number
  legsVolume: number
  pushPullRatio: number
  upperLowerRatio: number
  pushPct: number
  pullPct: number
  legsPct: number
  totalSets: number
}

type PushPullStatus = 'balanced' | 'push_dominant' | 'pull_dominant'
type UpperLowerStatus = 'balanced' | 'upper_dominant' | 'legs_dominant'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPushPullStatus(ratio: number): PushPullStatus {
  if (ratio > 1.5) return 'push_dominant'
  if (ratio < 0.67) return 'pull_dominant'
  return 'balanced'
}

function getUpperLowerStatus(ratio: number): UpperLowerStatus {
  if (ratio > 3.0) return 'upper_dominant'
  if (ratio < 0.8) return 'legs_dominant'
  return 'balanced'
}

// ─── Barre de progression ────────────────────────────────────────────────────

interface ProgressBarProps {
  pct: number
  color: string
  colors: ThemeColors
}

function ProgressBar({ pct, color, colors }: ProgressBarProps) {
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.cardSecondary, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsBalanceScreenBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  // Map exerciseId → muscles[]
  const exerciseMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const ex of exercises) {
      map.set(ex.id, ex.muscles)
    }
    return map
  }, [exercises])

  // Calcul de l'équilibre
  const data = useMemo<BalanceData | null>(() => {
    if (sets.length < 10) return null

    let pushVolume = 0
    let pullVolume = 0
    let legsVolume = 0

    for (const s of sets) {
      const muscles = exerciseMap.get(s.exerciseId)
      if (!muscles || muscles.length === 0) continue

      const volume = s.weight * s.reps
      let categories: Array<'push' | 'pull' | 'legs'> = []

      for (const m of muscles) {
        if (PUSH_MUSCLES.includes(m)) categories.push('push')
        else if (PULL_MUSCLES.includes(m)) categories.push('pull')
        else if (LEGS_MUSCLES.includes(m)) categories.push('legs')
      }

      if (categories.length === 0) continue

      // Dédoublonnage des catégories
      const uniqueCats = [...new Set(categories)]
      const share = volume / uniqueCats.length

      for (const cat of uniqueCats) {
        if (cat === 'push') pushVolume += share
        else if (cat === 'pull') pullVolume += share
        else if (cat === 'legs') legsVolume += share
      }
    }

    const total = pushVolume + pullVolume + legsVolume
    if (total === 0) return null

    return {
      pushVolume,
      pullVolume,
      legsVolume,
      pushPullRatio: pushVolume / Math.max(1, pullVolume),
      upperLowerRatio: (pushVolume + pullVolume) / Math.max(1, legsVolume),
      pushPct: Math.round((pushVolume / total) * 100),
      pullPct: Math.round((pullVolume / total) * 100),
      legsPct: Math.round((legsVolume / total) * 100),
      totalSets: sets.length,
    }
  }, [sets, exerciseMap])

  if (!data) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="scale-outline" size={56} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>{t.balance.emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{t.balance.emptyMessage}</Text>
      </View>
    )
  }

  const ppStatus = getPushPullStatus(data.pushPullRatio)
  const ulStatus = getUpperLowerStatus(data.upperLowerRatio)
  const ppColor = ppStatus === 'balanced' ? colors.primary : colors.warning
  const ulColor = ulStatus === 'balanced' ? colors.primary : colors.warning

  const ppStatusLabel = ppStatus === 'balanced' ? t.balance.balanced
    : ppStatus === 'push_dominant' ? t.balance.pushDominant
    : t.balance.pullDominant

  const ulStatusLabel = ulStatus === 'balanced' ? t.balance.balanced
    : ulStatus === 'upper_dominant' ? t.balance.upperDominant
    : t.balance.legsDominant

  const upperPct = data.pushPct + data.pullPct

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.headerCard}>
        <Text style={styles.headerCount}>
          <Text style={styles.headerCountBig}>{data.totalSets}</Text>
          {'  '}{t.balance.setsAnalyzed}
        </Text>
        <Text style={styles.headerSubtitle}>{t.balance.subtitle}</Text>
      </View>

      {/* ── Push / Pull ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.balance.pushPull}</Text>

        <View style={styles.dualBarRow}>
          <View style={styles.dualBarItem}>
            <Text style={styles.barLabel}>{t.balance.push}</Text>
            <ProgressBar pct={data.pushPct} color={colors.primary} colors={colors} />
            <Text style={[styles.barPct, { color: colors.primary }]}>{data.pushPct}%</Text>
          </View>
          <View style={styles.dualBarSpacer} />
          <View style={styles.dualBarItem}>
            <Text style={styles.barLabel}>{t.balance.pull}</Text>
            <ProgressBar pct={data.pullPct} color={colors.textSecondary} colors={colors} />
            <Text style={[styles.barPct, { color: colors.textSecondary }]}>{data.pullPct}%</Text>
          </View>
        </View>

        <View style={[styles.ratioRow, { borderTopColor: colors.separator }]}>
          <Text style={styles.ratioLabel}>{t.balance.ratio} : {data.pushPullRatio.toFixed(2)}</Text>
          <Text style={[styles.statusBadge, { color: ppColor }]}>{ppStatusLabel}</Text>
        </View>
      </View>

      {/* ── Haut / Bas ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.balance.upperLower}</Text>

        <View style={styles.dualBarRow}>
          <View style={styles.dualBarItem}>
            <Text style={styles.barLabel}>{t.balance.upper}</Text>
            <ProgressBar pct={upperPct} color={colors.primary} colors={colors} />
            <Text style={[styles.barPct, { color: colors.primary }]}>{upperPct}%</Text>
          </View>
          <View style={styles.dualBarSpacer} />
          <View style={styles.dualBarItem}>
            <Text style={styles.barLabel}>{t.balance.legs}</Text>
            <ProgressBar pct={data.legsPct} color={colors.textSecondary} colors={colors} />
            <Text style={[styles.barPct, { color: colors.textSecondary }]}>{data.legsPct}%</Text>
          </View>
        </View>

        <View style={[styles.ratioRow, { borderTopColor: colors.separator }]}>
          <Text style={styles.ratioLabel}>{t.balance.ratio} : {data.upperLowerRatio.toFixed(2)}</Text>
          <Text style={[styles.statusBadge, { color: ulColor }]}>{ulStatusLabel}</Text>
        </View>
      </View>

      {/* ── Répartition ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.balance.distribution}</Text>

        <View style={styles.distRow}>
          <Text style={styles.distLabel}>{t.balance.push}</Text>
          <Text style={[styles.distPct, { color: colors.primary }]}>{data.pushPct}%</Text>
          <View style={styles.distBarContainer}>
            <ProgressBar pct={data.pushPct} color={colors.primary} colors={colors} />
          </View>
        </View>

        <View style={styles.distRow}>
          <Text style={styles.distLabel}>{t.balance.pull}</Text>
          <Text style={[styles.distPct, { color: colors.textSecondary }]}>{data.pullPct}%</Text>
          <View style={styles.distBarContainer}>
            <ProgressBar pct={data.pullPct} color={colors.textSecondary} colors={colors} />
          </View>
        </View>

        <View style={styles.distRow}>
          <Text style={styles.distLabel}>{t.balance.legs}</Text>
          <Text style={[styles.distPct, { color: colors.warning }]}>{data.legsPct}%</Text>
          <View style={styles.distBarContainer}>
            <ProgressBar pct={data.legsPct} color={colors.warning} colors={colors} />
          </View>
        </View>
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
    },
    emptyMessage: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    headerCount: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
    },
    headerCountBig: {
      fontSize: fontSize.xxxl,
      fontWeight: '700',
      color: colors.primary,
    },
    headerSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      fontStyle: 'italic',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    dualBarRow: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    dualBarItem: {
      flex: 1,
      gap: spacing.xs,
    },
    dualBarSpacer: {
      width: spacing.md,
    },
    barLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    barPct: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      marginTop: 2,
    },
    ratioRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      paddingTop: spacing.sm,
      marginTop: spacing.xs,
    },
    ratioLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    statusBadge: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    distRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    distLabel: {
      fontSize: fontSize.sm,
      color: colors.text,
      width: 60,
    },
    distPct: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      width: 36,
      textAlign: 'right',
    },
    distBarContainer: {
      flex: 1,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableContent = enhance(StatsBalanceScreenBase)

const StatsBalanceScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsBalanceScreen
