import React, { useMemo, useState, useRef } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import type { ViewToken } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import User from '../../model/models/User'
import { getMondayOfCurrentWeek } from '../../model/utils/statsHelpers'
import { computeDeloadRecommendation } from '../../model/utils/deloadHelpers'
import { computeFlashback } from '../../model/utils/flashbackHelpers'
import type { FlashbackData } from '../../model/utils/flashbackHelpers'
import { computeMotivation } from '../../model/utils/motivationHelpers'
import { computeExerciseOfWeek } from '../../model/utils/exerciseOfWeekHelpers'
import { WEEK_MS } from '../../model/constants'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeInsightsCarouselProps {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
  user: User | null
}

interface InsightCard {
  key: string
  render: () => React.ReactElement
}

function HomeInsightsCarouselInner({ histories, sets, exercises, user }: HomeInsightsCarouselProps) {
  const colors = useColors()
  const { t, language } = useLanguage()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)
  const [activeIndex, setActiveIndex] = useState(0)

  // Weekly Report data
  const weeklyReportData = useMemo(() => {
    const mondayTs = getMondayOfCurrentWeek()
    const prevMondayTs = mondayTs - 7 * 24 * 60 * 60 * 1000
    const activeHistories = histories.filter(h => h.deletedAt === null && !h.isAbandoned && h.startTime)
    const currentWeekHistoryIds = new Set(
      activeHistories.filter(h => h.startTime!.getTime() >= mondayTs).map(h => h.id)
    )
    const prevWeekHistoryIds = new Set(
      activeHistories.filter(h => {
        const ts = h.startTime!.getTime()
        return ts >= prevMondayTs && ts < mondayTs
      }).map(h => h.id)
    )
    const currentWeekSets = sets.filter(s => currentWeekHistoryIds.has(s.history.id))
    const prevWeekSets = sets.filter(s => prevWeekHistoryIds.has(s.history.id))
    const sessionsCount = currentWeekHistoryIds.size
    const totalVolumeKg = currentWeekSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    const prsCount = currentWeekSets.filter(s => s.isPr).length
    const prevVolume = prevWeekSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    const comparedToPrevious = prevVolume > 0
      ? Math.round(((totalVolumeKg - prevVolume) / prevVolume) * 100)
      : 0
    const muscleVolume = new Map<string, number>()
    const exerciseMuscles = new Map(exercises.map(e => [e.id, e.muscles]))
    for (const s of currentWeekSets) {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      const vol = s.weight * s.reps
      for (const muscle of muscles) {
        const trimmed = muscle.trim()
        if (trimmed) muscleVolume.set(trimmed, (muscleVolume.get(trimmed) ?? 0) + vol)
      }
    }
    const topMuscles = Array.from(muscleVolume.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle]) => muscle)
    return { sessionsCount, totalVolumeKg, prsCount, comparedToPrevious, topMuscles }
  }, [histories, sets, exercises])

  // Flashback
  const flashback1m = useMemo(() => computeFlashback(histories, sets, 1), [histories, sets])
  const flashback3m = useMemo(() => computeFlashback(histories, sets, 3), [histories, sets])

  // Exercise of the week
  const exerciseOfWeek = useMemo(() => computeExerciseOfWeek(exercises, sets), [exercises, sets])

  // Deload
  const deloadRecommendation = useMemo(() => {
    if (!histories.length) return null
    const now = Date.now()
    const weeklyVolumes: number[] = []
    const historyDates = new Map(
      histories.filter(h => h.deletedAt === null && !h.isAbandoned && h.startTime).map(h => [h.id, h.startTime!.getTime()])
    )
    const activeHistoryIds = new Set(historyDates.keys())
    for (let w = 0; w < 5; w++) {
      const weekEnd = now - w * WEEK_MS
      const weekStart = weekEnd - WEEK_MS
      let volume = 0
      for (const s of sets) {
        if (!activeHistoryIds.has(s.history.id)) continue
        const d = historyDates.get(s.history.id) ?? 0
        if (d >= weekStart && d < weekEnd) volume += s.weight * s.reps
      }
      weeklyVolumes.push(volume)
    }
    const historyData = histories
      .filter(h => h.deletedAt === null && !h.isAbandoned)
      .filter(h => h.startTime)
      .map(h => ({ startTime: h.startTime!.getTime(), endTime: h.endTime?.getTime() }))
    return computeDeloadRecommendation({
      histories: historyData,
      weeklyVolumes,
      userLevel: user?.userLevel ?? 'intermediate',
      currentStreak: user?.currentStreak ?? 0,
    })
  }, [histories, sets, user?.userLevel, user?.currentStreak])

  // Motivation
  const motivationData = useMemo(() => computeMotivation(histories), [histories])

  // Build cards array
  const cards = useMemo<InsightCard[]>(() => {
    const result: InsightCard[] = []

    // Card 1: Weekly report (always)
    result.push({
      key: 'weekly',
      render: () => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.home.weeklyReport}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyReportData.sessionsCount}</Text>
              <Text style={styles.statLabel}>{t.home.tiles.sessions}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {weeklyReportData.totalVolumeKg >= 1000
                  ? `${(weeklyReportData.totalVolumeKg / 1000).toFixed(1)}t`
                  : `${Math.round(weeklyReportData.totalVolumeKg)}kg`}
              </Text>
              <Text style={styles.statLabel}>{t.home.lastWorkout.volume}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyReportData.prsCount}</Text>
              <Text style={styles.statLabel}>{t.home.prs}</Text>
            </View>
            {weeklyReportData.comparedToPrevious !== 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {
                  color: weeklyReportData.comparedToPrevious > 0 ? colors.success : colors.danger,
                }]}>
                  {weeklyReportData.comparedToPrevious > 0 ? '+' : ''}{weeklyReportData.comparedToPrevious}%
                </Text>
                <Text style={styles.statLabel}>{t.home.vsLastWeek}</Text>
              </View>
            )}
          </View>
          {weeklyReportData.topMuscles.length > 0 && (
            <Text style={styles.topMuscles}>
              {t.home.topMuscles}: {weeklyReportData.topMuscles.join(', ')}
            </Text>
          )}
        </View>
      ),
    })

    // Card 2: Flashback
    if (flashback1m || flashback3m) {
      result.push({
        key: 'flashback',
        render: () => {
          const renderDelta = (fb: FlashbackData, label: string) => {
            const sessionDelta = weeklyReportData.sessionsCount - fb.sessions
            const volPct = fb.volumeKg > 0
              ? Math.round(((weeklyReportData.totalVolumeKg - fb.volumeKg) / fb.volumeKg) * 100)
              : null
            return (
              <View key={label} style={styles.flashbackRow}>
                <Text style={styles.flashbackLabel}>{label}</Text>
                <View style={styles.flashbackValues}>
                  <Text style={[styles.flashbackDelta, {
                    color: sessionDelta >= 0 ? colors.primary : colors.danger,
                  }]}>
                    {sessionDelta >= 0 ? '+' : ''}{sessionDelta} {t.home.sessions}
                  </Text>
                  {volPct !== null && (
                    <Text style={[styles.flashbackDelta, {
                      color: volPct >= 0 ? colors.primary : colors.danger,
                    }]}>
                      {volPct >= 0 ? '+' : ''}{volPct}% vol
                    </Text>
                  )}
                </View>
              </View>
            )
          }
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.flashback.title}</Text>
              {flashback1m && renderDelta(flashback1m, t.flashback.monthAgo)}
              {flashback3m && renderDelta(flashback3m, t.flashback.threeMonthsAgo)}
            </View>
          )
        },
      })
    }

    // Card 3: Exercise of the week
    if (exerciseOfWeek) {
      result.push({
        key: 'exerciseOfWeek',
        render: () => (
          <View style={styles.card}>
            <View style={styles.exerciseHeader}>
              <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.primary }]}>{t.exerciseOfWeek.title}</Text>
            </View>
            <Text style={styles.exerciseName}>{exerciseOfWeek.exercise.name}</Text>
            <Text style={styles.exerciseSub}>
              {exerciseOfWeek.isNew
                ? t.exerciseOfWeek.neverDone
                : t.exerciseOfWeek.daysAgo.replace('{n}', String(exerciseOfWeek.daysSinceLastDone))}
            </Text>
            {exerciseOfWeek.exercise.muscles.length > 0 && (
              <View style={styles.muscleRow}>
                {exerciseOfWeek.exercise.muscles.slice(0, 3).map(m => (
                  <View key={m} style={styles.muscleChip}>
                    <Text style={styles.muscleChipText}>{m}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ),
      })
    }

    // Card 4: Deload
    if (deloadRecommendation) {
      result.push({
        key: 'deload',
        render: () => (
          <View style={styles.card}>
            <View style={styles.deloadHeader}>
              <Ionicons name="trending-down-outline" size={16} color={colors.amber} />
              <Text style={[styles.cardTitle, { color: colors.amber }]}>{t.deload.title}</Text>
            </View>
            <Text style={styles.deloadText}>
              {t.deload[deloadRecommendation.reasonKey as keyof typeof t.deload] ?? deloadRecommendation.reasonKey}
            </Text>
          </View>
        ),
      })
    }

    // Card 5: Motivation
    if (motivationData && motivationData.context) {
      const ctx = motivationData.context
      const titleMap: Record<string, string> = {
        returning_after_long: t.motivation.returningAfterLongTitle,
        slight_drop: t.motivation.slightDropTitle,
        keep_going: t.motivation.keepGoingTitle,
      }
      const messageMap: Record<string, string> = {
        returning_after_long: t.motivation.returningAfterLongMessage,
        slight_drop: t.motivation.slightDropMessage,
        keep_going: t.motivation.keepGoingMessage,
      }
      const title = titleMap[ctx]
      const message = messageMap[ctx]?.replace('{n}', String(motivationData.daysSinceLastWorkout))
      if (title && message) {
        result.push({
          key: 'motivation',
          render: () => (
            <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
              <View style={styles.motivationHeader}>
                <Ionicons
                  name={ctx === 'returning_after_long' ? 'heart-outline' : 'flame-outline'}
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.cardTitle}>{title}</Text>
              </View>
              <Text style={styles.motivationText}>{message}</Text>
            </View>
          ),
        })
      }
    }

    return result
  }, [weeklyReportData, flashback1m, flashback3m, exerciseOfWeek, deloadRecommendation, motivationData, t, colors, styles])

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index)
    }
  }).current

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  if (cards.length === 0) return null

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            {item.render()}
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToAlignment="center"
        decelerationRate="fast"
      />
      {cards.length > 1 && (
        <View style={styles.dotsRow}>
          {cards.map((c, i) => (
            <View
              key={c.key}
              style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

export const HomeInsightsCarousel = React.memo(HomeInsightsCarouselInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    cardWrapper: {
      width: 320,
      marginRight: spacing.sm,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      minHeight: 140,
    },
    cardTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    topMuscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    flashbackRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    flashbackLabel: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    flashbackValues: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    flashbackDelta: {
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    exerciseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    exerciseName: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    exerciseSub: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    muscleRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    muscleChip: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    muscleChipText: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
    },
    deloadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    deloadText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    motivationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    motivationText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: borderRadius.xxs,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    dotInactive: {
      backgroundColor: colors.border,
    },
  }), [colors])
}
