import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Session from '../../model/models/Session'
import { buildWeeklyActivity } from '../../model/utils/statsHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

const DAY_CHIP_MIN_HEIGHT = 84

interface HomeWeeklyActivityCardProps {
  histories: History[]
  sets: WorkoutSet[]
  sessions: Session[]
  weeklyCardRef: React.RefObject<View>
}

export function HomeWeeklyActivityCard({ histories, sets, sessions, weeklyCardRef }: HomeWeeklyActivityCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)

  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(histories, sets, sessions, t.home.dayLabels, t.statsVolume.sessionFallback),
    [histories, sets, sessions, t.home.dayLabels, t.statsVolume.sessionFallback],
  )

  return (
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
        {weeklyActivity.map((day) => (
          <View
            key={day.dateKey}
            style={[
              styles.dayChip,
              day.isToday && styles.dayChipToday,
              !day.isToday && day.isPast && day.sessions.length === 0 && styles.dayChipRestPast,
            ]}
          >
            <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
              {day.dayLabel}
            </Text>
            <Text style={[styles.dayNumber, day.isToday && styles.dayNumberToday]}>
              {day.dayNumber}
            </Text>
            {day.sessions.length > 0 ? (
              day.sessions.map((s, idx) => (
                <View key={idx} style={styles.sessionTag}>
                  <Text style={styles.sessionName} numberOfLines={1}>{s.sessionName}</Text>
                  <Text style={styles.sessionMeta}>
                    {s.setCount} {t.home.series}{s.durationMin !== null ? ` · ${s.durationMin}m` : ''}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>{day.isPast ? t.home.rest : '—'}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
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
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
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
      marginBottom: spacing.xs,
    },
    dayNumberToday: {
      color: colors.primary,
    },
    sessionTag: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.xs,
      paddingHorizontal: 3,
      paddingVertical: 2,
      marginTop: 2,
      width: '100%',
    },
    sessionName: {
      fontSize: fontSize.tiny,
      fontWeight: '700',
      color: colors.text,
    },
    sessionMeta: {
      fontSize: fontSize.micro,
      color: colors.textSecondary,
      marginTop: 1,
    },
    emptyDay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyDayText: {
      fontSize: fontSize.mini,
      color: colors.placeholder,
    },
  }), [colors])
}
