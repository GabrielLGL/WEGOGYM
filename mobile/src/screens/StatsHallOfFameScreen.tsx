import React, { memo, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUnits } from '../contexts/UnitContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { RootStackParamList } from '../navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HallOfFameEntry {
  exerciseId: string
  exerciseName: string
  muscles: string[]
  bestWeight: number
  bestReps: number
  estimated1RM: number
  achievedAt: Date
}

// ─── Medal colors ─────────────────────────────────────────────────────────────

function getMedalColor(rank: number, colors: ThemeColors): string {
  switch (rank) {
    case 1: return colors.gold
    case 2: return colors.silver
    case 3: return colors.bronze
    default: return colors.textSecondary
  }
}

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatShortDate(date: Date, language: string): string {
  try {
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return String(date.getFullYear())
  }
}

// ─── Row Component ─────────────────────────────────────────────────────────────

interface RowProps {
  entry: HallOfFameEntry
  rank: number
  colors: ThemeColors
  language: string
  t: ReturnType<typeof useLanguage>['t']
  onPress: (exerciseId: string) => void
  weightUnit: string
  convertWeight: (kg: number) => number
}

const HallOfFameRow = memo<RowProps>(function HallOfFameRow({ entry, rank, colors, language, t, onPress, weightUnit, convertWeight }: RowProps) {
  const styles = useRowStyles(colors)
  const isMedal = rank <= 3
  const medalColor = getMedalColor(rank, colors)

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(entry.exerciseId)} activeOpacity={0.7}>
      {/* Rang / Médaille */}
      <View style={styles.rankContainer}>
        {isMedal ? (
          <Ionicons name="medal-outline" size={26} color={medalColor} />
        ) : (
          <Text style={[styles.rankText, { color: colors.textSecondary }]}>
            {t.hallOfFame.rank}{rank}
          </Text>
        )}
      </View>

      {/* Infos principales */}
      <View style={styles.info}>
        <Text style={styles.exerciseName} numberOfLines={1}>{entry.exerciseName}</Text>

        <Text style={styles.performance}>
          {entry.bestWeight > 0
            ? `${Math.round(convertWeight(entry.bestWeight))} ${weightUnit} × ${entry.bestReps}  →  ${t.hallOfFame.orm}${Math.round(convertWeight(entry.estimated1RM))} ${weightUnit}`
            : `${entry.bestReps} reps  →  ${t.hallOfFame.orm}${Math.round(convertWeight(entry.estimated1RM))} ${weightUnit}`
          }
        </Text>

        <View style={styles.footer}>
          <View style={styles.muscleChips}>
            {entry.muscles.slice(0, 3).map(m => (
              <View key={m} style={styles.chip}>
                <Text style={styles.chipText}>{m}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.dateText}>
            {t.hallOfFame.achievedOn} {formatShortDate(entry.achievedAt, language)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

function useRowStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.ms,
      marginBottom: spacing.sm,
    },
    rankContainer: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    rankText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    info: {
      flex: 1,
    },
    exerciseName: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    performance: {
      fontSize: fontSize.sm,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    muscleChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      flex: 1,
      marginRight: spacing.xs,
    },
    chip: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    chipText: {
      fontSize: fontSize.caption,
      color: colors.primary,
    },
    dateText: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      flexShrink: 0,
    },
  }), [colors])
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsHallOfFameScreenBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const { weightUnit, convertWeight } = useUnits()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  // Lookup exerciseId → Exercise
  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>()
    for (const ex of exercises) {
      map.set(ex.id, ex)
    }
    return map
  }, [exercises])

  // Calcul des entrées Hall of Fame
  const entries = useMemo<HallOfFameEntry[]>(() => {
    const best = new Map<string, HallOfFameEntry>()

    for (const s of sets) {
      const exercise = exerciseMap.get(s.exerciseId)
      if (!exercise) continue

      const estimated1RM = Math.round(s.weight * (1 + s.reps / 30))
      const existing = best.get(s.exerciseId)

      if (!existing || estimated1RM > existing.estimated1RM) {
        best.set(s.exerciseId, {
          exerciseId: s.exerciseId,
          exerciseName: exercise.name,
          muscles: exercise.muscles,
          bestWeight: s.weight,
          bestReps: s.reps,
          estimated1RM,
          achievedAt: s.createdAt,
        })
      }
    }

    return Array.from(best.values())
      .sort((a, b) => b.estimated1RM - a.estimated1RM)
      .slice(0, 50)
  }, [sets, exerciseMap])

  const handleRowPress = useCallback((exerciseId: string) => {
    navigation.navigate('ExerciseCard', { exerciseId })
  }, [navigation])

  const renderItem = useCallback(({ item, index }: { item: HallOfFameEntry; index: number }) => (
    <HallOfFameRow
      entry={item}
      rank={index + 1}
      colors={colors}
      language={language}
      t={t}
      onPress={handleRowPress}
      weightUnit={weightUnit}
      convertWeight={convertWeight}
    />
  ), [colors, language, t, handleRowPress, weightUnit, convertWeight])

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={item => item.exerciseId}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerCount}>
            <Text style={styles.headerCountBig}>{sets.length}</Text>
            {'  '}{t.hallOfFame.totalPrs}
          </Text>
          <Text style={styles.headerSubtitle}>{t.hallOfFame.subtitle}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="medal-outline" size={56} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t.hallOfFame.emptyTitle}</Text>
          <Text style={styles.emptyMessage}>{t.hallOfFame.emptyMessage}</Text>
        </View>
      }
    />
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
    emptyContainer: {
      alignItems: 'center',
      paddingTop: spacing.xl * 2,
      gap: spacing.sm,
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
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.where('is_pr', true),
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableContent = enhance(StatsHallOfFameScreenBase)

const StatsHallOfFameScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsHallOfFameScreen
