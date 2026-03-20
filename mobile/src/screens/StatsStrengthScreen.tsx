import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import Exercise from '../model/models/Exercise'
import WorkoutSet from '../model/models/Set'
import BodyMeasurement from '../model/models/BodyMeasurement'
import User from '../model/models/User'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import {
  computeStrengthStandards,
  LEVEL_ORDER,
  type StrengthResult,
  type StrengthLevel,
} from '../model/utils/strengthStandardsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import ScreenLoading from '../components/ScreenLoading'
import type { ThemeColors } from '../theme'

// ─── Couleurs par niveau ──────────────────────────────────────────────────────

function getLevelColor(level: StrengthLevel, colors: ThemeColors): string {
  switch (level) {
    case 'beginner': return colors.lightGray
    case 'novice': return colors.blue
    case 'intermediate': return colors.amber
    case 'advanced': return colors.negative
    case 'elite': return colors.purple
  }
}

// ─── Composant LevelDots ──────────────────────────────────────────────────────

interface LevelDotsProps {
  level: StrengthLevel
  colors: ThemeColors
}

function LevelDots({ level, colors }: LevelDotsProps) {
  const currentIdx = LEVEL_ORDER.indexOf(level)
  const styles = useStyles(colors)

  return (
    <View style={styles.dotsRow}>
      {LEVEL_ORDER.map((lvl, idx) => (
        <View
          key={lvl}
          style={[
            styles.dot,
            {
              backgroundColor: idx <= currentIdx
                ? getLevelColor(level, colors)
                : colors.cardSecondary,
            },
          ]}
        />
      ))}
    </View>
  )
}

// ─── Composant LiftCard ───────────────────────────────────────────────────────

interface LiftCardProps {
  result: StrengthResult
  bodyweight: number | null
  colors: ThemeColors
}

function LiftCard({ result, bodyweight, colors }: LiftCardProps) {
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const ss = t.strengthStandards

  const hasData = result.estimated1RM !== null

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{result.exerciseName}</Text>

      {!hasData && result.matchedExerciseId === null ? (
        <Text style={styles.noData}>{ss.notPracticed}</Text>
      ) : !hasData ? (
        <Text style={styles.noData}>{ss.noData}</Text>
      ) : (
        <>
          <View style={styles.orm1Row}>
            <Text style={styles.orm1Label}>{ss.estimated1RM}</Text>
            <Text style={styles.orm1Value}>{result.estimated1RM} kg</Text>
            {result.bodyweightRatio !== null && (
              <Text style={styles.ratioText}>
                ({ss.ratio} : {result.bodyweightRatio}×)
              </Text>
            )}
          </View>

          {result.level !== null ? (
            <>
              <View style={styles.levelRow}>
                <LevelDots level={result.level} colors={colors} />
                <Text style={[styles.levelLabel, { color: getLevelColor(result.level, colors) }]}>
                  {ss.levels[result.level]}
                </Text>
              </View>
              {result.nextLevelThreshold !== null && (
                <Text style={styles.nextLevel}>
                  {ss.nextLevel} : {result.nextLevelThreshold} kg → {ss.levels[LEVEL_ORDER[LEVEL_ORDER.indexOf(result.level) + 1]]}
                </Text>
              )}
            </>
          ) : bodyweight === null ? null : (
            <Text style={styles.noData}>{ss.noData}</Text>
          )}
        </>
      )}
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  user: User | null
  exercises: Exercise[]
  sets: WorkoutSet[]
  measurements: BodyMeasurement[]
}

export function StatsStrengthScreenBase({ exercises, sets, measurements }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const ss = t.strengthStandards

  const bodyweight = useMemo(() => {
    const latest = measurements[0]
    return latest?.weight ?? null
  }, [measurements])

  const results = useMemo(() => {
    const exerciseData = exercises.map(ex => ({ id: ex.id, name: ex.name }))
    const setData = sets.map(s => ({
      weight: s.weight,
      reps: s.reps,
      exerciseId: s.exerciseId,
    }))
    return computeStrengthStandards(exerciseData, setData, bodyweight)
  }, [exercises, sets, bodyweight])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Info poids corporel ── */}
      <View style={styles.infoCard}>
        {bodyweight !== null ? (
          <Text style={styles.infoText}>
            {ss.basedOn.replace('{w}', String(bodyweight))}
          </Text>
        ) : (
          <Text style={styles.infoWarning}>{ss.noBodyweight}</Text>
        )}
      </View>

      {/* ── Liste des lifts ── */}
      {results.map(result => (
        <LiftCard
          key={result.exerciseName}
          result={result}
          bodyweight={bodyweight}
          colors={colors}
        />
      ))}

      {/* ── Disclaimer ── */}
      <Text style={styles.disclaimer}>{ss.disclaimer}</Text>
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
      gap: spacing.sm,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    infoText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    infoWarning: {
      fontSize: fontSize.sm,
      color: colors.primary,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    cardTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    orm1Row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    orm1Label: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    orm1Value: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    ratioText: {
      fontSize: fontSize.xs,
      color: colors.placeholder,
    },
    levelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: borderRadius.xs,
    },
    levelLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    nextLevel: {
      fontSize: fontSize.xs,
      color: colors.placeholder,
    },
    noData: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      fontStyle: 'italic',
    },
    disclaimer: {
      fontSize: fontSize.xs,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: spacing.sm,
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
  measurements: database.get<BodyMeasurement>('body_measurements').query(
    Q.sortBy('date', Q.desc),
    Q.take(1),
  ).observe(),
}))

const ObservableContent = enhance(StatsStrengthScreenBase)

const StatsStrengthScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted ? <ObservableContent /> : <ScreenLoading />}
    </View>
  )
}

export default StatsStrengthScreen
