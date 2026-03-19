import React, { memo, useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { computeMuscleHeatmap } from '../model/utils/muscleHeatmapHelpers'
import type { MuscleHeatmapEntry, HeatmapPeriod } from '../model/utils/muscleHeatmapHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Carte muscle ─────────────────────────────────────────────────────────────

interface MuscleCardProps {
  entry: MuscleHeatmapEntry
  colors: ThemeColors
  sessionLabel: string
  noDataLabel: string
}

const MuscleCard = memo<MuscleCardProps>(function MuscleCard({ entry, colors, sessionLabel, noDataLabel }: MuscleCardProps) {
  const styles = useCardStyles(colors)
  const isActive = entry.totalVolume > 0

  // Interpolation couleur : textMuted (0%) → primary (100%)
  const barColor = isActive ? colors.primary : colors.placeholder

  const intensityPct = Math.round(entry.intensity * 100)

  const volumeLabel = isActive
    ? `${Math.round(entry.totalVolume).toLocaleString('fr-FR')} kg`
    : '—'

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.header}>
        <Text style={[styles.muscleName, !isActive && styles.textInactive]} numberOfLines={1}>
          {entry.muscle}
        </Text>
        {isActive && (
          <Text style={styles.pct}>{intensityPct}%</Text>
        )}
      </View>

      {/* Barre de progression */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            { width: `${intensityPct}%` as `${number}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.volume, !isActive && styles.textInactive]}>{volumeLabel}</Text>
        {isActive && (
          <Text style={styles.sessions}>{entry.sessionCount} {sessionLabel}</Text>
        )}
        {!isActive && (
          <Text style={styles.noData}>{noDataLabel}</Text>
        )}
      </View>
    </View>
  )
})

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.ms,
      margin: spacing.xs / 2,
    },
    cardInactive: {
      opacity: 0.5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    muscleName: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    textInactive: {
      color: colors.placeholder,
    },
    pct: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: spacing.xs,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.separator,
      borderRadius: borderRadius.xxs,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.xxs,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    volume: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    sessions: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    noData: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
    },
  }), [colors])
}

// ─── Composant principal ──────────────────────────────────────────────────────

const PERIODS: HeatmapPeriod[] = [7, 14, 30]

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsHeatmapScreenBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const [period, setPeriod] = useState<HeatmapPeriod>(30)

  const periodLabels: Record<HeatmapPeriod, string> = {
    7: t.muscleHeatmap.period7,
    14: t.muscleHeatmap.period14,
    30: t.muscleHeatmap.period30,
  }

  const rawSets = useMemo(() => sets.map(s => ({
    weight: s.weight,
    reps: s.reps,
    exerciseId: s.exerciseId,
    createdAt: s.createdAt,
  })), [sets])

  const rawExercises = useMemo(() => exercises.map(e => ({
    id: e.id,
    muscles: e.muscles,
  })), [exercises])

  const entries = useMemo(
    () => computeMuscleHeatmap(rawSets, rawExercises, period),
    [rawSets, rawExercises, period],
  )

  const renderItem = useCallback(({ item }: { item: MuscleHeatmapEntry }) => (
    <MuscleCard
      entry={item}
      colors={colors}
      sessionLabel={t.muscleHeatmap.sessions}
      noDataLabel={t.muscleHeatmap.noData}
    />
  ), [colors, t.muscleHeatmap.sessions, t.muscleHeatmap.noData])

  return (
    <View style={styles.container}>
      {/* ── Toggle période ── */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>
              {periodLabels[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Grille muscles ── */}
      <FlatList
        data={entries}
        keyExtractor={item => item.muscle}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    periodRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.ms,
      paddingHorizontal: spacing.md,
    },
    periodBtn: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.ms,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.card,
    },
    periodBtnActive: {
      backgroundColor: colors.primary,
    },
    periodLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    periodLabelActive: {
      color: colors.primaryText,
      fontWeight: '700',
    },
    columnWrapper: {
      paddingHorizontal: spacing.sm,
    },
    listContent: {
      paddingHorizontal: spacing.xs,
      paddingBottom: spacing.xl + 60,
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

const ObservableContent = enhance(StatsHeatmapScreenBase)

const StatsHeatmapScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsHeatmapScreen
