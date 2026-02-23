import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
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
import { colors, spacing, borderRadius, fontSize, intensityColors } from '../theme'

// ─── Constantes calendrier ────────────────────────────────────────────────────

const DAY_SIZE = 20
const DAY_GAP = 3
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function getIntensityColor(count: number): string {
  if (count <= 0) return intensityColors[0]
  if (count === 1) return intensityColors[1]
  if (count === 2) return intensityColors[2]
  return intensityColors[3]
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayData {
  dateKey: string
  date: Date
  count: number
  isFuture: boolean
}

interface WeekData {
  days: DayData[]
  monthLabel: string
}

// ─── Génération des semaines ──────────────────────────────────────────────────

function generateCalendarWeeks(calendarData: Map<string, number>): WeekData[] {
  const today = new Date()
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Reculer au lundi de cette semaine
  const startDate = new Date(sixMonthsAgo)
  const dow = startDate.getDay()
  const toMonday = dow === 0 ? 6 : dow - 1
  startDate.setDate(startDate.getDate() - toMonday)

  const weeks: WeekData[] = []
  const current = new Date(startDate)
  let prevMonth = -1

  while (current <= today) {
    const monday = new Date(current)
    const currentMonth = monday.getMonth()
    const monthLabel =
      currentMonth !== prevMonth
        ? monday.toLocaleDateString('fr-FR', { month: 'short' })
        : ''
    prevMonth = currentMonth

    const days: DayData[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(current)
      day.setDate(current.getDate() + d)
      const isFuture = day > today
      const dateKey = toDateKey(day)
      days.push({
        dateKey,
        date: day,
        count: isFuture ? 0 : (calendarData.get(dateKey) ?? 0),
        isFuture,
      })
    }

    weeks.push({ days, monthLabel })
    current.setDate(current.getDate() + 7)
  }

  return weeks
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  histories: History[]
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

export function StatsCalendarScreenBase({ histories }: Props) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  const calendarData = useMemo(() => computeCalendarData(histories), [histories])
  const currentStreak = useMemo(() => computeCurrentStreak(histories), [histories])
  const recordStreak = useMemo(() => computeRecordStreak(histories), [histories])
  const weeks = useMemo(() => generateCalendarWeeks(calendarData), [calendarData])

  const handleDayPress = async (day: DayData) => {
    if (day.isFuture) return

    // Toggle off if same day
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

    // Filter histories for this day
    const dayHistories = histories.filter(
      h => h.deletedAt === null && toDateKey(h.startTime) === day.dateKey
    )

    // Fetch session details
    const sessions: SessionDetail[] = await Promise.all(
      dayHistories.map(async (h) => {
        let name = 'Séance'
        try {
          const session = await h.session.fetch()
          if (session?.name) name = session.name
        } catch {
          // session may have been deleted
        }

        const durationMin = h.endTime
          ? Math.round((h.endTime.getTime() - h.startTime.getTime()) / 60000)
          : null

        return { name, durationMin }
      })
    )

    setTooltip({ dateKey: day.dateKey, label, count: day.count, sessions })
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Streak badges */}
      <View style={styles.streakRow}>
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakValue}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>jours actuels</Text>
        </View>
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>🏆</Text>
          <Text style={styles.streakValue}>{recordStreak}</Text>
          <Text style={styles.streakLabel}>record</Text>
        </View>
      </View>

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.calendarScroll}
      >
        <View style={styles.calendarContainer}>
          {/* Labels jours */}
          <View style={styles.dayLabelsColumn}>
            <View style={styles.monthLabelPlaceholder} />
            {DAY_LABELS.map((label, i) => (
              <Text key={i} style={styles.dayLabel}>{label}</Text>
            ))}
          </View>

          {/* Colonnes de semaines */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekColumn}>
              <Text style={styles.monthLabel} numberOfLines={1}>
                {week.monthLabel}
              </Text>
              {week.days.map((day, di) => (
                <TouchableOpacity
                  key={di}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={day.isFuture ? 1 : 0.7}
                >
                  <View
                    style={[
                      styles.dayBox,
                      {
                        backgroundColor: day.isFuture
                          ? 'transparent'
                          : getIntensityColor(day.count),
                        opacity: day.isFuture ? 0 : 1,
                        borderWidth: tooltip?.dateKey === day.dateKey ? 1 : 0,
                        borderColor: colors.primary,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Légende */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Repos</Text>
        {intensityColors.map((color, i) => (
          <View key={i} style={[styles.legendBox, { backgroundColor: color }]} />
        ))}
        <Text style={styles.legendText}>Actif</Text>
      </View>
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
  streakIcon: {
    fontSize: 24,
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
  calendarScroll: {
    marginBottom: spacing.md,
  },
  calendarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelsColumn: {
    marginRight: DAY_GAP,
    alignItems: 'center',
  },
  monthLabelPlaceholder: {
    height: fontSize.xs + spacing.xs,
    marginBottom: DAY_GAP,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    height: DAY_SIZE,
    marginBottom: DAY_GAP,
    lineHeight: DAY_SIZE,
    width: 14,
    textAlign: 'center',
  },
  weekColumn: {
    marginRight: DAY_GAP,
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: DAY_GAP,
    height: fontSize.xs + spacing.xs,
    textAlign: 'center',
  },
  dayBox: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: 3,
    marginBottom: DAY_GAP,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  legendBox: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: 3,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
})

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  histories: database
    .get<History>('histories')
    .query(Q.where('deleted_at', null))
    .observe(),
}))

export default enhance(StatsCalendarScreenBase)
