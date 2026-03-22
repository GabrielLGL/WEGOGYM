import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { MuscleRecoveryEntry } from '../../model/utils/muscleRecoveryHelpers'
import { getRecoveryColor } from '../../model/utils/muscleRecoveryHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface BodyMuscleRecoveryCardProps {
  recoveryEntries: MuscleRecoveryEntry[]
}

function BodyMuscleRecoveryCardInner({ recoveryEntries }: BodyMuscleRecoveryCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useCardStyles(colors)

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.home.recovery.title}</Text>
      <View style={styles.grid}>
        {recoveryEntries.map(entry => {
          const dotColor = getRecoveryColor(entry.status, colors)
          return (
            <View key={entry.muscle} style={styles.item}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={styles.muscle} numberOfLines={1}>{entry.muscle}</Text>
              <Text style={[styles.percent, { color: dotColor }]}>{entry.recoveryPercent}%</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export const BodyMuscleRecoveryCard = React.memo(BodyMuscleRecoveryCardInner)

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    title: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    item: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: borderRadius.xs,
    },
    muscle: {
      flex: 1,
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    percent: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },
  }), [colors])
}
