import React, { useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import { EmptyState } from '../components/EmptyState'
import Exercise from '../model/models/Exercise'
import WorkoutSet from '../model/models/Set'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollectionEntry {
  exercise: Exercise
  discovered: boolean
  setsCount: number
  lastDoneMs: number | null
}

// ─── Composant carte ──────────────────────────────────────────────────────────

interface CardProps {
  entry: CollectionEntry
  colors: ThemeColors
  setsLabel: string
  lockedLabel: string
}

function ExerciseCard({ entry, colors, setsLabel, lockedLabel }: CardProps) {
  const styles = useCardStyles(colors)
  const { exercise, discovered, setsCount } = entry

  if (!discovered) {
    return (
      <View style={[styles.card, styles.lockedCard]}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedName} numberOfLines={2}>
          {exercise.name.replace(/./g, '?')}
        </Text>
        <Text style={styles.lockedLabel}>{lockedLabel}</Text>
      </View>
    )
  }

  const muscles = exercise.muscles.slice(0, 2).join(', ')

  return (
    <View style={[styles.card, styles.discoveredCard]}>
      <Text style={styles.checkIcon}>✅</Text>
      <Text style={styles.exerciseName} numberOfLines={2}>
        {exercise.name}
      </Text>
      {muscles ? (
        <Text style={styles.muscles} numberOfLines={1}>{muscles}</Text>
      ) : null}
      <Text style={styles.setsCount}>
        {setsCount} {setsLabel}
      </Text>
    </View>
  )
}

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      margin: spacing.xs / 2,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      minHeight: 110,
      justifyContent: 'space-between',
    },
    discoveredCard: {
      backgroundColor: colors.card,
    },
    lockedCard: {
      backgroundColor: colors.cardSecondary,
    },
    checkIcon: {
      fontSize: fontSize.md,
    },
    lockIcon: {
      fontSize: fontSize.md,
    },
    exerciseName: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.text,
      marginTop: 4,
    },
    muscles: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    setsCount: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },
    lockedName: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.placeholder,
      marginTop: 4,
      letterSpacing: 1,
    },
    lockedLabel: {
      fontSize: 11,
      color: colors.placeholder,
      marginTop: 4,
    },
  }), [colors])
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  exercises: Exercise[]
  sets: WorkoutSet[]
}

function ExerciseCollectionBase({ exercises, sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const { entries, discoveredCount } = useMemo(() => {
    // Construire un Map exerciseId → {setsCount, lastDoneMs}
    const statsMap = new Map<string, { setsCount: number; lastDoneMs: number | null }>()

    for (const s of sets) {
      const existing = statsMap.get(s.exerciseId)
      const createdMs = s.createdAt ? s.createdAt.getTime() : null
      if (existing) {
        existing.setsCount += 1
        if (createdMs && (existing.lastDoneMs === null || createdMs > existing.lastDoneMs)) {
          existing.lastDoneMs = createdMs
        }
      } else {
        statsMap.set(s.exerciseId, { setsCount: 1, lastDoneMs: createdMs })
      }
    }

    const list: CollectionEntry[] = exercises.map(exercise => {
      const stats = statsMap.get(exercise.id)
      return {
        exercise,
        discovered: stats !== undefined,
        setsCount: stats?.setsCount ?? 0,
        lastDoneMs: stats?.lastDoneMs ?? null,
      }
    })

    // Trier : découverts en premier (par lastDoneMs desc), puis verrouillés (par nom)
    list.sort((a, b) => {
      if (a.discovered && !b.discovered) return -1
      if (!a.discovered && b.discovered) return 1
      if (a.discovered && b.discovered) {
        const aMs = a.lastDoneMs ?? 0
        const bMs = b.lastDoneMs ?? 0
        return bMs - aMs
      }
      return a.exercise.name.localeCompare(b.exercise.name)
    })

    return {
      entries: list,
      discoveredCount: list.filter(e => e.discovered).length,
    }
  }, [exercises, sets])

  const total = exercises.length
  const progressRatio = total > 0 ? discoveredCount / total : 0
  const progressPercent = Math.round(progressRatio * 100)

  if (total === 0) {
    return (
      <View style={styles.empty}>
        <EmptyState
          icon="barbell-outline"
          title={t.emptyStates.collectionTitle}
          message={t.emptyStates.collectionMessage}
        />
      </View>
    )
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.exercise.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>✦ {t.exerciseCollection.title}</Text>
          <Text style={styles.headerSubtitle}>
            {discoveredCount} / {total} {t.exerciseCollection.subtitle}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {progressPercent}% {t.exerciseCollection.progressLabel}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <ExerciseCard
          entry={item}
          colors={colors}
          setsLabel={t.exerciseCollection.sets}
          lockedLabel={t.exerciseCollection.locked}
        />
      )}
      columnWrapperStyle={styles.row}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    list: {
      padding: spacing.md,
      paddingBottom: spacing.xl + 60,
    },
    row: {
      marginHorizontal: -spacing.xs / 2,
    },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xxs,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xxs,
    },
    progressLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    emptyMessage: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  exercises: database.get<Exercise>('exercises').query().observe(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
}))

const ObservableContent = enhance(ExerciseCollectionBase)

/**
 * ExerciseCollectionScreen — Affiche tous les exercices à la façon d'un Pokédex.
 * Les exercices pratiqués au moins une fois sont "découverts" (nom visible),
 * les autres sont verrouillés (nom masqué par "?????").
 */
const ExerciseCollectionScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default ExerciseCollectionScreen
