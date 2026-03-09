import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

interface LevelBadgeProps {
  level: number
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  return (
    <View style={styles.container}>
      <Ionicons name="star" size={fontSize.lg} color={colors.primary} testID="level-star" />
      <Text style={styles.text}>{t.levelBadge.label} {level}</Text>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    text: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
  }), [colors])
}
