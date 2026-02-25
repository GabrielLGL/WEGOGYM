import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface XPProgressBarProps {
  currentXP: number
  requiredXP: number
  percentage: number
}

export function XPProgressBar({ currentXP, requiredXP, percentage }: XPProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%` }]} />
      </View>
      <Text style={styles.label}>
        {currentXP} / {requiredXP} XP ({percentage}%)
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
})
