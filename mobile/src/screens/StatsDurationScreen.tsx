import React, { useMemo, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'

import { database } from '../model'
import History from '../model/models/History'
import { computeDurationStats, formatDuration } from '../model/utils/statsHelpers'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import { createChartConfig } from '../theme/chartConfig'

const chartConfig = createChartConfig({ showDots: true })

function KpiCard({ label, value }: { label: string; value: string }) {
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

function StatsDurationScreenBase({ histories }: Props) {
  const { width: screenWidth } = useWindowDimensions()
  const stats = useMemo(() => computeDurationStats(histories), [histories])
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null)

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiGrid}>
        <KpiCard label="Durée moyenne" value={formatDuration(stats.avgMin)} />
        <KpiCard label="Total cumulé" value={`${stats.totalHours}h`} />
        <KpiCard label="Plus courte" value={formatDuration(stats.minMin)} />
        <KpiCard label="Plus longue" value={formatDuration(stats.maxMin)} />
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
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
})

const enhance = withObservables([], () => ({
  histories: database
    .get<History>('histories')
    .query(Q.where('deleted_at', null))
    .observe(),
}))

export default enhance(StatsDurationScreenBase)
