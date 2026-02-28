import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
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
      <Text style={styles.star}>{'\u2B50'}</Text>
      <Text style={styles.text}>{t.levelBadge.label} {level}</Text>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
}
