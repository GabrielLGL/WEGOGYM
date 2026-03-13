import React, { type ComponentProps, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { BadgeDefinition } from '../model/utils/badgeConstants'

interface BadgeCardProps {
  badge: BadgeDefinition
  unlocked: boolean
  onPress?: () => void
  onLongPress?: () => void
}

export function BadgeCard({ badge, unlocked, onPress, onLongPress }: BadgeCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)

  const badgeI18n = t.badges.list[badge.id as keyof typeof t.badges.list]

  return (
    <Pressable
      style={[styles.card, !unlocked && styles.locked]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
    >
      <Ionicons name={badge.icon as ComponentProps<typeof Ionicons>['name']} size={fontSize.xxxl} color={colors.primary} style={{ marginBottom: spacing.xs }} />
      <Text
        style={[styles.title, !unlocked && styles.titleLocked]}
        numberOfLines={2}
      >
        {badgeI18n?.title ?? badge.id}
      </Text>
    </Pressable>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
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
  }), [colors])
}
