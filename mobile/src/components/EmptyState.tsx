import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import { fontSize, spacing } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
  }), [colors])
}
