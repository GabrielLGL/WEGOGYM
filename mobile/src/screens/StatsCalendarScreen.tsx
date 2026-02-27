import React, { useMemo, useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import History from '../model/models/History'
import {
  computeCalendarData,
  computeCurrentStreak,
  computeRecordStreak,
  toDateKey,
  formatDuration,
} from '../model/utils/statsHelpers'
import { spacing, borderRadius, fontSize, intensityColors } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

// ─── Constantes calendrier ────────────────────────────────────────────────────

const DAY_SIZE = 38
const DAY_GAP = 6
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayCell {
  dateKey: string
  date: Date
  dayNumber: number
  count: number
  isFuture: boolean
  isCurrentMonth: boolean
}

interface WeekRow {
  days: DayCell[]
}

interface SessionDetail {
  name: string
  durationMin: number | null
}

interface TooltipInfo {
  dateKey: string
  label: string
  count: number
  sessions: SessionDetail[]
}

// ─── Génération de la grille mensuelle ────────────────────────────────────────

function generateMonthGrid(
  year: number,
  month: number,
  calendarData: Map<string, number>
): WeekRow[] {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Reculer au lundi avant ou égal au 1er du mois
  const startDate = new Date(firstDay)
  const dow = startDate.getDay()
  const toMonday = dow === 0 ? 6 : dow - 1
  startDate.setDate(startDate.getDate() - toMonday)

  // Avancer au dimanche sur ou après le dernier jour du mois
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

function formatMonthTitle(year: number, month: number): string {
  const date = new Date(year, month, 1)
  return capitalizeFirst(
    date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  histories: History[]
}

export function StatsCalendarScreenBase({ histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)

  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const calendarData = useMemo(() => computeCalendarData(histories), [histories])
  const currentStreak = useMemo(() => computeCurrentStreak(histories), [histories])
  const recordStreak = useMemo(() => computeRecordStreak(histories), [histories])
  const weeks = useMemo(
    () => generateMonthGrid(viewYear, viewMonth, calendarData),
    [viewYear, viewMonth, calendarData]
  )

  // Stats du mois affiché
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

  const goToPrevMonth = () => {
    setTooltip(null)
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (isCurrentMonth) return
    setTooltip(null)
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const goToToday = () => {
    setTooltip(null)
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  // Utiliser des refs pour éviter les closures périmées dans PanResponder
  const navRef = useRef({ goToNextMonth, goToPrevMonth })
  navRef.current = { goToNextMonth, goToPrevMonth }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 15 && Math.abs(gs.dy) < 40,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50) {
          navRef.current.goToNextMonth()
        } else if (gs.dx > 50) {
          navRef.current.goToPrevMonth()
        }
      },
    })
  ).current

  const handleDayPress = async (day: DayCell) => {
    if (day.isFuture || !day.isCurrentMonth) return

    if (tooltip?.dateKey === day.dateKey) {
      setTooltip(null)
      return
    }

    const label = day.date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    if (day.count === 0) {
      setTooltip({ dateKey: day.dateKey, label, count: 0, sessions: [] })
      return
    }

    const dayHistories = histories.filter(
      h => h.deletedAt === null && toDateKey(h.startTime) === day.dateKey
    )

    const sessions: SessionDetail[] = await Promise.all(
      dayHistories.map(async h => {
        let name = 'Séance'
        try {
          const session = await h.session.fetch()
          if (session?.name) name = session.name
        } catch {
          // la séance a peut-être été supprimée
        }
        const durationMin = h.endTime
          ? Math.round(
              (h.endTime.getTime() - h.startTime.getTime()) / 60000
            )
          : null
        return { name, durationMin }
      })
    )

    setTooltip({ dateKey: day.dateKey, label, count: day.count, sessions })
  }

  const todayKey = toDateKey(today)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Streak badges */}
      <View style={styles.streakRow}>
        <View style={styles.streakCard}>
          <Ionicons name="flame-outline" size={24} color={colors.danger} />
          <Text style={styles.streakValue}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>jours actuels</Text>
        </View>
        <View style={styles.streakCard}>
          <Ionicons name="trophy-outline" size={24} color={colors.warning} />
          <Text style={styles.streakValue}>{recordStreak}</Text>
          <Text style={styles.streakLabel}>record</Text>
        </View>
      </View>

      {/* Sélecteur de mois */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={goToPrevMonth}
          style={styles.arrowBtn}
          accessibilityLabel="Mois précédent"
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonthTitle(viewYear, viewMonth)}</Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={[styles.arrowBtn, isCurrentMonth && styles.arrowDisabled]}
          disabled={isCurrentMonth}
          accessibilityLabel="Mois suivant"
        >
          <Text style={[styles.arrowText, isCurrentMonth && styles.arrowTextDisabled]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats du mois */}
      <Text style={styles.monthStats}>
        {monthStats.sessionCount}{' '}
        séance{monthStats.sessionCount !== 1 ? 's' : ''}
        {monthDurationLabel ? `   ·   ${monthDurationLabel} au total` : ''}
      </Text>

      {/* Bouton "Aujourd'hui" */}
      {!isCurrentMonth && (
        <TouchableOpacity onPress={goToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>Aujourd'hui</Text>
        </TouchableOpacity>
      )}

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>{tooltip.label}</Text>
          {tooltip.count === 0 ? (
            <Text style={styles.tooltipRest}>Repos</Text>
          ) : (
            tooltip.sessions.map((s, i) => (
              <View key={i} style={styles.tooltipSession}>
                <Text style={styles.tooltipSessionName} numberOfLines={1}>
                  {s.name}
                </Text>
                {s.durationMin != null && s.durationMin > 0 && (
                  <Text style={styles.tooltipSessionDuration}>
                    {formatDuration(s.durationMin)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* Grille calendrier */}
      <View {...panResponder.panHandlers} style={styles.calendarContainer}>
        {/* Header jours */}
        <View style={styles.dayLabelsRow}>
          {DAY_LABELS.map((label, i) => (
            <Text key={i} style={styles.dayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Semaines */}
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.days.map((day, di) => {
              const isToday = day.dateKey === todayKey
              const isActive =
                day.isCurrentMonth && !day.isFuture && day.count > 0
              const isSelected = tooltip?.dateKey === day.dateKey

              let bgColor = 'transparent'
              let textColor: string = colors.border

              if (!day.isCurrentMonth) {
                bgColor = intensityColors[0]
                textColor = colors.border
              } else if (day.isFuture) {
                bgColor = 'transparent'
                textColor = colors.border
              } else if (isActive) {
                bgColor = colors.primaryBg
                textColor = colors.primary
              } else {
                bgColor = intensityColors[0]
                textColor = colors.textSecondary
              }

              const borderStyle = isToday
                ? { borderWidth: 2, borderColor: colors.primary }
                : isSelected
                  ? { borderWidth: 1, borderColor: colors.primary }
                  : {}

              return (
                <TouchableOpacity
                  key={di}
                  testID={`day-cell-${day.dateKey}`}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={
                    day.isFuture || !day.isCurrentMonth ? 1 : 0.7
                  }
                >
                  <View
                    style={[
                      styles.dayBox,
                      { backgroundColor: bgColor },
                      borderStyle,
                    ]}
                  >
                    <Text style={[styles.dayNumber, { color: textColor }]}>
                      {day.dayNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </View>

      {/* Légende simplifiée */}
      <View style={styles.legend}>
        <View
          style={[styles.legendBox, { backgroundColor: intensityColors[0] }]}
        />
        <Text style={styles.legendText}>Repos</Text>
        <View
          style={[
            styles.legendBox,
            {
              backgroundColor: colors.primaryBg,
              borderWidth: 1,
              borderColor: colors.primary,
            },
          ]}
        />
        <Text style={styles.legendText}>Actif</Text>
      </View>
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
    tooltip: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    tooltipDate: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'capitalize',
      marginBottom: spacing.xs,
    },
    tooltipRest: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tooltipSession: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 2,
    },
    tooltipSessionName: {
      fontSize: fontSize.sm,
      color: colors.text,
      flex: 1,
    },
    tooltipSessionDuration: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
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
    dayBox: {
      width: DAY_SIZE,
      height: DAY_SIZE,
      borderRadius: 8,
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
      width: 16,
      height: 16,
      borderRadius: 4,
    },
    legendText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
  })
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  histories: database
    .get<History>('histories')
    .query(Q.where('deleted_at', null))
    .observe(),
}))

export default enhance(StatsCalendarScreenBase)
