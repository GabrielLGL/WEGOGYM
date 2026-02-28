import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'
import { useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'

import { database } from '../model'
import Exercise from '../model/models/Exercise'
import WorkoutSet from '../model/models/Set'
import History from '../model/models/History'
import Session from '../model/models/Session'
import { buildExerciseStatsFromData } from '../model/utils/databaseHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'
import type { RootStackParamList } from '../navigation'

type ExerciseHistoryRouteProp = RouteProp<RootStackParamList, 'ExerciseHistory'>

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  exercise: Exercise
  setsForExercise: WorkoutSet[]
  histories: History[]
  sessions: Session[]
}

// ─── Composant principal ──────────────────────────────────────────────────────

function ExerciseHistoryContent({ exercise, setsForExercise, histories, sessions }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const chartConfig = createChartConfig({ showDots: true, colors })
  const { t, language } = useLanguage()
  const { width: screenWidth } = useWindowDimensions()
  const dateLocale = language === 'fr' ? 'fr-FR' : 'en-US'

  const statsForExercise = useMemo(
    () => buildExerciseStatsFromData(setsForExercise, histories, sessions),
    [setsForExercise, histories, sessions],
  )

  const chartStats = useMemo(() => statsForExercise.slice(-15), [statsForExercise])

  const chartData = useMemo(() => {
    if (chartStats.length < 2) return null
    return {
      labels: chartStats.map(s =>
        s.startTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      ),
      datasets: [{ data: chartStats.map(s => s.maxWeight) }],
    }
  }, [chartStats])

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
            <Text style={styles.prValue}>{pr.weight} kg × {pr.reps} reps</Text>
            <Text style={styles.prOneRM}>{t.exerciseHistory.prOneRM}{oneRM} {t.exerciseHistory.prOneRMUnit}</Text>
          </>
        ) : (
          <Text style={styles.prEmpty}>{t.exerciseHistory.prEmpty}</Text>
        )}
      </View>

      {/* Chart */}
      <Text style={styles.sectionTitle}>{t.exerciseHistory.weightEvolution}</Text>
      {chartData ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={screenWidth - spacing.md * 2}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            formatYLabel={val => `${val}kg`}
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
                      {s.weight > 0 ? `${s.weight} kg` : t.exerciseHistory.bodyweight} × {s.reps}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      gap: 4,
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
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
    },
  })
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables(
  ['exerciseId'],
  ({ exerciseId }: { exerciseId: string }) => ({
    exercise: database.get<Exercise>('exercises').findAndObserve(exerciseId),
    setsForExercise: database
      .get<WorkoutSet>('sets')
      .query(Q.where('exercise_id', exerciseId))
      .observe(),
    histories: database
      .get<History>('histories')
      .query(Q.where('deleted_at', null))
      .observe(),
    sessions: database.get<Session>('sessions').query().observe(),
  }),
)

const EnhancedContent = enhance(ExerciseHistoryContent)

// ─── Screen wrapper ───────────────────────────────────────────────────────────

export default function ExerciseHistoryScreen() {
  const route = useRoute<ExerciseHistoryRouteProp>()
  const { exerciseId } = route.params
  const colors = useColors()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <EnhancedContent exerciseId={exerciseId} />
    </View>
  )
}
