import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

interface StreakIndicatorProps {
  currentStreak: number
  streakTarget: number
}

export function StreakIndicator({ currentStreak, streakTarget }: StreakIndicatorProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  if (currentStreak <= 0) {
    return <Text style={styles.inactive}>{t.streak.noStreak}</Text>
  }

  const weekLabel = currentStreak > 1 ? t.streak.weeksPlural : t.streak.weeks

  return (
    <Text style={styles.active}>
      {'\uD83D\uDD25'} {currentStreak} {weekLabel} ({t.streak.target} {streakTarget}{t.streak.per})
    </Text>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    active: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
    inactive: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
  })
}
