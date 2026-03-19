import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface CalendarMonthSummaryProps {
  currentStreak: number
  recordStreak: number
  sessionCount: number
  monthDurationLabel: string | null
  isCurrentMonth: boolean
  onGoToToday: () => void
}

function CalendarMonthSummaryInner({
  currentStreak,
  recordStreak,
  sessionCount,
  monthDurationLabel,
  isCurrentMonth,
  onGoToToday,
}: CalendarMonthSummaryProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  return (
    <>
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

      <Text style={styles.monthStats}>
        {sessionCount}{' '}
        {sessionCount !== 1 ? t.statsCalendar.sessionCountPlural : t.statsCalendar.sessionCount}
        {monthDurationLabel ? `   ·   ${monthDurationLabel} ${t.statsCalendar.totalDuration}` : ''}
      </Text>
      {!isCurrentMonth && (
        <TouchableOpacity onPress={onGoToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>{t.statsCalendar.today}</Text>
        </TouchableOpacity>
      )}
    </>
  )
}

export const CalendarMonthSummary = React.memo(CalendarMonthSummaryInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
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
  }), [colors])
}
