import React, { useMemo, useState, useCallback } from 'react'
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
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'

const chartConfig = createChartConfig({ showDots: true })
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

export function StatsDurationScreenBase({ histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { width: screenWidth } = useWindowDimensions()
  const stats = useMemo(() => computeDurationStats(histories), [histories])
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null)
  const [page, setPage] = useState(0)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const haptics = useHaptics()

  const chartData = useMemo(() => {
    if (stats.perSession.length < 2) return null
    return {
      labels: stats.perSession.map((s, i) =>
        i % 5 === 0
          ? new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
          : ''
      ),
      datasets: [{ data: stats.perSession.map(s => s.durationMin) }],
    }
  }, [stats.perSession])

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
    const dateStr = new Date(session.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return {
      date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
      duration: `${Math.round(session.durationMin)} min`,
    }
  }, [selectedPoint, stats.perSession])

  const totalPages = Math.max(1, Math.ceil(stats.historyAll.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageEntries = stats.historyAll.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const hasPrev = safePage > 0
  const hasNext = safePage < totalPages - 1

  const handleDeletePress = useCallback(
    (id: string) => {
      haptics.onDelete()
      setPendingDeleteId(id)
    },
    [haptics]
  )

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
  }, [pendingDeleteId, histories])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiGrid}>
        <KpiCard label="Durée moyenne" value={formatDuration(stats.avgMin)} colors={colors} />
        <KpiCard label="Total cumulé" value={`${stats.totalHours}h`} colors={colors} />
        <KpiCard label="Plus courte" value={formatDuration(stats.minMin)} colors={colors} />
        <KpiCard label="Plus longue" value={formatDuration(stats.maxMin)} colors={colors} />
      </View>

      <Text style={styles.sectionTitle}>
        Évolution ({Math.min(stats.perSession.length, 30)} dernières séances)
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
            Enregistrez au moins 2 séances chronométrées pour voir l'évolution.
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
        Historique ({stats.historyAll.length} séances)
      </Text>

      {stats.historyAll.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune séance valide enregistrée.</Text>
        </View>
      ) : (
        <View style={styles.historyCard}>
          {pageEntries.map((entry, index) => (
            <View key={entry.id}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.historyRowActions}>
                <Text style={styles.historyDate}>
                  {new Date(entry.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.historyDuration}>{formatDuration(entry.durationMin)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePress(entry.id)}
                  accessibilityLabel="Supprimer cette séance"
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {totalPages > 1 && (
            <View style={styles.paginationBar}>
              <TouchableOpacity
                style={[styles.paginationButton, !hasPrev && styles.paginationButtonDisabled]}
                onPress={() => {
                  if (hasPrev) {
                    haptics.onPress()
                    setPage(safePage - 1)
                  }
                }}
                disabled={!hasPrev}
                accessibilityLabel="Page précédente"
              >
                <Text style={[styles.paginationButtonText, !hasPrev && styles.paginationButtonTextDisabled]}>
                  ← Précédente
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
                    setPage(safePage + 1)
                  }
                }}
                disabled={!hasNext}
                accessibilityLabel="Page suivante"
              >
                <Text style={[styles.paginationButtonText, !hasNext && styles.paginationButtonTextDisabled]}>
                  Suivante →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <AlertDialog
        visible={pendingDeleteId !== null}
        title="Supprimer cette séance ?"
        message="Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
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
      fontSize: fontSize.sm,
      color: colors.text,
      flex: 1,
    },
    historyDuration: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
      marginRight: spacing.sm,
    },
    deleteButton: {
      padding: spacing.sm,
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
    .query(Q.where('deleted_at', null))
    .observe(),
}))

export default enhance(StatsDurationScreenBase)
