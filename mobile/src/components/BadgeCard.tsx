import React, { type ComponentProps } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import type { BadgeDefinition } from '../model/utils/badgeConstants'

interface BadgeCardProps {
  badge: BadgeDefinition
  unlocked: boolean
  unlockedAt?: Date
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  const colors = useColors()
  const styles = useStyles(colors)

  return (
    <View style={[styles.card, !unlocked && styles.locked]}>
      <Ionicons name={badge.icon as ComponentProps<typeof Ionicons>['name']} size={fontSize.xxxl} color={colors.primary} style={{ marginBottom: spacing.xs }} />
      <Text
        style={[styles.title, !unlocked && styles.titleLocked]}
        numberOfLines={2}
      >
        {badge.title}
      </Text>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minHeight: 90,
    },
    locked: {
      opacity: 0.35,
    },
    title: {
      fontSize: fontSize.xs,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    titleLocked: {
      color: colors.textSecondary,
    },
  })
}
