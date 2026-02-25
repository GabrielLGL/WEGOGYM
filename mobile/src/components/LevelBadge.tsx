import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize } from '../theme'

interface LevelBadgeProps {
  level: number
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.star}>{'\u2B50'}</Text>
      <Text style={styles.text}>Niveau {level}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  star: {
    fontSize: fontSize.lg,
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
})
