import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'

interface MilestoneCelebrationProps {
  visible: boolean
  milestone: MilestoneEvent | null
  onClose: () => void
}

export function MilestoneCelebration({ visible, milestone, onClose }: MilestoneCelebrationProps) {
  const colors = useColors()
  const styles = useStyles(colors)

  if (!milestone) return null

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Ionicons name={milestone.icon as React.ComponentProps<typeof Ionicons>['name']} size={fontSize.jumbo} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text style={styles.title}>{milestone.title}</Text>
        <Text style={styles.message}>{milestone.message}</Text>
        <Button variant="primary" size="md" onPress={onClose} enableHaptics={false}>
          OK
        </Button>
      </View>
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: spacing.md,
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
}
