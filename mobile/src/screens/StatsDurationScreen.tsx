import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  TouchableOpacity,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons'

import { database } from '../model'
import History from '../model/models/History'
import { computeDurationStats, formatDuration } from '../model/utils/statsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'
import { useHaptics } from '../hooks/useHaptics'
import { useLanguage } from '../contexts/LanguageContext'

const PAGE_SIZE = 5

function KpiCard({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  const styles = useStyles(colors)
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  )
}

interface Props {
  histories: History[]
}

interface SelectedPoint {
  index: number
  x: number
  y: number
}

interface SessionExDetail {
  name: string
  setsCount: number
  reps: number | null
  repsList: number[]
}

export function StatsDurationScreenBase({ histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const chartConfig = createChartConfig({ showDots: true, colors })
  const { t, language } = useLanguage()
  const dateLocale = language === 'fr' ? 'fr-FR' : 'en-US'
  const { width: screenWidth } = useWindowDimensions()
  const stats = useMemo(() => computeDurationStats(histories), [histories])
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null)
  const [page, setPage] = useState(0)
  const haptics = useHaptics()

  // Session names (fetched for current page)
  const [sessionNames, setSessionNames] = useState<Record<string, string>>({})

  // Accordion state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, SessionExDetail[]>>({})

  const chartData = useMemo(() => {
    if (stats.perSession.length < 2) return null
    return {
      labels: stats.perSession.map((s, i) =>
        i % 5 === 0
          ? new Date(s.date).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' })
          : ''
      ),
      datasets: [{ data: stats.perSession.map(s => s.durationMin) }],
    }
  }, [stats.perSession, dateLocale])

  const handleDataPointClick = useCallback(
    (point: { index: number; value: number; x: number; y: number }) => {
      setSelectedPoint(prev =>
        prev?.index === point.index ? null : { index: point.index, x: point.x, y: point.y }
      )
    },
    []
  )

  const tooltipData = useMemo(() => {
    if (!selectedPoint || !stats.perSession[selectedPoint.index]) return null
    const session = stats.perSession[selectedPoint.index]
    const dateStr = new Date(session.date).toLocaleDateString(dateLocale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return {
      date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
      duration: `${Math.round(session.durationMin)} min`,
    }
  }, [selectedPoint, stats.perSession, dateLocale])

  const totalPages = Math.max(1, Math.ceil(stats.historyAll.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageEntries = stats.historyAll.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const hasPrev = safePage < totalPages - 1
  const hasNext = safePage > 0

  // Fetch session names for current page
  const pageKey = pageEntries.map(e => e.id).join(',')
  useEffect(() => {
    let cancelled = false
    const fetchNames = async () => {
      const names: Record<string, string> = {}
      for (const entry of pageEntries) {
        const h = histories.find(hh => hh.id === entry.id)
        if (!h) continue
        try {
          const session = await h.session.fetch()
          names[entry.id] = session?.name || t.statsDuration.sessionFallback
        } catch {
          names[entry.id] = t.statsDuration.sessionFallback
        }
      }
      if (!cancelled) setSessionNames(names)
    }
    fetchNames()
    return () => { cancelled = true }
  }, [pageKey, histories]) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle accordion + lazy load exercise details
  const toggleExpand = useCallback(async (historyId: string) => {
    if (expandedIds.has(historyId)) {
      setExpandedIds(prev => {
        const n = new Set(prev)
        n.delete(historyId)
        return n
      })
      return
    }
    setExpandedIds(prev => new Set([...prev, historyId]))
    if (exerciseDetails[historyId]) return // already loaded

    const h = histories.find(hh => hh.id === historyId)
    if (!h) return
    try {
      const sets = await h.sets.fetch()
      const exMap = new Map<string, { name: string; repsList: number[] }>()
      await Promise.all(
        sets.map(async s => {
          let exName = t.statsDuration.unknownExercise
          try {
            const ex = await s.exercise.fetch()
            if (ex?.name) exName = ex.name
          } catch {
            // exercice supprimé
          }
          if (!exMap.has(exName)) exMap.set(exName, { name: exName, repsList: [] })
          exMap.get(exName)!.repsList.push(s.reps)
        })
      )
      const details: SessionExDetail[] = []
      exMap.forEach(({ name, repsList }) => {
        const allSame = repsList.every(r => r === repsList[0])
        details.push({ name, setsCount: repsList.length, reps: allSame ? repsList[0] : null, repsList })
      })
      setExerciseDetails(prev => ({ ...prev, [historyId]: details }))
    } catch {
      // sets inaccessibles
    }
  }, [expandedIds, exerciseDetails, histories])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiGrid}>
        <KpiCard label={t.statsDuration.avgLabel} value={formatDuration(stats.avgMin)} colors={colors} />
        <KpiCard label={t.statsDuration.totalLabel} value={`${stats.totalHours}h`} colors={colors} />
        <KpiCard label={t.statsDuration.minLabel} value={formatDuration(stats.minMin)} colors={colors} />
        <KpiCard label={t.statsDuration.maxLabel} value={formatDuration(stats.maxMin)} colors={colors} />
      </View>

      <Text style={styles.sectionTitle}>
        {t.statsDuration.evolutionTitle} ({Math.min(stats.perSession.length, 30)} {t.statsDuration.lastSessions})
      </Text>

      {chartData ? (
        <Pressable onPress={() => setSelectedPoint(null)}>
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={screenWidth - spacing.md * 2}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              formatYLabel={val => `${val}m`}
              formatXLabel={val => val}
              onDataPointClick={handleDataPointClick}
            />
            {selectedPoint && tooltipData && (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: Math.min(
                      Math.max(selectedPoint.x - 80, spacing.sm),
                      screenWidth - spacing.md * 2 - 160 - spacing.sm
                    ),
                    top: Math.max(selectedPoint.y - 60, spacing.sm),
                  },
                ]}
              >
                <Text style={styles.tooltipDate}>{tooltipData.date}</Text>
                <Text style={styles.tooltipDuration}>{tooltipData.duration}</Text>
              </View>
            )}
          </View>
        </Pressable>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t.statsDuration.chartEmpty}
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
        {t.statsDuration.historyTitle} ({stats.historyAll.length} {t.statsDuration.sessions})
      </Text>
      <Text style={styles.durationMinInfo}>
        {t.statsDuration.durationMinInfo}
      </Text>

      {stats.historyAll.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.statsDuration.noSessions}</Text>
        </View>
      ) : (
        <View style={styles.historyCard}>
          {pageEntries.map((entry, index) => {
            const isExpanded = expandedIds.has(entry.id)
            const details = exerciseDetails[entry.id]
            return (
              <View key={entry.id}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.historyRowActions}
                  onPress={() => toggleExpand(entry.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.historyDate}>
                    {new Date(entry.date).toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.historySessionName} numberOfLines={1}>
                    {sessionNames[entry.id] ?? '…'}
                  </Text>
                  <Text style={styles.historyDuration}>{formatDuration(entry.durationMin)}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.accordionContent}>
                    {details ? (
                      details.length === 0 ? (
                        <Text style={styles.exerciseDetailText}>{t.statsDuration.noExercises}</Text>
                      ) : (
                        details.map((d, i) => (
                          <Text key={i} style={styles.exerciseDetailText}>
                            {d.name}
                            {' — '}
                            {d.setsCount}{' '}{d.setsCount !== 1 ? t.statsDuration.setsPlural : t.statsDuration.sets}
                            {d.reps !== null
                              ? ` × ${d.reps} reps`
                              : ` (${d.repsList.join(', ')} reps)`}
                          </Text>
                        ))
                      )
                    ) : (
                      <Text style={styles.exerciseDetailText}>{t.statsDuration.loading}</Text>
                    )}
                  </View>
                )}
              </View>
            )
          })}

          {totalPages > 1 && (
            <View style={styles.paginationBar}>
              <TouchableOpacity
                style={[styles.paginationButton, !hasPrev && styles.paginationButtonDisabled]}
                onPress={() => {
                  if (hasPrev) {
                    haptics.onPress()
                    setPage(safePage + 1)
                  }
                }}
                disabled={!hasPrev}
                accessibilityLabel={t.statsDuration.prevPageA11y}
              >
                <Text style={[styles.paginationButtonText, !hasPrev && styles.paginationButtonTextDisabled]}>
                  {t.statsDuration.prevPage}
                </Text>
              </TouchableOpacity>

              <Text style={styles.paginationLabel}>
                Page {safePage + 1} / {totalPages}
              </Text>

              <TouchableOpacity
                style={[styles.paginationButton, !hasNext && styles.paginationButtonDisabled]}
                onPress={() => {
                  if (hasNext) {
                    haptics.onPress()
                    setPage(safePage - 1)
                  }
                }}
                disabled={!hasNext}
                accessibilityLabel={t.statsDuration.nextPageA11y}
              >
                <Text style={[styles.paginationButtonText, !hasNext && styles.paginationButtonTextDisabled]}>
                  {t.statsDuration.nextPage}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  )
}

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
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    kpiCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      width: '48%',
    },
    kpiValue: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.primary,
    },
    kpiLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    chartWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    chart: {
      borderRadius: borderRadius.md,
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tooltip: {
      position: 'absolute',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minWidth: 160,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    tooltipDate: {
      fontSize: fontSize.xs,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    tooltipDuration: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.primary,
    },
    historySectionTitle: {
      marginTop: spacing.lg,
    },
    durationMinInfo: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    historyRowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    historyDate: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    historySessionName: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    historyDuration: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
      marginRight: spacing.sm,
    },
    accordionContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    exerciseDetailText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      paddingVertical: 2,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
    },
    paginationBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.separator,
    },
    paginationButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    paginationButtonDisabled: {
      opacity: 0.3,
    },
    paginationButtonText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    paginationButtonTextDisabled: {
      color: colors.textSecondary,
    },
    paginationLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  })
}

const enhance = withObservables([], () => ({
  histories: database
    .get<History>('histories')
    .query(
      Q.where('deleted_at', null),
      Q.where('end_time', Q.notEq(null)),
    )
    .observe(),
}))

export default enhance(StatsDurationScreenBase)
