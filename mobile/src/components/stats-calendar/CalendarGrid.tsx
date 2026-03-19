import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, type GestureResponderHandlers } from 'react-native'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { DayCell, WeekRow, DayDetail } from '../../hooks/useCalendarDayDetail'

const DAY_SIZE = 38
const DAY_GAP = 6

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

interface CalendarGridProps {
  weeks: WeekRow[]
  todayKey: string
  viewYear: number
  viewMonth: number
  locale: string
  isCurrentMonth: boolean
  detail: DayDetail | null
  panHandlers: GestureResponderHandlers
  onDayPress: (day: DayCell) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

function CalendarGridInner({
  weeks,
  todayKey,
  viewYear,
  viewMonth,
  locale,
  isCurrentMonth,
  detail,
  panHandlers,
  onDayPress,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  return (
    <>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={onPrevMonth}
          style={styles.arrowBtn}
          accessibilityLabel={t.statsCalendar.prevMonth}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonthTitle(viewYear, viewMonth, locale)}</Text>
        <TouchableOpacity
          onPress={onNextMonth}
          style={[styles.arrowBtn, isCurrentMonth && styles.arrowDisabled]}
          disabled={isCurrentMonth}
          accessibilityLabel={t.statsCalendar.nextMonth}
        >
          <Text style={[styles.arrowText, isCurrentMonth && styles.arrowTextDisabled]}>→</Text>
        </TouchableOpacity>
      </View>

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
    </>
  )
}

export const CalendarGrid = React.memo(CalendarGridInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
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
