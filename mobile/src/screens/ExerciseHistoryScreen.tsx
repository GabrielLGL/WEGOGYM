import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import Exercise from '../model/models/Exercise'
import WorkoutSet from '../model/models/Set'
import History from '../model/models/History'
import Session from '../model/models/Session'
import { buildExerciseStatsFromData } from '../model/utils/databaseHelpers'
import { EPLEY_FORMULA_DIVISOR } from '../model/constants'
import { computePRPrediction } from '../model/utils/prPredictionHelpers'
import { computePlateauAnalysis } from '../model/utils/plateauHelpers'
import { computeVariantSuggestions } from '../model/utils/variantHelpers'
import { computeOverloadTrend } from '../model/utils/progressiveOverloadHelpers'
import { findAlternatives } from '../model/utils/exerciseAlternativesHelpers'
import { getBestRepMax } from '../model/utils/repMaxHelpers'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'
import type { RootStackParamList } from '../navigation'

import ExerciseHistoryChart from '../components/exercise-history/ExerciseHistoryChart'
import type { ChartMetric } from '../components/exercise-history/ExerciseHistoryChart'
import ExerciseHistoryStats from '../components/exercise-history/ExerciseHistoryStats'
import ExerciseHistoryInsights from '../components/exercise-history/ExerciseHistoryInsights'

type ExerciseHistoryRouteProp = RouteProp<RootStackParamList, 'ExerciseHistory'>

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  exercise: Exercise
  setsForExercise: WorkoutSet[]
  histories: History[]
  sessions: Session[]
  allExercises: Exercise[]
  allSets: WorkoutSet[]
}

// ─── Composant principal ──────────────────────────────────────────────────────

