/**
 * StatsCalendarScreen — Écran calendrier des statistiques d'entraînement
 *
 * Affiche un calendrier mensuel avec :
 * - Les jours d'entraînement colorés (avec nombre de séances)
 * - Les streaks (série actuelle + record)
 * - Le détail d'une journée au clic (exercices, séries, PRs)
 * - Navigation mois par mois avec swipe
 * - Suppression soft-delete d'un historique
 *
 * Données : History[] observés via withObservables (réactif, soft-delete filtré)
 */

import React, { useMemo, useState, useCallback } from 'react'
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

import { database } from '../model'
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { useMonthNavigation } from '../hooks/useMonthNavigation'
import { useCalendarDayDetail } from '../hooks/useCalendarDayDetail'
import type { DayCell, WeekRow, DayDetail, SessionBlock } from '../hooks/useCalendarDayDetail'
import History from '../model/models/History'
import {
  computeCalendarData,
  computeCurrentStreak,
  computeRecordStreak,
  toDateKey,
  formatDuration,
} from '../model/utils/statsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Translations } from '../i18n'
import type { ThemeColors } from '../theme'

// ─── Constantes calendrier ────────────────────────────────────────────────────

const DAY_SIZE = 38
const DAY_GAP = 6

// ─── Génération de la grille mensuelle ────────────────────────────────────────

/**
 * Génère la grille du calendrier pour un mois donné.
 * Produit un tableau de semaines (lundi → dimanche), chaque jour contenant :
 * - Le nombre de séances ce jour-là (via calendarData)
 * - Si c'est le mois courant, un jour futur, etc.
 * Remplit les jours hors-mois en début/fin pour compléter les semaines.
 */
function generateMonthGrid(
  year: number,
  month: number,
  calendarData: Map<string, number>
): WeekRow[] {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  const dow = startDate.getDay()
  const toMonday = dow === 0 ? 6 : dow - 1
  startDate.setDate(startDate.getDate() - toMonday)

  const endDate = new Date(lastDay)
  const endDow = endDate.getDay()
  const toSunday = endDow === 0 ? 0 : 7 - endDow
  endDate.setDate(endDate.getDate() + toSunday)

  const weeks: WeekRow[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const days: DayCell[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(current)
      day.setDate(current.getDate() + d)
      const isCurrentMonth = day.getMonth() === month
      const isFuture = day > today
      const dateKey = toDateKey(day)
      const count = isFuture || !isCurrentMonth ? 0 : (calendarData.get(dateKey) ?? 0)
      days.push({
        dateKey,
        date: new Date(day),
        dayNumber: day.getDate(),
        count,
        isFuture,
        isCurrentMonth,
      })
    }
    weeks.push({ days })
    current.setDate(current.getDate() + 7)
  }

  return weeks
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatMonthTitle(year: number, month: number, locale: string): string {
  const date = new Date(year, month, 1)
  return capitalizeFirst(
    date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  )
}

// ─── Sous-composants inline ─────────────────────────────────────────────────

interface StreakBadgesProps {
  currentStreak: number
  recordStreak: number
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: Translations
}

function StreakBadges({ currentStreak, recordStreak, colors, styles, t }: StreakBadgesProps) {
  return (
    <View style={styles.streakRow}>
      <View style={styles.streakCard}>
        <Ionicons name="flame-outline" size={24} color={colors.danger} />
        <Text style={styles.streakValue}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>{t.statsCalendar.streakCurrent}</Text>
      </View>
      <View style={styles.streakCard}>
        <Ionicons name="trophy-outline" size={24} color={colors.warning} />
        <Text style={styles.streakValue}>{recordStreak}</Text>
        <Text style={styles.streakLabel}>{t.statsCalendar.streakRecord}</Text>
      </View>
    </View>
  )
}

interface MonthNavigatorProps {
  viewYear: number
  viewMonth: number
  locale: string
  isCurrentMonth: boolean
  onPrev: () => void
  onNext: () => void
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: Translations
}

function MonthNavigator({
  viewYear, viewMonth, locale, isCurrentMonth,
  onPrev, onNext, colors: _colors, styles, t,
}: MonthNavigatorProps) {
  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.arrowBtn}
        accessibilityLabel={t.statsCalendar.prevMonth}
      >
        <Text style={styles.arrowText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.monthTitle}>{formatMonthTitle(viewYear, viewMonth, locale)}</Text>
      <TouchableOpacity
        onPress={onNext}
        style={[styles.arrowBtn, isCurrentMonth && styles.arrowDisabled]}
        disabled={isCurrentMonth}
        accessibilityLabel={t.statsCalendar.nextMonth}
      >
        <Text style={[styles.arrowText, isCurrentMonth && styles.arrowTextDisabled]}>→</Text>
      </TouchableOpacity>
    </View>
  )
}

