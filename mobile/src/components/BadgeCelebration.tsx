import React, { type ComponentProps } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import type { BadgeDefinition } from '../model/utils/badgeConstants'

interface BadgeCelebrationProps {
  visible: boolean
  badge: BadgeDefinition | null
  onClose: () => void
}

export function BadgeCelebration({ visible, badge, onClose }: BadgeCelebrationProps) {
  const colors = useColors()
  const styles = useStyles(colors)

  if (!badge) return null

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Ionicons name={badge.icon as ComponentProps<typeof Ionicons>['name']} size={fontSize.jumbo} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text style={styles.headline}>Nouveau badge !</Text>
        <Text style={styles.title}>{badge.title}</Text>
        <Text style={styles.description}>{badge.description}</Text>
        <Button variant="primary" size="md" onPress={onClose} enableHaptics={false}>
          Super !
        </Button>
      </View>
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    headline: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    description: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
  })
}
