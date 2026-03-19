import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
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
import { WEEK_MS } from '../../model/constants'
import { WeeklyReportCard } from '../WeeklyReportCard'
import DeloadRecommendationCard from '../DeloadRecommendationCard'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeInsightsSectionProps {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
  user: User | null
}

// ── Flashback Card ──────────────────────────────────────────────────────────

function FlashbackCard({
  currentSessions,
  currentVolume,
  flashback1m,
  flashback3m,
}: {
  currentSessions: number
  currentVolume: number
  flashback1m: FlashbackData | null
  flashback3m: FlashbackData | null
}) {
  const colors = useColors()
  const { t } = useLanguage()

  const cardStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  }), [colors])

  const titleStyle = useMemo(() => ({
    fontSize: fontSize.md,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  }), [colors])

  const periodLabelStyle = useMemo(() => ({
    fontSize: fontSize.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  }), [colors])

  const colHeaderStyle = useMemo(() => ({
    fontSize: fontSize.xs,
    color: colors.placeholder,
    marginBottom: spacing.xs,
  }), [colors])

  const statValueStyle = useMemo(() => ({
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500' as const,
  }), [colors])

  const renderPeriod = (flashback: FlashbackData, label: string) => {
    const sessionDelta = currentSessions - flashback.sessions
    const volumePct = flashback.volumeKg > 0
      ? Math.round(((currentVolume - flashback.volumeKg) / flashback.volumeKg) * 100)
      : null
    const sessionDeltaColor = sessionDelta >= 0 ? colors.primary : colors.danger
    const volumeDeltaColor = (volumePct ?? 0) >= 0 ? colors.primary : colors.danger

    return (
      <View key={label}>
        <Text style={periodLabelStyle}>{label}</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={colHeaderStyle}>{t.flashback.thisWeek}</Text>
            <Text style={statValueStyle}>{currentSessions} {t.flashback.sessions}</Text>
            <Text style={statValueStyle}>{Math.round(currentVolume)} kg</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.separator, marginHorizontal: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={colHeaderStyle}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={statValueStyle}>{flashback.sessions} {t.flashback.sessions}</Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: sessionDeltaColor }}>
                {sessionDelta >= 0 ? '+' : ''}{sessionDelta}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={statValueStyle}>{Math.round(flashback.volumeKg)} kg</Text>
              {volumePct !== null && (
                <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: volumeDeltaColor }}>
                  {volumePct >= 0 ? '+' : ''}{volumePct}%
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={cardStyle}>
      <Text style={titleStyle}>📸 {t.flashback.title}</Text>
      {flashback1m && renderPeriod(flashback1m, t.flashback.monthAgo)}
      {flashback1m && flashback3m && (
        <View style={{ height: 1, backgroundColor: colors.separator, marginVertical: spacing.sm }} />
      )}
      {flashback3m && renderPeriod(flashback3m, t.flashback.threeMonthsAgo)}
    </View>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function HomeInsightsSection({ histories, sets, exercises, user }: HomeInsightsSectionProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  // Weekly Report data
  const weeklyReportData = useMemo(() => {
    const mondayTs = getMondayOfCurrentWeek()
    const prevMondayTs = mondayTs - 7 * 24 * 60 * 60 * 1000

    const activeHistories = histories.filter(h => h.deletedAt === null && !h.isAbandoned)
    const activeHistoryIds = new Set(activeHistories.map(h => h.id))

    const currentWeekHistoryIds = new Set(
      activeHistories.filter(h => h.startTime.getTime() >= mondayTs).map(h => h.id)
    )
    const prevWeekHistoryIds = new Set(
      activeHistories.filter(h => {
        const ts = h.startTime.getTime()
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
        if (trimmed) {
          muscleVolume.set(trimmed, (muscleVolume.get(trimmed) ?? 0) + vol)
        }
      }
    }
    const topMuscles = Array.from(muscleVolume.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle]) => muscle)

    return { sessionsCount, totalVolumeKg, prsCount, comparedToPrevious, topMuscles }
  }, [histories, sets, exercises])

  // Deload recommendation
  const [dismissedDeload, setDismissedDeload] = useState(false)
  const deloadRecommendation = useMemo(() => {
    if (!histories.length) return null

    const now = Date.now()
    const weeklyVolumes: number[] = []
    const historyDates = new Map(
      histories
        .filter(h => h.deletedAt === null && !h.isAbandoned)
        .map(h => [h.id, h.startTime.getTime()])
    )
    const activeHistoryIds = new Set(historyDates.keys())

    for (let w = 0; w < 5; w++) {
      const weekEnd = now - w * WEEK_MS
      const weekStart = weekEnd - WEEK_MS
      let volume = 0
      for (const s of sets) {
        if (!activeHistoryIds.has(s.history.id)) continue
        const d = historyDates.get(s.history.id) ?? 0
        if (d >= weekStart && d < weekEnd) {
          volume += s.weight * s.reps
        }
      }
      weeklyVolumes.push(volume)
    }

    const historyData = histories
      .filter(h => h.deletedAt === null && !h.isAbandoned)
      .map(h => ({ startTime: h.startTime.getTime(), endTime: h.endTime?.getTime() }))

    return computeDeloadRecommendation({
      histories: historyData,
      weeklyVolumes,
      userLevel: user?.userLevel ?? 'intermediate',
      currentStreak: user?.currentStreak ?? 0,
    })
  }, [histories, sets, user?.userLevel, user?.currentStreak])

  // Flashback data
  const flashback1m = useMemo(
    () => computeFlashback(histories, sets, 1),
    [histories, sets],
  )
  const flashback3m = useMemo(
    () => computeFlashback(histories, sets, 3),
    [histories, sets],
  )

  // Motivation contextuelle — fix #4: optional chaining instead of !
  const motivationData = useMemo(
    () => computeMotivation(histories),
    [histories],
  )
  const motivationTitle = motivationData?.context
    ? {
        returning_after_long: t.motivation.returningAfterLongTitle,
        slight_drop: t.motivation.slightDropTitle,
        keep_going: t.motivation.keepGoingTitle,
      }[motivationData.context]
    : null
  const motivationMessage = motivationData?.context
    ? {
        returning_after_long: t.motivation.returningAfterLongMessage,
        slight_drop: t.motivation.slightDropMessage,
        keep_going: t.motivation.keepGoingMessage,
      }[motivationData.context]?.replace('{n}', String(motivationData.daysSinceLastWorkout))
    : null

  return (
    <>
      {/* Motivation contextuelle */}
      {motivationData && motivationTitle && motivationMessage && (
        <View style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Ionicons
              name={motivationData.context === 'returning_after_long' ? 'heart-outline' : 'flame-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.motivationTitle}>{motivationTitle}</Text>
          </View>
          <Text style={styles.motivationText}>{motivationMessage}</Text>
        </View>
      )}

      {/* Weekly Report Card */}
      <WeeklyReportCard
        sessionsCount={weeklyReportData.sessionsCount}
        totalVolumeKg={weeklyReportData.totalVolumeKg}
        prsCount={weeklyReportData.prsCount}
        comparedToPrevious={weeklyReportData.comparedToPrevious}
        topMuscles={weeklyReportData.topMuscles}
        onPress={() => {
          try {
            navigation.navigate('ReportDetail' as never)
          } catch {
            if (__DEV__) console.warn('[HomeScreen] Route "ReportDetail" non disponible')
          }
        }}
      />

      {/* Flashback */}
      {(flashback1m !== null || flashback3m !== null) && (
        <FlashbackCard
          currentSessions={weeklyReportData.sessionsCount}
          currentVolume={weeklyReportData.totalVolumeKg}
          flashback1m={flashback1m}
          flashback3m={flashback3m}
        />
      )}

      {/* Deload Recommendation */}
      {deloadRecommendation && !dismissedDeload && (
        <DeloadRecommendationCard
          recommendation={deloadRecommendation}
          onDismiss={() => setDismissedDeload(true)}
        />
      )}
    </>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    motivationCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    motivationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    motivationTitle: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '700',
    },
    motivationText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  }), [colors])
}
