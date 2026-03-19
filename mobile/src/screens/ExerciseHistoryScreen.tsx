import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'
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
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'
import type { RootStackParamList } from '../navigation'

type ExerciseHistoryRouteProp = RouteProp<RootStackParamList, 'ExerciseHistory'>

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartMetric = 'weight' | 'reps' | 'orm' | 'volume'

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

  // Compute PR (best weight × reps across all sessions)
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

      {/* PR Card */}
      <View style={styles.prCard}>
        <View style={styles.prHeader}>
          <Ionicons name="trophy-outline" size={20} color={colors.warning} />
          <Text style={styles.prTitle}>{t.exerciseHistory.pr}</Text>
        </View>
        {pr ? (
          <>
            <Text style={styles.prValue}>{pr.weight} {t.statsMeasurements.weightUnit} × {pr.reps} {t.workout.reps}</Text>
            <Text style={styles.prOneRM}>{t.exerciseHistory.prOneRM}{oneRM} {t.exerciseHistory.prOneRMUnit}</Text>
          </>
        ) : (
          <Text style={styles.prEmpty}>{t.exerciseHistory.prEmpty}</Text>
        )}
      </View>

      {/* Chart */}
      {/* ── Metric toggle ── */}
      <View style={styles.metricToggle}>
        {(['weight', 'reps', 'orm', 'volume'] as ChartMetric[]).map(metric => (
          <TouchableOpacity
            key={metric}
            style={[styles.metricChip, chartMetric === metric && styles.metricChipActive]}
            onPress={() => setChartMetric(metric)}
          >
            <Text style={[styles.metricChipText, chartMetric === metric && styles.metricChipTextActive]}>
              {t.exerciseHistory.chartMetric[metric]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>{t.exerciseHistory.chartMetric[chartMetric]}</Text>
      {chartData ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={screenWidth - spacing.md * 2}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            formatYLabel={val => (chartMetric === 'weight' || chartMetric === 'orm') ? `${val}${t.statsMeasurements.weightUnit}` : val}
            formatXLabel={val => (chartData.labels.length > 6 ? '' : val)}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t.exerciseHistory.chartEmpty}
          </Text>
        </View>
      )}

      {/* Rep Max Estimator */}
      {repMaxData && (
        <View style={styles.repMaxCard}>
          <Text style={styles.repMaxTitle}>{t.exerciseHistory.repMax.title}</Text>
          <View style={styles.repMaxRow}>
            <View style={styles.repMaxStat}>
              <Text style={styles.repMaxValue}>{repMaxData.estimated1RM} {t.statsMeasurements.weightUnit}</Text>
              <Text style={styles.repMaxLabel}>{t.exerciseHistory.repMax.estimated1RM}</Text>
            </View>
            <View style={styles.repMaxStat}>
              <Text style={styles.repMaxValue}>{repMaxData.estimated3RM} {t.statsMeasurements.weightUnit}</Text>
              <Text style={styles.repMaxLabel}>{t.exerciseHistory.repMax.estimated3RM}</Text>
            </View>
            <View style={styles.repMaxStat}>
              <Text style={styles.repMaxValue}>{repMaxData.estimated5RM} {t.statsMeasurements.weightUnit}</Text>
              <Text style={styles.repMaxLabel}>{t.exerciseHistory.repMax.estimated5RM}</Text>
            </View>
          </View>
          <Text style={styles.repMaxBestSet}>
            {t.exerciseHistory.repMax.bestSet
              .replace('{weight}', String(repMaxData.bestWeight))
              .replace('{reps}', String(repMaxData.bestReps))}
          </Text>
          <Text style={styles.repMaxDisclaimer}>{t.exerciseHistory.repMax.disclaimer}</Text>
        </View>
      )}

      {/* Progressive overload section */}
      {weightTrend.lastSessions >= 3 && (
        <View style={styles.overloadSection}>
          <Text style={styles.overloadTitle}>{t.exerciseHistory.overload.title}</Text>

          <View style={styles.overloadRow}>
            <Ionicons name="barbell-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.overloadLabel}>{t.exerciseHistory.overload.maxWeight}</Text>
            <View style={styles.overloadTrendBadge}>
              <Text style={[
                styles.overloadTrendText,
                { color: weightTrend.trend === 'up' ? colors.primary
                  : weightTrend.trend === 'down' ? colors.danger
                  : colors.textSecondary },
              ]}>
                {weightTrend.trend === 'up' ? '↑' : weightTrend.trend === 'down' ? '↓' : '→'}
                {' '}{Math.abs(weightTrend.percentChange).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.overloadRow}>
            <Ionicons name="trending-up-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.overloadLabel}>{t.exerciseHistory.overload.volume}</Text>
            <View style={styles.overloadTrendBadge}>
              <Text style={[
                styles.overloadTrendText,
                { color: volumeTrend.trend === 'up' ? colors.primary
                  : volumeTrend.trend === 'down' ? colors.danger
                  : colors.textSecondary },
              ]}>
                {volumeTrend.trend === 'up' ? '↑' : volumeTrend.trend === 'down' ? '↓' : '→'}
                {' '}{Math.abs(volumeTrend.percentChange).toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.overloadDisclaimer}>
            {t.exerciseHistory.overload.disclaimer.replace('{n}', String(weightTrend.lastSessions))}
          </Text>
        </View>
      )}

      {/* Alternatives Section */}
      {alternatives.length > 0 && (
        <View style={styles.alternativesSection}>
          <Text style={styles.alternativesTitle}>{t.exerciseHistory.alternatives.title}</Text>
          {alternatives.map(alt => (
            <TouchableOpacity
              key={alt.exerciseId}
              style={styles.alternativeRow}
              onPress={() => {
                haptics.onPress()
                navigation.push('ExerciseHistory', { exerciseId: alt.exerciseId })
              }}
            >
              <View style={styles.alternativeInfo}>
                <Text style={styles.alternativeName}>{alt.exerciseName}</Text>
                <Text style={styles.alternativeMuscles}>{alt.sharedMuscles.join(', ')}</Text>
              </View>
              <View style={styles.alternativeMeta}>
                <Text style={styles.alternativeSets}>
                  {alt.totalSets} {t.exerciseHistory.alternatives.sets}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* History list */}
      <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
        {t.exerciseHistory.fullHistory} ({statsForExercise.length} {statsForExercise.length !== 1 ? t.home.sessions : t.home.session})
      </Text>

      {reversedStats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.exerciseHistory.noHistory}</Text>
        </View>
      ) : (
        <View style={styles.historyCard}>
          {reversedStats.map((stat, index) => (
            <View key={stat.historyId}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historySession}>{stat.sessionName}</Text>
                  <Text style={styles.historyDate}>
                    {stat.startTime.toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.historySets}>
                  {stat.sets.map((s, si) => (
                    <Text key={si} style={styles.setChip}>
                      {s.weight > 0 ? `${s.weight} ${t.statsMeasurements.weightUnit}` : t.exerciseHistory.bodyweight} × {s.reps}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.onSelect()
                    navigation.navigate('HistoryDetail', { historyId: stat.historyId })
                  }}
                  style={styles.editBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Prediction Section */}
      {prediction !== null && (
        <>
          <View style={styles.separator} />
          <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
            {t.exerciseHistory.prediction.title}
          </Text>
          <View style={styles.predictionCard}>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>
                📈 {t.exerciseHistory.prediction.currentOrm}
              </Text>
              <Text style={styles.predictionValue}>
                ~{prediction.currentBest1RM.toFixed(1)} {t.statsMeasurements.weightUnit}
              </Text>
            </View>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>
                🎯 {t.exerciseHistory.prediction.nextTarget}
              </Text>
              <Text style={[styles.predictionValue, styles.predictionTarget]}>
                ~{prediction.targetWeight.toFixed(1)} {t.statsMeasurements.weightUnit}
              </Text>
            </View>
            {prediction.weeksToTarget > 52 ? (
              <Text style={styles.predictionTooFar}>
                {t.exerciseHistory.prediction.tooFar}
              </Text>
            ) : (
              <>
                <Text style={styles.predictionWeeks}>
                  ⏱  {t.exerciseHistory.prediction.weeksAway.replace('{n}', String(prediction.weeksToTarget))}
                </Text>
                <Text style={styles.predictionGain}>
                  {t.exerciseHistory.prediction.weeklyGain.replace('{n}', prediction.weeklyGainRate.toFixed(1))}
                </Text>
              </>
            )}
            <View style={styles.predictionConfidenceRow}>
              <Text style={styles.predictionLabel}>
                {t.exerciseHistory.prediction.confidence} :
              </Text>
              <Text style={styles.predictionDots}>
                {prediction.confidence === 'low' && '●○○'}
                {prediction.confidence === 'medium' && '●●○'}
                {prediction.confidence === 'high' && '●●●'}
              </Text>
              <Text style={styles.predictionLabel}>
                {prediction.confidence === 'low' && t.exerciseHistory.prediction.confidenceLow}
                {prediction.confidence === 'medium' && t.exerciseHistory.prediction.confidenceMedium}
                {prediction.confidence === 'high' && t.exerciseHistory.prediction.confidenceHigh}
              </Text>
              <Text style={styles.predictionBasedOn}>
                ({t.exerciseHistory.prediction.basedOn.replace('{n}', String(prediction.dataPoints))})
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Plateau Section */}
      {plateauData?.isPlateauing && (
        <View>
          <View style={styles.separator} />
          <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
            {t.exerciseHistory.plateau.title}
          </Text>
          <View style={styles.plateauCard}>
            <View style={styles.plateauHeader}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
              <Text style={styles.plateauAlert}>
                {t.exerciseHistory.plateau.alert
                  .replace('{sessions}', String(plateauData.sessionsSinceLastPR))
                  .replace('{days}', String(plateauData.daysSinceLastProgress))}
              </Text>
            </View>
            <Text style={styles.plateauSubtitle}>{t.exerciseHistory.plateau.suggestions}</Text>
            {plateauData.strategies.map(strategy => (
              <View key={strategy} style={styles.strategyRow}>
                <Text style={styles.strategyBullet}>•</Text>
                <Text style={styles.strategyText}>
                  {t.exerciseHistory.plateau.strategies[strategy]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Variants Section */}
      {variantSuggestions.length > 0 && (
        <View>
          <View style={styles.separator} />
          <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
            {t.exerciseHistory.variants.title}
          </Text>
          <View style={styles.historyCard}>
            {variantSuggestions.map((variant, index) => (
              <TouchableOpacity
                key={variant.exercise.id}
                style={styles.variantRow}
                onPress={() => {
                  haptics.onPress()
                  navigation.push('ExerciseHistory', { exerciseId: variant.exercise.id })
                }}
                activeOpacity={0.7}
              >
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.variantContent}>
                  <View style={styles.variantLeft}>
                    <Text style={styles.variantName}>{variant.exercise.name}</Text>
                    <Text style={styles.variantMuscles}>{variant.sharedMuscles.join(' · ')}</Text>
                  </View>
                  <View style={styles.variantRight}>
                    {variant.hasHistory
                      ? <Text style={styles.variantDone}>{t.exerciseHistory.variants.done}</Text>
                      : <Text style={styles.variantNew}>{t.exerciseHistory.variants.discover}</Text>
                    }
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
    prCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    prHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    prTitle: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    prValue: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    prOneRM: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    prEmpty: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    historySectionTitle: {
      marginTop: spacing.lg,
    },
    chartWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    chart: {
      borderRadius: borderRadius.md,
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    historyInfo: {
      flex: 1,
    },
    historySession: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    historyDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    historySets: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      flex: 1,
      justifyContent: 'flex-end',
    },
    setChip: {
      fontSize: fontSize.xs,
      color: colors.primary,
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    editBtn: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
    },
    predictionCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    predictionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    predictionLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    predictionValue: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    predictionTarget: {
      color: colors.warning,
    },
    predictionWeeks: {
      fontSize: fontSize.sm,
      color: colors.text,
      marginTop: spacing.xs,
    },
    predictionGain: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    predictionTooFar: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    predictionConfidenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    predictionDots: {
      fontSize: fontSize.sm,
      color: colors.primary,
    },
    predictionBasedOn: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    plateauCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    plateauHeader: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    plateauAlert: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    plateauSubtitle: {
      fontSize: fontSize.xs,
      color: colors.text,
      fontWeight: '600' as const,
      marginBottom: spacing.xs,
    },
    strategyRow: {
      flexDirection: 'row' as const,
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    strategyBullet: {
      color: colors.primary,
      fontWeight: '700' as const,
    },
    strategyText: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 17,
    },
    metricToggle: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.sm,
      flexWrap: 'wrap' as const,
    },
    metricChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
    },
    metricChipActive: {
      backgroundColor: colors.primary,
    },
    metricChipText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500' as const,
    },
    metricChipTextActive: {
      color: colors.background,
      fontWeight: '700' as const,
    },
    variantRow: {
      paddingHorizontal: spacing.md,
    },
    variantContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: spacing.sm,
    },
    variantLeft: {
      flex: 1,
    },
    variantName: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '500' as const,
    },
    variantMuscles: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    variantRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
    },
    variantDone: {
      fontSize: fontSize.caption,
      color: colors.primary,
      fontWeight: '500' as const,
    },
    variantNew: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
    },
    alternativesSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    alternativesTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    alternativeRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.cardSecondary,
    },
    alternativeInfo: {
      flex: 1,
    },
    alternativeName: {
      fontSize: fontSize.sm,
      fontWeight: '600' as const,
      color: colors.text,
    },
    alternativeMuscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    alternativeMeta: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
    },
    alternativeSets: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    repMaxCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    repMaxTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    repMaxRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: spacing.sm,
    },
    repMaxStat: {
      alignItems: 'center' as const,
      flex: 1,
    },
    repMaxValue: {
      fontSize: fontSize.md,
      fontWeight: '700' as const,
      color: colors.primary,
    },
    repMaxLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    repMaxBestSet: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
    },
    repMaxDisclaimer: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    overloadSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    overloadTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    overloadRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    overloadLabel: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    overloadTrendBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
    },
    overloadTrendText: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
    },
    overloadDisclaimer: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
      marginTop: spacing.sm,
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
