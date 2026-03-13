/**
 * StatsHexagonScreen — Écran Profil Athlète
 *
 * Affiche un radar chart en pentagone (5 axes athlétiques) calculé depuis
 * les données existantes de l'utilisateur (sans migration DB).
 *
 * Axes :
 *  - Force      : totalPrs / 100
 *  - Endurance  : totalTonnage / 100 000
 *  - Volume     : histories.length / 200
 *  - Régularité : bestStreak (semaines) / 52
 *  - Équilibre  : groupes musculaires distincts / 9
 */

import React, { useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import User from '../model/models/User'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { useDeferredMount } from '../hooks/useDeferredMount'
import HexagonStatsCard from '../components/HexagonStatsCard'
import type { HexagonAxis } from '../components/HexagonStatsCard'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

// ─── Constantes de normalisation ──────────────────────────────────────────────

const MAX_PRS = 100
const MAX_TONNAGE = 100_000
const MAX_HISTORIES = 200
const MAX_STREAK = 52
const MAX_MUSCLE_GROUPS = 9

// ─── Calcul des axes ──────────────────────────────────────────────────────────

function computeHexagonAxes(
  user: User,
  totalHistories: number,
  distinctMuscleGroups: number,
  axisLabels: { force: string; endurance: string; volume: string; regularite: string; equilibre: string },
  colors: ThemeColors,
): HexagonAxis[] {
  return [
    {
      label: axisLabels.force,
      value: Math.min(1, (user.totalPrs ?? 0) / MAX_PRS),
      rawValue: user.totalPrs ?? 0,
      rawMax: MAX_PRS,
      color: colors.primary,
    },
    {
      label: axisLabels.endurance,
      value: Math.min(1, (user.totalTonnage ?? 0) / MAX_TONNAGE),
      rawValue: Math.round(user.totalTonnage ?? 0),
      rawMax: MAX_TONNAGE,
      color: colors.primary,
    },
    {
      label: axisLabels.volume,
      value: Math.min(1, totalHistories / MAX_HISTORIES),
      rawValue: totalHistories,
      rawMax: MAX_HISTORIES,
      color: colors.primary,
    },
    {
      label: axisLabels.regularite,
      value: Math.min(1, (user.bestStreak ?? 0) / MAX_STREAK),
      rawValue: user.bestStreak ?? 0,
      rawMax: MAX_STREAK,
      color: colors.primary,
    },
    {
      label: axisLabels.equilibre,
      value: Math.min(1, distinctMuscleGroups / MAX_MUSCLE_GROUPS),
      rawValue: distinctMuscleGroups,
      rawMax: MAX_MUSCLE_GROUPS,
      color: colors.primary,
    },
  ]
}

// ─── Barre de progression ─────────────────────────────────────────────────────

function AxisDetailRow({ axis, outOf, colors }: { axis: HexagonAxis; outOf: string; colors: ThemeColors }) {
  const pct = Math.round(axis.value * 100)
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.labelRow}>
        <Text style={[detailStyles.label, { color: colors.text }]}>{axis.label}</Text>
        <Text style={[detailStyles.pct, { color: colors.primary }]}>{pct}%</Text>
      </View>
      <View style={[detailStyles.track, { backgroundColor: colors.cardSecondary }]}>
        <View
          style={[
            detailStyles.fill,
            { backgroundColor: colors.primary, width: `${pct}%` },
          ]}
        />
      </View>
      <Text style={[detailStyles.raw, { color: colors.textSecondary }]}>
        {axis.rawValue} {outOf} {axis.rawMax}
      </Text>
    </View>
  )
}

const detailStyles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  pct: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: borderRadius.xxs,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.xxs,
  },
  raw: {
    fontSize: fontSize.xs,
  },
})

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  user: User | null
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
}

function StatsHexagonScreenBase({ user, histories, sets, exercises }: Props) {
  const colors = useColors()
  const { t } = useLanguage()
  const isMounted = useDeferredMount()
  const styles = useStyles(colors)

  // Map exerciseId → muscles[]
  const exerciseMusclesMap = useMemo(
    () => new Map(exercises.map(e => [e.id, e.muscles])),
    [exercises],
  )

  // Groupes musculaires distincts depuis tous les sets
  const distinctMuscleGroups = useMemo(() => {
    const groups = new Set<string>()
    for (const s of sets) {
      const muscles = exerciseMusclesMap.get(s.exerciseId) ?? []
      for (const m of muscles) {
        const trimmed = m.trim()
        if (trimmed) groups.add(trimmed)
      }
    }
    return groups.size
  }, [sets, exerciseMusclesMap])

  const axes = useMemo(() => {
    if (!user) return []
    return computeHexagonAxes(
      user,
      histories.length,
      distinctMuscleGroups,
      t.hexagon.axes,
      colors,
    )
  }, [user, histories.length, distinctMuscleGroups, t.hexagon.axes, colors])

  if (!isMounted) return null

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Titre */}
      <Text style={styles.title}>{t.hexagon.title}</Text>
      <Text style={styles.subtitle}>{t.hexagon.subtitle}</Text>

      {/* Radar chart */}
      {axes.length > 0 && (
        <HexagonStatsCard axes={axes} size={280} colors={colors} />
      )}

      {/* Détail par axe */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>{t.hexagon.detailSection}</Text>
        {axes.map(axis => (
          <AxisDetailRow
            key={axis.label}
            axis={axis}
            outOf={t.hexagon.outOf}
            colors={colors}
          />
        ))}
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
      paddingBottom: spacing.xl,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  user: observeCurrentUser(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
}))

export default enhance(StatsHexagonScreenBase)
