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
  ScrollView,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import ScreenLoading from '../components/ScreenLoading'
import { useMonthNavigation } from '../hooks/useMonthNavigation'
import { useCalendarDayDetail } from '../hooks/useCalendarDayDetail'
import type { DayCell, WeekRow } from '../hooks/useCalendarDayDetail'
import History from '../model/models/History'
import {
  computeCalendarData,
  computeCurrentStreak,
  computeRecordStreak,
  toDateKey,
} from '../model/utils/statsHelpers'
import { spacing } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

import { CalendarMonthSummary, CalendarGrid, CalendarDayDetail } from '../components/stats-calendar'

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

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  histories: History[]
}

export function StatsCalendarScreenBase({ histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { language } = useLanguage()
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
  const { t } = useLanguage()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <CalendarMonthSummary
        currentStreak={currentStreak}
        recordStreak={recordStreak}
        sessionCount={monthStats.sessionCount}
        monthDurationLabel={monthDurationLabel}
        isCurrentMonth={isCurrentMonth}
        onGoToToday={goToToday}
      />

      <CalendarGrid
        weeks={weeks}
        todayKey={todayKey}
        viewYear={viewYear}
        viewMonth={viewMonth}
        locale={locale}
        isCurrentMonth={isCurrentMonth}
        detail={detail}
        panHandlers={panHandlers}
        onDayPress={handleDayPress}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />

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
        <CalendarDayDetail
          detail={detail}
          expandedBlocks={expandedBlocks}
          onToggleBlock={toggleBlock}
          onDeletePress={handleDeletePress}
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
      {mounted ? <ObservableStatsCalendarContent /> : <ScreenLoading />}
    </View>
  )
}

export default StatsCalendarScreen
