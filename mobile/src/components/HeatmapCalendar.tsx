import React, { useRef, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, type LayoutChangeEvent } from 'react-native'
import type { HeatmapDay } from '../model/utils/statsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

const CELL_SIZE = 12
const CELL_GAP = 2
const COL_WIDTH = CELL_SIZE + CELL_GAP

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec',
]

interface HeatmapCalendarProps {
  data: HeatmapDay[]
}

interface WeekColumn {
  days: HeatmapDay[]
  index: number
}

function buildColumns(data: HeatmapDay[]): WeekColumn[] {
  const columns: WeekColumn[] = []
  let current: HeatmapDay[] = []

  for (const day of data) {
    current.push(day)
    if (day.dayOfWeek === 6) {
      columns.push({ days: current, index: columns.length })
      current = []
    }
  }
  if (current.length > 0) {
    columns.push({ days: current, index: columns.length })
  }

  return columns
}

function getMonthLabels(data: HeatmapDay[]): Array<{ label: string; colIndex: number }> {
  const labels: Array<{ label: string; colIndex: number }> = []
  let currentMonth = -1
  let colIndex = 0
  let dayInCol = 0

  for (const day of data) {
    const month = parseInt(day.date.substring(5, 7), 10) - 1
    if (month !== currentMonth) {
      currentMonth = month
      labels.push({ label: MONTH_LABELS[month], colIndex })
    }
    dayInCol++
    if (day.dayOfWeek === 6) {
      colIndex++
      dayInCol = 0
    }
  }

  return labels
}

const HeatmapCalendarInner: React.FC<HeatmapCalendarProps> = ({ data }) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const scrollRef = useRef<ScrollView>(null)

  const columns = useMemo(() => buildColumns(data), [data])
  const monthLabels = useMemo(() => getMonthLabels(data), [data])

  const handleLayout = useCallback((_e: LayoutChangeEvent) => {
    scrollRef.current?.scrollToEnd({ animated: false })
  }, [])

  const gridHeight = 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={handleLayout}
      >
        <View>
          {/* Month labels */}
          <View style={[styles.monthRow, { height: 14 }]}>
            {monthLabels.map((m, i) => (
              <Text
                key={`${m.label}-${i}`}
                style={[
                  styles.monthLabel,
                  { position: 'absolute', left: m.colIndex * COL_WIDTH },
                ]}
              >
                {m.label}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={[styles.grid, { height: gridHeight }]}>
            {columns.map(col => (
              <View key={col.index} style={styles.column}>
                {/* Pad incomplete first column */}
                {col.index === 0 && col.days.length < 7 && (
                  <View style={{ height: (7 - col.days.length) * (CELL_SIZE + CELL_GAP) }} />
                )}
                {col.days.map(day => (
                  <View
                    key={day.date}
                    style={[
                      styles.cell,
                      { backgroundColor: colors.intensityColors[Math.min(day.count, 3)] },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Moins</Text>
        {[0, 1, 2, 3].map(level => (
          <View
            key={level}
            style={[styles.legendCell, { backgroundColor: colors.intensityColors[level] }]}
          />
        ))}
        <Text style={styles.legendText}>Plus</Text>
      </View>
    </View>
  )
}

export const HeatmapCalendar = React.memo(HeatmapCalendarInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    monthRow: {
      flexDirection: 'row',
      position: 'relative',
      marginBottom: CELL_GAP,
    },
    monthLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
    },
    column: {
      marginRight: CELL_GAP,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: borderRadius.xxs,
      marginBottom: CELL_GAP,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: spacing.sm,
      gap: CELL_GAP + 1,
    },
    legendCell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: borderRadius.xxs,
    },
    legendText: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
  }), [colors])
}
