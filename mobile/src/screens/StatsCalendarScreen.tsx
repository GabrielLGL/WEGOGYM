import React, { useMemo, useState, useRef, useCallback } from 'react'
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
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
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
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

// ─── Constantes calendrier ────────────────────────────────────────────────────

const DAY_SIZE = 38
const DAY_GAP = 6

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

interface SetDetail {
  setOrder: number
  weight: number
  reps: number
  isPr: boolean
}

interface ExerciseDetail {
  exerciseName: string
  sets: SetDetail[]
}

interface SessionBlock {
  historyId: string
  programName: string
  sessionName: string
  durationMin: number | null
  exercises: ExerciseDetail[]
}

interface DayDetail {
  dateKey: string
  label: string
  count: number
  sessions: SessionBlock[]
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

function formatMonthTitle(year: number, month: number, locale: string): string {
  const date = new Date(year, month, 1)
  return capitalizeFirst(
    date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
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

  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [detail, setDetail] = useState<DayDetail | null>(null)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const haptics = useHaptics()

  const toggleBlock = (historyId: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(historyId)) {
        next.delete(historyId)
      } else {
        next.add(historyId)
      }
      return next
    })
  }

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return
    const target = histories.find(h => h.id === pendingDeleteId)
    if (target) {
      await database.write(async () => {
        await target.update(h => {
          h.deletedAt = new Date()
        })
      })
    }
    setPendingDeleteId(null)
    setDetail(null)
  }, [pendingDeleteId, histories])

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
    setDetail(null)
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (isCurrentMonth) return
    setDetail(null)
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const goToToday = () => {
    setDetail(null)
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

    if (detail?.dateKey === day.dateKey) {
      setDetail(null)
      return
    }

    const label = day.date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    if (day.count === 0) {
      setExpandedBlocks(new Set())
      setDetail({
        dateKey: day.dateKey,
        label,
        count: 0,
        sessions: [],
      })
      return
    }

    const dayHistories = histories.filter(
      h => h.deletedAt === null && toDateKey(h.startTime) === day.dateKey
    )

    const sessionBlocks: SessionBlock[] = []

    for (const h of dayHistories) {
      let programName = ''
      let sessionName = ''

      // Session + Programme
      try {
        const session = await h.session.fetch()
        if (session) {
          if (session.name) sessionName = session.name
          try {
            const program = await session.program.fetch()
            if (program?.name) programName = program.name
          } catch {
            // programme supprimé
          }
        }
      } catch {
        // session supprimée
      }

      // Durée
      let durationMin: number | null = null
      if (h.endTime) {
        const mins = Math.round(
          (h.endTime.getTime() - h.startTime.getTime()) / 60000
        )
        if (mins > 0) durationMin = mins
      }

      // Sets → regrouper par exercice
      const exercises: ExerciseDetail[] = []
      try {
        const sets = await h.sets.fetch()
        const exerciseMap = new Map<string, ExerciseDetail>()

        await Promise.all(
          sets.map(async s => {
            let exName = 'Exercice inconnu'
            try {
              const ex = await s.exercise.fetch()
              if (ex?.name) exName = ex.name
            } catch {
              // exercice supprimé
            }

            if (!exerciseMap.has(exName)) {
              exerciseMap.set(exName, { exerciseName: exName, sets: [] })
            }
            exerciseMap.get(exName)!.sets.push({
              setOrder: s.setOrder,
              weight: s.weight,
              reps: s.reps,
              isPr: s.isPr,
            })
          })
        )

        exerciseMap.forEach(exDetail => {
          exDetail.sets.sort((a, b) => a.setOrder - b.setOrder)
          exercises.push(exDetail)
        })
      } catch {
        // sets inaccessibles
      }

      sessionBlocks.push({ historyId: h.id, programName, sessionName, durationMin, exercises })
    }

    setExpandedBlocks(new Set())
    setDetail({
      dateKey: day.dateKey,
      label,
      count: day.count,
      sessions: sessionBlocks,
    })
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
          <Text style={styles.streakLabel}>{t.statsCalendar.streakCurrent}</Text>
        </View>
        <View style={styles.streakCard}>
          <Ionicons name="trophy-outline" size={24} color={colors.warning} />
          <Text style={styles.streakValue}>{recordStreak}</Text>
          <Text style={styles.streakLabel}>{t.statsCalendar.streakRecord}</Text>
        </View>
      </View>

      {/* Sélecteur de mois */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={goToPrevMonth}
          style={styles.arrowBtn}
          accessibilityLabel={t.statsCalendar.prevMonth}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonthTitle(viewYear, viewMonth, locale)}</Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={[styles.arrowBtn, isCurrentMonth && styles.arrowDisabled]}
          disabled={isCurrentMonth}
          accessibilityLabel={t.statsCalendar.nextMonth}
        >
          <Text style={[styles.arrowText, isCurrentMonth && styles.arrowTextDisabled]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats du mois */}
      <Text style={styles.monthStats}>
        {monthStats.sessionCount}{' '}
        {monthStats.sessionCount !== 1 ? t.statsCalendar.sessionCountPlural : t.statsCalendar.sessionCount}
        {monthDurationLabel ? `   ·   ${monthDurationLabel} ${t.statsCalendar.totalDuration}` : ''}
      </Text>

      {/* Bouton "Aujourd'hui" */}
      {!isCurrentMonth && (
        <TouchableOpacity onPress={goToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>{t.statsCalendar.today}</Text>
        </TouchableOpacity>
      )}

      {/* Grille calendrier */}
      <View {...panResponder.panHandlers} style={styles.calendarContainer}>
        {/* Header jours */}
        <View style={styles.dayLabelsRow}>
          {t.statsCalendar.dayLabels.map((label, i) => (
            <Text key={i} style={styles.dayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Semaines */}
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.days.map((day, di) => {
              // Jours hors mois : spacer transparent, non interactif
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
                bgColor = intensityColors[0]
                textColor = colors.textSecondary
              }

              const borderStyle = isSelected
                ? { borderWidth: 2, borderColor: colors.text }
                : {}

              return (
                <TouchableOpacity
                  key={di}
                  testID={`day-cell-${day.dateKey}`}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={day.isFuture ? 1 : 0.7}
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
        <Text style={styles.legendText}>{t.statsCalendar.rest}</Text>
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
        <Text style={styles.legendText}>{t.statsCalendar.active}</Text>
      </View>

      <AlertDialog
        visible={pendingDeleteId !== null}
        title={t.statsCalendar.deleteTitle}
        message={t.statsCalendar.deleteMessage}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        confirmText={t.statsCalendar.deleteConfirm}
        cancelText={t.statsCalendar.deleteCancel}
      />

      {/* Carte de détail */}
      {detail && (
        <View style={styles.detailCard}>
          <Text style={styles.detailDate}>{detail.label}</Text>

          {detail.count === 0 ? (
            <Text style={styles.detailRest}>{t.statsCalendar.rest}</Text>
          ) : (
            detail.sessions.map((block, blockIndex) => {
              const isExpanded = expandedBlocks.has(block.historyId)
              return (
                <React.Fragment key={block.historyId}>
                  {blockIndex > 0 && <View style={styles.sessionDivider} />}

                  <View style={styles.sessionBlockHeader}>
                    <TouchableOpacity
                      style={[styles.detailHeader, { flex: 1 }]}
                      onPress={() => toggleBlock(block.historyId)}
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
                      onPress={() => { haptics.onDelete(); setPendingDeleteId(block.historyId) }}
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
                              <View key={si} style={styles.detailSetChip}>
                                <Text
                                  style={[
                                    styles.detailSetText,
                                    s.isPr && styles.detailSetPr,
                                  ]}
                                >
                                  {s.weight > 0 ? `${s.weight} kg` : 'PC'} × {s.reps}
                                  {s.isPr ? ' 🏅' : ''}
                                </Text>
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
      )}
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
      marginBottom: 4,
    },
    detailSetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    detailSetChip: {
      backgroundColor: colors.cardSecondary,
      borderRadius: 6,
      paddingHorizontal: 8,
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
