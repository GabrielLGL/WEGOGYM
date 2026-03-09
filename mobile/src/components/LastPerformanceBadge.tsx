import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { formatRelativeDate } from '../model/utils/databaseHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import type { LastPerformance } from '../types/workout'

interface LastPerformanceBadgeProps {
  lastPerformance: LastPerformance | null
}

export const LastPerformanceBadge: React.FC<LastPerformanceBadgeProps> = ({
  lastPerformance,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)

  if (!lastPerformance) {
    return (
      <View style={styles.chip}>
        <Text style={styles.firstTime}>Première fois</Text>
      </View>
    )
  }

  const { setsCount, avgReps, maxWeight, date } = lastPerformance
  return (
    <View style={styles.chip}>
      <Text style={styles.values}>
        ↑ {setsCount}×{avgReps} @ {maxWeight} kg
      </Text>
      <Text style={styles.separator}>  •  </Text>
      <Text style={styles.date}>{formatRelativeDate(date)}</Text>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      alignSelf: 'flex-start',
      marginBottom: spacing.sm,
    },
    firstTime: {
      color: colors.warning,
      fontSize: fontSize.xs,
      fontStyle: 'italic',
    },
    values: {
      color: colors.text,
      fontSize: fontSize.xs,
    },
    separator: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    date: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
  }), [colors])
}