interface MonthStatsRowProps {
  monthStats: { sessionCount: number; totalMin: number }
  monthDurationLabel: string | null
  isCurrentMonth: boolean
  onToday: () => void
  styles: ReturnType<typeof useStyles>
  t: Translations
}

function MonthStatsRow({ monthStats, monthDurationLabel, isCurrentMonth, onToday, styles, t }: MonthStatsRowProps) {
  return (
    <>
      <Text style={styles.monthStats}>
        {monthStats.sessionCount}{' '}
        {monthStats.sessionCount !== 1 ? t.statsCalendar.sessionCountPlural : t.statsCalendar.sessionCount}
        {monthDurationLabel ? `   ·   ${monthDurationLabel} ${t.statsCalendar.totalDuration}` : ''}
      </Text>
      {!isCurrentMonth && (
        <TouchableOpacity onPress={onToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>{t.statsCalendar.today}</Text>
        </TouchableOpacity>
      )}
    </>
  )
}

interface CalendarGridProps {
  weeks: WeekRow[]
  todayKey: string
  detail: DayDetail | null
  panHandlers: ReturnType<typeof import('react-native').PanResponder.create>['panHandlers']
  onDayPress: (day: DayCell) => void
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: Translations
}

function CalendarGrid({ weeks, todayKey, detail, panHandlers, onDayPress, colors, styles, t }: CalendarGridProps) {
  return (
    <View {...panHandlers} style={styles.calendarContainer}>
      <View style={styles.dayLabelsRow}>
        {(t.statsCalendar.dayLabels as unknown as string[]).map((label: string, i: number) => (
          <Text key={i} style={styles.dayLabel}>{label}</Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.days.map((day, di) => {
            if (!day.isCurrentMonth) {
              return <View key={di} style={styles.daySpacer} />
            }

            const isToday = day.dateKey === todayKey
            const isActive = !day.isFuture && day.count > 0
            const isSelected = detail?.dateKey === day.dateKey

            let bgColor = 'transparent'
            let textColor: string = colors.border

            if (day.isFuture) {
              bgColor = 'transparent'
              textColor = colors.border
            } else if (isToday) {
              bgColor = colors.primary
              textColor = colors.text
            } else if (isActive) {
              bgColor = colors.primaryBg
              textColor = colors.primary
            } else {
              bgColor = colors.intensityColors[0]
              textColor = colors.textSecondary
            }

            const borderStyle = isSelected
              ? { borderWidth: 2, borderColor: colors.text }
              : {}

            return (
              <TouchableOpacity
                key={di}
                testID={`day-cell-${day.dateKey}`}
                onPress={() => onDayPress(day)}
                activeOpacity={day.isFuture ? 1 : 0.7}
              >
                <View style={[styles.dayBox, { backgroundColor: bgColor }, borderStyle]}>
                  <Text style={[styles.dayNumber, { color: textColor }]}>{day.dayNumber}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

interface CalendarLegendProps {
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: Translations
}

function CalendarLegend({ colors, styles, t }: CalendarLegendProps) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendBox, { backgroundColor: colors.intensityColors[0] }]} />
      <Text style={styles.legendText}>{t.statsCalendar.rest}</Text>
      <View
        style={[
          styles.legendBox,
          { backgroundColor: colors.primaryBg, borderWidth: 1, borderColor: colors.primary },
        ]}
      />
      <Text style={styles.legendText}>{t.statsCalendar.active}</Text>
    </View>
  )
}

interface SessionDetailCardProps {
  detail: DayDetail
  expandedBlocks: Set<string>
  onToggle: (historyId: string) => void
  onDelete: (historyId: string) => void
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: Translations
}

function SessionDetailCard({ detail, expandedBlocks, onToggle, onDelete, colors, styles, t }: SessionDetailCardProps) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailDate}>{detail.label}</Text>

      {detail.count === 0 ? (
        <Text style={styles.detailRest}>{t.statsCalendar.rest}</Text>
      ) : (
        detail.sessions.map((block: SessionBlock, blockIndex: number) => {
          const isExpanded = expandedBlocks.has(block.historyId)
          return (
            <React.Fragment key={block.historyId}>
              {blockIndex > 0 && <View style={styles.sessionDivider} />}

              <View style={styles.sessionBlockHeader}>
                <TouchableOpacity
                  style={[styles.detailHeader, { flex: 1 }]}
                  onPress={() => onToggle(block.historyId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.detailProgramName} numberOfLines={1}>
                    {block.programName || block.sessionName || t.statsCalendar.sessionFallback}
                  </Text>
                  <View style={styles.detailHeaderRight}>
                    {block.durationMin != null && (
                      <Text style={styles.detailDuration}>
                        {formatDuration(block.durationMin)}
                      </Text>
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                      style={styles.detailChevron}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteSessionBtn}
                  onPress={() => onDelete(block.historyId)}
                  accessibilityLabel={t.statsCalendar.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {block.sessionName && block.sessionName !== block.programName && (
                <Text style={styles.detailSessionName}>{block.sessionName}</Text>
              )}

              {isExpanded && (
                <>
                  {block.exercises.map((ex, ei) => (
                    <View key={ei} style={styles.detailExercise}>
                      <Text style={styles.detailExerciseName}>{ex.exerciseName}</Text>
                      <View style={styles.detailSetsRow}>
                        {ex.sets.map((s, si) => (
                          <View key={si} style={[styles.detailSetChip, { flexDirection: 'row', alignItems: 'center', gap: spacing.xs }]}>
                            <Text
                              style={[styles.detailSetText, s.isPr && styles.detailSetPr]}
                            >
                              {s.weight > 0 ? `${s.weight} ${t.statsMeasurements.weightUnit}` : t.historyDetail.bodyweight} × {s.reps}
                            </Text>
                            {s.isPr && <Ionicons name="ribbon" size={12} color={colors.primary} />}
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </React.Fragment>
          )
        })
      )}
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  histories: History[]
}

export function StatsCalendarScreenBase({ histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const locale = language === 'fr' ? 'fr-FR' : 'en-US'
  const haptics = useHaptics()

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const {
    detail,
    expandedBlocks,
    handleDayPress,
    toggleBlock,
    clearDetail,
  } = useCalendarDayDetail(histories, locale)

  const {
    today,
    viewYear,
    viewMonth,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    panHandlers,
  } = useMonthNavigation(clearDetail)

  const calendarData = useMemo(() => computeCalendarData(histories), [histories])
  const currentStreak = useMemo(() => computeCurrentStreak(histories), [histories])
  const recordStreak = useMemo(() => computeRecordStreak(histories), [histories])
  const weeks = useMemo(
    () => generateMonthGrid(viewYear, viewMonth, calendarData),
    [viewYear, viewMonth, calendarData]
  )

  const monthStats = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    let sessionCount = 0
    let totalMin = 0
    histories.forEach(h => {
      if (h.deletedAt !== null) return
      const key = toDateKey(h.startTime)
      if (!key.startsWith(prefix)) return
      sessionCount++
      if (h.endTime) {
        totalMin += Math.round(
          (h.endTime.getTime() - h.startTime.getTime()) / 60000
        )
      }
    })
    return { sessionCount, totalMin }
  }, [histories, viewYear, viewMonth])

  const monthDurationLabel = useMemo(() => {
    const { totalMin } = monthStats
    if (totalMin === 0) return null
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }, [monthStats])

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return
    try {
      const target = histories.find(h => h.id === pendingDeleteId)
      if (target) {
        await database.write(async () => {
          await target.update(h => {
            h.deletedAt = new Date()
          })
        })
      }
    } catch (e) {
      if (__DEV__) console.error('[StatsCalendarScreen] handleConfirmDelete error', e)
    }
    setPendingDeleteId(null)
    clearDetail()
  }, [pendingDeleteId, histories, clearDetail])

  const handleDeletePress = useCallback((historyId: string) => {
    haptics.onDelete()
    setPendingDeleteId(historyId)
  }, [haptics])

  const todayKey = toDateKey(today)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StreakBadges
        currentStreak={currentStreak}
        recordStreak={recordStreak}
        colors={colors}
        styles={styles}
        t={t}
      />

      <MonthNavigator
        viewYear={viewYear}
        viewMonth={viewMonth}
        locale={locale}
        isCurrentMonth={isCurrentMonth}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        colors={colors}
        styles={styles}
        t={t}
      />

      <MonthStatsRow
        monthStats={monthStats}
        monthDurationLabel={monthDurationLabel}
        isCurrentMonth={isCurrentMonth}
        onToday={goToToday}
        styles={styles}
        t={t}
      />

      <CalendarGrid
        weeks={weeks}
        todayKey={todayKey}
        detail={detail}
        panHandlers={panHandlers}
        onDayPress={handleDayPress}
        colors={colors}
        styles={styles}
        t={t}
      />

      <CalendarLegend colors={colors} styles={styles} t={t} />

      <AlertDialog
        visible={pendingDeleteId !== null}
        title={t.statsCalendar.deleteTitle}
        message={t.statsCalendar.deleteMessage}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        confirmText={t.statsCalendar.deleteConfirm}
        cancelText={t.statsCalendar.deleteCancel}
      />

      {detail && (
        <SessionDetailCard
          detail={detail}
          expandedBlocks={expandedBlocks}
          onToggle={toggleBlock}
          onDelete={handleDeletePress}
          colors={colors}
          styles={styles}
          t={t}
        />
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
    streakRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    streakCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    streakValue: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.xs,
    },
    streakLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    arrowBtn: {
      padding: spacing.sm,
    },
    arrowDisabled: {
      opacity: 0.3,
    },
    arrowText: {
      fontSize: fontSize.xl,
      color: colors.text,
    },
    arrowTextDisabled: {
      color: colors.textSecondary,
    },
    monthTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
    },
    monthStats: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    todayBtn: {
      alignSelf: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: spacing.sm,
    },
    todayBtnText: {
      fontSize: fontSize.xs,
      color: colors.primary,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    detailDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'capitalize',
      marginBottom: spacing.xs,
    },
    detailRest: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    detailProgramName: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    detailHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailChevron: {
      marginLeft: spacing.xs,
    },
    detailDuration: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    detailSessionName: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    detailExercise: {
      marginTop: spacing.sm,
    },
    detailExerciseName: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    detailSetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    detailSetChip: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    detailSetText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    detailSetPr: {
      color: colors.warning,
    },
    sessionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    sessionBlockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deleteSessionBtn: {
      padding: spacing.sm,
    },
    calendarContainer: {
      marginBottom: spacing.md,
    },
    dayLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: DAY_GAP,
    },
    dayLabel: {
      width: DAY_SIZE,
      textAlign: 'center',
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: DAY_GAP,
    },
    daySpacer: {
      width: DAY_SIZE,
      height: DAY_SIZE,
    },
    dayBox: {
      width: DAY_SIZE,
      height: DAY_SIZE,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayNumber: {
      fontSize: fontSize.xs,
      fontWeight: '500',
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    legendBox: {
      width: spacing.md,
      height: spacing.md,
      borderRadius: borderRadius.xs,
    },
    legendText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  histories: database
    .get<History>('histories')
    .query(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )
    .observe(),
}))

const ObservableStatsCalendarContent = enhance(StatsCalendarScreenBase)

const StatsCalendarScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsCalendarContent />}
    </View>
  )
}

export default StatsCalendarScreen
