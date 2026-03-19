import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  getWeekPeriod,
  getMonthPeriod,
  computeReportSummary,
  prepareStatsContext,
  formatVolume,
} from '../model/utils/statsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'
import type { RootStackParamList } from '../navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

type ReportDetailRoute = RouteProp<RootStackParamList, 'ReportDetail'>

interface Props {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
}

// ─── Component ───────────────────────────────────────────────────────────────

function ReportDetailScreenBase({ histories, sets, exercises }: Props) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const route = useRoute<ReportDetailRoute>()

  const initialType = route.params?.type ?? 'weekly'
  const initialOffset = route.params?.offset ?? 0

  const [reportType, setReportType] = useState<'weekly' | 'monthly'>(initialType)
  const [periodOffset, setPeriodOffset] = useState(initialOffset)

  const report = useMemo(() => {
    const period = reportType === 'weekly'
      ? getWeekPeriod(periodOffset)
      : getMonthPeriod(periodOffset)
    const ctx = prepareStatsContext(histories, exercises)
    return computeReportSummary(histories, sets, exercises, period, ctx)
  }, [histories, sets, exercises, reportType, periodOffset])

  const handlePrev = useCallback(() => {
    haptics.onSelect()
    setPeriodOffset(prev => prev - 1)
  }, [haptics])

  const handleNext = useCallback(() => {
    if (periodOffset >= 0) return
    haptics.onSelect()
    setPeriodOffset(prev => prev + 1)
  }, [periodOffset, haptics])

  const handleToggleType = useCallback((type: 'weekly' | 'monthly') => {
    if (type === reportType) return
    haptics.onSelect()
    setReportType(type)
    setPeriodOffset(0)
  }, [reportType, haptics])

  const styles = makeStyles(colors)
  const hasData = report.sessionsCount > 0
  const compSign = report.comparedToPrevious >= 0 ? '+' : ''
  const compColor = report.comparedToPrevious >= 0 ? colors.primary : colors.danger

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Period navigation */}
      <View style={styles.periodNav}>
        <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={[styles.navText, { color: colors.primary }]}>
            {t.home.previous}
          </Text>
        </TouchableOpacity>

        <Text style={styles.periodLabel}>{report.period.label}</Text>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.navButton}
          disabled={periodOffset >= 0}
        >
          <Text style={[styles.navText, { color: periodOffset >= 0 ? colors.textSecondary : colors.primary }]}>
            {t.common.next}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={periodOffset >= 0 ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Toggle hebdo/mensuel */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, reportType === 'weekly' && styles.toggleActive]}
          onPress={() => handleToggleType('weekly')}
        >
          <Text style={[styles.toggleText, reportType === 'weekly' && styles.toggleTextActive]}>
            {t.home.weekly}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, reportType === 'monthly' && styles.toggleActive]}
          onPress={() => handleToggleType('monthly')}
        >
          <Text style={[styles.toggleText, reportType === 'monthly' && styles.toggleTextActive]}>
            {t.home.monthly}
          </Text>
        </TouchableOpacity>
      </View>

      {!hasData ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t.home.noDataForPeriod}</Text>
        </View>
      ) : (
        <>
          {/* Summary section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.home.summary}</Text>
            <View style={styles.card}>
              <View style={styles.kpiRow}>
                <KPI label={t.home.sessions} value={String(report.sessionsCount)} colors={colors} />
                <View style={styles.kpiSep} />
                <KPI label={t.stats.volume} value={formatVolume(report.totalVolumeKg)} colors={colors} />
                <View style={styles.kpiSep} />
                <KPI label={t.home.prs} value={String(report.prsCount)} colors={colors} />
              </View>

              <View style={styles.durationRow}>
                <Text style={styles.durationText}>
                  {report.totalDurationMin} min {t.home.totalDuration}
                </Text>
                <Text style={styles.durationSep}>{'  ·  '}</Text>
                <Text style={styles.durationText}>
                  {report.avgDurationMin} min {t.home.avgDuration}
                </Text>
              </View>

              {report.comparedToPrevious !== 0 && (
                <View style={styles.compRow}>
                  <Ionicons
                    name={report.comparedToPrevious > 0 ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color={compColor}
                  />
                  <Text style={[styles.compText, { color: compColor }]}>
                    {compSign}{report.comparedToPrevious}% {t.home.vsLastWeek}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Top muscles */}
          {report.topMuscles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.home.topMuscles}</Text>
              <View style={styles.card}>
                {report.topMuscles.map((m, i) => (
                  <View key={m.muscle} style={styles.listItem}>
                    <Text style={styles.listRank}>{i + 1}.</Text>
                    <Text style={styles.listName}>{m.muscle}</Text>
                    <Text style={styles.listValue}>{m.pct}%</Text>
                    <Text style={styles.listSub}>{formatVolume(m.volume)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Top exercises */}
          {report.topExercises.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.home.topExercises}</Text>
              <View style={styles.card}>
                {report.topExercises.map((ex, i) => (
                  <View key={ex.exerciseId} style={styles.listItem}>
                    <Text style={styles.listRank}>{i + 1}.</Text>
                    <Text style={styles.listName}>{ex.name}</Text>
                    <Text style={styles.listValue}>{formatVolume(ex.volume)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Personal records */}
          {report.prs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.home.personalRecords}</Text>
              <View style={styles.card}>
                {report.prs.map(pr => (
                  <View key={`${pr.exerciseId}-${pr.date}`} style={styles.prItem}>
                    <Ionicons name="trophy" size={16} color={colors.primary} />
                    <Text style={styles.prName}>{pr.exerciseName}</Text>
                    <Text style={styles.prValue}>
                      {pr.weight}kg × {pr.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Streak */}
          {report.currentStreak > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.home.streakLabel}</Text>
              <View style={styles.card}>
                <View style={styles.streakRow}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakText}>
                    {report.currentStreak} {t.home.consecutiveWeeks}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

// ─── KPI helper ──────────────────────────────────────────────────────────────

function KPI({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
    },
    periodNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.xs,
    },
    navText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    periodLabel: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '700',
      textAlign: 'center',
      flex: 1,
    },
    toggleRow: {
      flexDirection: 'row',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: 3,
      marginBottom: spacing.lg,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xs,
      alignItems: 'center',
    },
    toggleActive: {
      backgroundColor: colors.primary,
    },
    toggleText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    toggleTextActive: {
      color: colors.primaryText,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      marginTop: spacing.md,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    kpiRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.ms,
    },
    kpiSep: {
      width: 1,
      height: 24,
      backgroundColor: colors.cardSecondary,
    },
    durationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    durationText: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    durationSep: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    compRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    compText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginLeft: 4,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    listRank: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      width: 24,
    },
    listName: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      fontWeight: '600',
      flex: 1,
    },
    listValue: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    listSub: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginLeft: spacing.xs,
    },
    prItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    prName: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      fontWeight: '600',
      flex: 1,
    },
    prValue: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    streakEmoji: {
      fontSize: fontSize.xl,
    },
    streakText: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
  })

// ─── withObservables ─────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    ))
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableReportDetail = enhance(ReportDetailScreenBase)

const ReportDetailScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableReportDetail />}
    </View>
  )
}

export default ReportDetailScreen
