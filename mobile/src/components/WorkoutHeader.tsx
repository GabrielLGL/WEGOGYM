import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { spacing, borderRadius, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

interface WorkoutHeaderProps {
  formattedTime: string
  totalVolume: number
  completedSets: number
  totalSetsTarget: number
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  formattedTime,
  totalVolume,
  completedSets,
  totalSetsTarget,
}) => {
  const { colors, neuShadow } = useTheme()
  const styles = useStyles(colors)
  const progressPercent = totalSetsTarget > 0 ? (completedSets / totalSetsTarget) * 100 : 0

  return (
    <View style={[styles.container, neuShadow.elevated]}>
      <View style={styles.row}>
        <Text style={styles.timer}>{formattedTime}</Text>
        <View style={styles.volumeBlock}>
          <Text style={styles.volumeValue}>{totalVolume.toFixed(1)}</Text>
          <Text style={styles.volumeUnit}>kg</Text>
        </View>
      </View>

      <Text style={[styles.setsCounter, { color: completedSets > 0 ? colors.success : colors.textSecondary }]}>
        {completedSets} / {totalSetsTarget} séries
      </Text>

      {totalSetsTarget > 0 && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      )}
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timer: {
      color: colors.text,
      fontSize: fontSize.xxxl,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    volumeBlock: {
      alignItems: 'flex-end',
    },
    volumeValue: {
      color: colors.primary,
      fontSize: fontSize.xl,
      fontWeight: '700',
    },
    volumeUnit: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    setsCounter: {
      textAlign: 'center',
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
    },
    progressTrack: {
      backgroundColor: colors.cardSecondary,
      height: 3,
      borderRadius: borderRadius.xxs,
      marginTop: spacing.xs,
      overflow: 'hidden',
    },
    progressFill: {
      backgroundColor: colors.success,
      height: 3,
    },
  })
}

export { WorkoutHeader }
