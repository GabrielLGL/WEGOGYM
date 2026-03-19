import React, { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Session from '../../model/models/Session'
import { buildWeeklyActivity } from '../../model/utils/statsHelpers'
import { BottomSheet } from '../BottomSheet'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

const DAY_CHIP_MIN_HEIGHT = 60

interface HomeWeeklyActivityCardProps {
  histories: History[]
  sets: WorkoutSet[]
  sessions: Session[]
  weeklyCardRef: React.RefObject<View>
}

interface DayDetail {
  dayLabel: string
  dayNumber: number
  sessions: Array<{ sessionName: string; setCount: number; durationMin: number | null; volumeKg: number }>
}

export function HomeWeeklyActivityCard({ histories, sets, sessions, weeklyCardRef }: HomeWeeklyActivityCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const styles = useStyles(colors)
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null)

  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(histories, sets, sessions, t.home.dayLabels, t.statsVolume.sessionFallback),
    [histories, sets, sessions, t.home.dayLabels, t.statsVolume.sessionFallback],
  )

  const handleDayPress = (day: typeof weeklyActivity[0]) => {
    if (day.sessions.length === 0) return
    haptics.onSelect()
    setSelectedDay({
      dayLabel: day.dayLabel,
      dayNumber: day.dayNumber,
      sessions: day.sessions,
    })
  }

  return (
    <>
      <View ref={weeklyCardRef} style={styles.weeklyCard}>
        <View style={styles.weeklyHeader}>
          <Text style={styles.sectionTitle}>{t.home.weeklyActivity}</Text>
          <Text style={styles.weeklySubtitle}>
            {(() => {
              const totalSessions = weeklyActivity.reduce((acc, d) => acc + d.sessions.length, 0)
              if (totalSessions === 0) return t.home.noSessions
              const totalVolume = weeklyActivity.reduce(
                (acc, d) => acc + d.sessions.reduce((a, s) => a + s.volumeKg, 0), 0
              )
              return `${totalSessions} ${totalSessions > 1 ? t.home.sessions : t.home.session} · ${Math.round(totalVolume)} ${t.statsMeasurements.weightUnit}`
            })()}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {weeklyActivity.map((day) => {
            const hasSessions = day.sessions.length > 0
            return (
              <TouchableOpacity
                key={day.dateKey}
                style={[
                  styles.dayChip,
                  day.isToday && styles.dayChipToday,
                  !day.isToday && day.isPast && !hasSessions && styles.dayChipRestPast,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={hasSessions ? 0.7 : 1}
                disabled={!hasSessions}
              >
                <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                  {day.dayLabel}
                </Text>
                <Text style={[styles.dayNumber, day.isToday && styles.dayNumberToday]}>
                  {day.dayNumber}
                </Text>
                <View style={[
                  styles.dayDot,
                  { backgroundColor: hasSessions ? colors.primary : 'transparent' },
                  day.sessions.length > 1 && { backgroundColor: colors.success },
                ]} />
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <BottomSheet
        visible={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `${selectedDay.dayLabel} ${selectedDay.dayNumber}` : ''}
      >
        {selectedDay && (
          <View style={styles.dayDetailContent}>
            {selectedDay.sessions.map((s, idx) => (
              <View key={idx} style={styles.dayDetailSession}>
                <Text style={styles.dayDetailName}>{s.sessionName}</Text>
                <Text style={styles.dayDetailMeta}>
                  {s.setCount} {t.home.series}
                  {s.durationMin !== null ? ` · ${s.durationMin}m` : ''}
                  {` · ${Math.round(s.volumeKg)} kg`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </BottomSheet>
    </>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    weeklyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    weeklyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    weeklySubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    dayChip: {
      flex: 1,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.xs,
      alignItems: 'center',
      minHeight: DAY_CHIP_MIN_HEIGHT,
      justifyContent: 'center',
      gap: 2,
    },
    dayChipToday: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    dayChipRestPast: {
      opacity: 0.45,
    },
    dayLabel: {
      fontSize: fontSize.mini,
      fontWeight: '600',
      color: colors.placeholder,
      letterSpacing: 0.3,
    },
    dayLabelToday: {
      color: colors.primary,
    },
    dayNumber: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
    },
    dayNumberToday: {
      color: colors.primary,
    },
    dayDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 2,
    },
    dayDetailContent: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    dayDetailSession: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.ms,
    },
    dayDetailName: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    dayDetailMeta: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
  }), [colors])
}