function ExerciseHistoryContent({ exercise, setsForExercise, histories, sessions, allExercises, allSets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const chartConfig = createChartConfig({ showDots: true, colors })
  const { t, language } = useLanguage()
  const { width: screenWidth } = useWindowDimensions()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const dateLocale = language === 'fr' ? 'fr-FR' : 'en-US'
  const [chartMetric, setChartMetric] = useState<ChartMetric>('weight')

  const statsForExercise = useMemo(
    () => buildExerciseStatsFromData(setsForExercise, histories, sessions),
    [setsForExercise, histories, sessions],
  )

  const chartStats = useMemo(() => statsForExercise.slice(-15), [statsForExercise])

  const chartData = useMemo(() => {
    if (chartStats.length < 2) return null

    const getData = (stat: (typeof chartStats)[number]): number => {
      switch (chartMetric) {
        case 'weight': return stat.maxWeight
        case 'reps':   return stat.sets.length > 0 ? Math.max(...stat.sets.map(s => s.reps)) : 0
        case 'orm': {
          const maxReps = stat.sets.length > 0 ? Math.max(...stat.sets.map(s => s.reps)) : 0
          return Math.round(stat.maxWeight * (1 + maxReps / EPLEY_FORMULA_DIVISOR))
        }
        case 'volume': return Math.round(stat.sets.reduce((acc, s) => acc + s.weight * s.reps, 0))
      }
    }

    return {
      labels: chartStats.map(s =>
        s.startTime.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' })
      ),
      datasets: [{ data: chartStats.map(getData) }],
    }
  }, [chartStats, chartMetric, dateLocale])

  const reversedStats = useMemo(() => [...statsForExercise].reverse(), [statsForExercise])

  const pr = useMemo(() => {
    let best: { weight: number; reps: number } | null = null
    for (const stat of statsForExercise) {
      for (const s of stat.sets) {
        if (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
          best = { weight: s.weight, reps: s.reps }
        }
      }
    }
    return best
  }, [statsForExercise])

  const oneRM = pr ? Math.round(pr.weight * (1 + pr.reps / 30)) : null

  const prediction = useMemo(
    () => computePRPrediction(setsForExercise),
    [setsForExercise],
  )

  const plateauData = useMemo(
    () => computePlateauAnalysis(setsForExercise),
    [setsForExercise],
  )

  const usedExerciseIds = useMemo(
    () => new Set(setsForExercise.map(s => s.exerciseId).filter((id): id is string => Boolean(id))),
    [setsForExercise],
  )

  const variantSuggestions = useMemo(
    () => exercise && allExercises.length > 0
      ? computeVariantSuggestions(exercise, allExercises, usedExerciseIds)
      : [],
    [exercise, allExercises, usedExerciseIds],
  )

  const { weightTrend, volumeTrend } = useMemo(
    () => computeOverloadTrend(setsForExercise),
    [setsForExercise],
  )

  const alternatives = useMemo(
    () => exercise && allExercises.length > 0
      ? findAlternatives(exercise, allExercises, allSets)
      : [],
    [exercise, allExercises, allSets],
  )

  const repMaxData = useMemo(
    () => getBestRepMax(setsForExercise.map(s => ({ weight: s.weight, reps: s.reps }))),
    [setsForExercise],
  )

  const handleHistoryPress = useCallback((historyId: string) => {
    haptics.onSelect()
    navigation.navigate('HistoryDetail', { historyId })
  }, [navigation, haptics])

  const handleExercisePress = useCallback((exerciseId: string) => {
    haptics.onPress()
    navigation.push('ExerciseHistory', { exerciseId })
  }, [navigation, haptics])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Exercise name header */}
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseSubtitle}>
        {exercise.muscles?.join(', ')} · {exercise.equipment ?? '—'}
      </Text>

      <ExerciseHistoryStats
        pr={pr}
        oneRM={oneRM}
        repMaxData={repMaxData}
        statsForExercise={statsForExercise}
        reversedStats={reversedStats}
        colors={colors}
        t={t}
        language={language}
        onHistoryPress={handleHistoryPress}
      />

      <ExerciseHistoryChart
        chartData={chartData}
        chartMetric={chartMetric}
        onMetricChange={setChartMetric}
        screenWidth={screenWidth}
        chartConfig={chartConfig}
        colors={colors}
        t={t}
      />

      <ExerciseHistoryInsights
        prediction={prediction}
        plateauData={plateauData}
        weightTrend={weightTrend}
        volumeTrend={volumeTrend}
        alternatives={alternatives}
        variantSuggestions={variantSuggestions}
        colors={colors}
        t={t}
        onExercisePress={handleExercisePress}
      />
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
    exerciseName: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    exerciseSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables(
  ['exerciseId'],
  ({ exerciseId }: { exerciseId: string }) => ({
    exercise: database.get<Exercise>('exercises').findAndObserve(exerciseId),
    allExercises: database.get<Exercise>('exercises').query().observe(),
    allSets: database.get<WorkoutSet>('sets').query().observe(),
    setsForExercise: database
      .get<WorkoutSet>('sets')
      .query(Q.where('exercise_id', exerciseId))
      .observe(),
    histories: database
      .get<History>('histories')
      .query(
        Q.where('deleted_at', null),
        Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
        Q.on('sets', Q.where('exercise_id', exerciseId)),
      )
      .observe(),
    sessions: database
      .get<Session>('sessions')
      .query(
        Q.on('histories', [
          Q.where('deleted_at', null),
          Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
          Q.on('sets', Q.where('exercise_id', exerciseId)),
        ]),
      )
      .observe(),
  }),
)

const EnhancedContent = enhance(ExerciseHistoryContent)

// ─── Screen wrapper ───────────────────────────────────────────────────────────

export default function ExerciseHistoryScreen() {
  const route = useRoute<ExerciseHistoryRouteProp>()
  const { exerciseId } = route.params
  const colors = useColors()
  const mounted = useDeferredMount()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <EnhancedContent exerciseId={exerciseId} />}
    </View>
  )
}
