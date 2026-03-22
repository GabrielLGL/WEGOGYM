import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'

import { database } from '../model'
import Exercise from '../model/models/Exercise'
import WorkoutSet from '../model/models/Set'
import { EPLEY_FORMULA_DIVISOR } from '../model/constants'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUnits } from '../contexts/UnitContext'
import type { ThemeColors } from '../theme'
import type { RootStackParamList } from '../navigation'

type ExerciseCardRouteProp = RouteProp<RootStackParamList, 'ExerciseCard'>

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpertiseLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert'

// ─── Dot indicator ────────────────────────────────────────────────────────────

const EXPERTISE_ORDER: ExpertiseLevel[] = ['debutant', 'intermediaire', 'avance', 'expert']

function ExpertiseDots({ level, colors }: { level: ExpertiseLevel; colors: ThemeColors }) {
  const filled = EXPERTISE_ORDER.indexOf(level) + 1
  return (
    <View style={dotStyles.row}>
      {EXPERTISE_ORDER.map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            { backgroundColor: i < filled ? colors.primary : colors.cardSecondary },
          ]}
        />
      ))}
    </View>
  )
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.xs,
  },
})

// ─── KPI cell ─────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string
  value: string
  colors: ThemeColors
}

function KpiCell({ label, value, colors }: KpiProps) {
  return (
    <View style={[kpiStyles.cell, { backgroundColor: colors.cardSecondary }]}>
      <Text style={[kpiStyles.value, { color: colors.primary }]}>{value}</Text>
      <Text style={[kpiStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  )
}

const kpiStyles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
})

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatDate(date: Date, language: string): string {
  try {
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return String(date.getFullYear())
  }
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  exercise: Exercise
  sets: WorkoutSet[]
}

function ExerciseCardContent({ exercise, sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const { weightUnit, convertWeight } = useUnits()

  const best1RM = useMemo(() => {
    if (!sets.length) return 0
    return Math.max(...sets.map(s => Math.round(s.weight * (1 + s.reps / EPLEY_FORMULA_DIVISOR))))
  }, [sets])

  const totalTonnage = useMemo(
    () => sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    [sets]
  )

  const totalSessions = useMemo(() => {
    const dates = new Set(sets.map(s => s.createdAt?.toDateString()).filter(Boolean))
    return dates.size
  }, [sets])

  const prSets = useMemo(() => sets.filter(s => s.isPr), [sets])

  const firstPRDate = useMemo(
    () =>
      prSets.length > 0
        ? new Date(Math.min(...prSets.map(s => s.createdAt?.getTime() ?? Infinity)))
        : null,
    [prSets]
  )

  const lastPRDate = useMemo(
    () => {
      const validPrs = prSets.filter(s => s.createdAt != null)
      return validPrs.length > 0
        ? new Date(Math.max(...validPrs.map(s => s.createdAt!.getTime())))
        : null
    },
    [prSets]
  )

  const expertiseLevel = useMemo((): ExpertiseLevel => {
    if (totalSessions < 5) return 'debutant'
    if (totalSessions < 15) return 'intermediaire'
    if (totalSessions < 30) return 'avance'
    return 'expert'
  }, [totalSessions])

  const convertedTonnage = convertWeight(totalTonnage)
  const tonnageDisplay =
    convertedTonnage >= 1000
      ? `${(convertedTonnage / 1000).toFixed(1)} t`
      : `${Math.round(convertedTonnage)} ${weightUnit}`

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header card */}
      <View style={styles.headerCard}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        {exercise.muscles.length > 0 && (
          <View style={styles.muscleChips}>
            {exercise.muscles.map(m => (
              <View key={m} style={styles.chip}>
                <Text style={styles.chipText}>{m}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* KPI grid — row 1 */}
      <View style={styles.kpiRow}>
        <KpiCell
          label={t.exerciseCard.orm}
          value={best1RM > 0 ? `~${Math.round(convertWeight(best1RM))} ${weightUnit}` : '—'}
          colors={colors}
        />
        <KpiCell
          label={t.exerciseCard.tonnage}
          value={totalTonnage > 0 ? tonnageDisplay : '—'}
          colors={colors}
        />
      </View>

      {/* KPI grid — row 2 */}
      <View style={styles.kpiRow}>
        <KpiCell
          label={t.exerciseCard.sessions}
          value={String(totalSessions)}
          colors={colors}
        />
        <KpiCell
          label={t.exerciseCard.prs}
          value={String(prSets.length)}
          colors={colors}
        />
      </View>

      {/* Expertise */}
      <View style={styles.expertiseCard}>
        <Text style={styles.sectionLabel}>{t.exerciseCard.expertise}</Text>
        <View style={styles.expertiseRow}>
          <ExpertiseDots level={expertiseLevel} colors={colors} />
          <Text style={styles.expertiseLabel}>
            {t.exerciseCard.expertiseLevels[expertiseLevel]}
          </Text>
        </View>
      </View>

      {/* PR history */}
      <View style={styles.prCard}>
        {firstPRDate && lastPRDate ? (
          <>
            <View style={styles.prRow}>
              <Text style={styles.prLabel}>{t.exerciseCard.firstPR}</Text>
              <Text style={styles.prDate}>{formatDate(firstPRDate, language)}</Text>
            </View>
            <View style={styles.prRow}>
              <Text style={styles.prLabel}>{t.exerciseCard.lastPR}</Text>
              <Text style={styles.prDate}>{formatDate(lastPRDate, language)}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noPr}>{t.exerciseCard.noPRYet}</Text>
        )}
      </View>
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          padding: spacing.md,
          paddingBottom: spacing.xl + 60,
          gap: spacing.sm,
        },
        headerCard: {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.xs,
        },
        exerciseName: {
          fontSize: fontSize.xl,
          fontWeight: '900',
          color: colors.text,
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: spacing.sm,
        },
        muscleChips: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: spacing.xs,
        },
        chip: {
          backgroundColor: colors.cardSecondary,
          borderRadius: borderRadius.xxs,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
        },
        chipText: {
          fontSize: fontSize.xs,
          color: colors.primary,
        },
        kpiRow: {
          flexDirection: 'row',
          gap: spacing.sm,
        },
        expertiseCard: {
          backgroundColor: colors.card,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
        sectionLabel: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        expertiseRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        expertiseLabel: {
          fontSize: fontSize.bodyMd,
          fontWeight: '700',
          color: colors.text,
        },
        prCard: {
          backgroundColor: colors.card,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
        prRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        prLabel: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
        },
        prDate: {
          fontSize: fontSize.sm,
          color: colors.text,
          fontWeight: '600',
        },
        noPr: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          textAlign: 'center',
          fontStyle: 'italic',
        },
      }),
    [colors]
  )
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables(
  ['exerciseId'],
  ({ exerciseId }: { exerciseId: string }) => ({
    exercise: database.get<Exercise>('exercises').findAndObserve(exerciseId),
    sets: database
      .get<WorkoutSet>('sets')
      .query(
        Q.on(
          'histories',
          Q.and(
            Q.where('deleted_at', null),
            Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false))
          )
        ),
        Q.where('exercise_id', exerciseId)
      )
      .observe(),
  })
)

const EnhancedContent = enhance(ExerciseCardContent)

// ─── Screen wrapper ───────────────────────────────────────────────────────────

export default function ExerciseCardScreen() {
  const route = useRoute<ExerciseCardRouteProp>()
  const { exerciseId } = route.params
  const colors = useColors()
  const mounted = useDeferredMount()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <EnhancedContent exerciseId={exerciseId} />}
    </View>
  )
}
