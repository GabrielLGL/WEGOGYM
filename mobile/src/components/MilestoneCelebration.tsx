import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { colors, spacing, fontSize } from '../theme'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'

interface MilestoneCelebrationProps {
  visible: boolean
  milestone: MilestoneEvent | null
  onClose: () => void
}

export function MilestoneCelebration({ visible, milestone, onClose }: MilestoneCelebrationProps) {
  if (!milestone) return null

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{milestone.emoji}</Text>
        <Text style={styles.title}>{milestone.title}</Text>
        <Text style={styles.message}>{milestone.message}</Text>
        <Button variant="primary" size="md" onPress={onClose} enableHaptics={false}>
          OK
        </Button>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
})
