import React, { type ComponentProps, useMemo, useRef, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ViewShot from 'react-native-view-shot'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { ShareBottomSheet } from './ShareBottomSheet'
import ShareCard from './ShareCard'
import { generateBadgeShareText, shareText, shareImage } from '../services/shareService'
import { useModalState } from '../hooks/useModalState'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { BadgeDefinition } from '../model/utils/badgeConstants'

interface BadgeCelebrationProps {
  visible: boolean
  badge: BadgeDefinition | null
  onClose: () => void
}

export function BadgeCelebration({ visible, badge, onClose }: BadgeCelebrationProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const viewShotRef = useRef<ViewShot>(null)
  const shareSheet = useModalState()
  const haptics = useHaptics()

  const badgeI18n = badge ? t.badges.list[badge.id as keyof typeof t.badges.list] : null

  const handleSharePress = useCallback(() => {
    haptics.onPress()
    shareSheet.open()
  }, [haptics, shareSheet])

  const handleShareText = useCallback(async () => {
    shareSheet.close()
    if (!badge || !badgeI18n) return
    try {
      const text = generateBadgeShareText({
        title: badgeI18n.title,
        description: badgeI18n.description,
        icon: badge.icon,
        category: badge.category,
        unlockedAt: new Date(),
      }, t)
      await shareText(text)
    } catch (e) {
      if (__DEV__) console.warn('[BadgeCelebration] shareText error:', e)
    }
  }, [shareSheet, badge, badgeI18n, t])

  const handleShareImage = useCallback(async () => {
    shareSheet.close()
    try {
      await shareImage(viewShotRef)
    } catch (e) {
      if (__DEV__) console.warn('[BadgeCelebration] shareImage error:', e)
    }
  }, [shareSheet])

  if (!badge) return null

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Ionicons name={badge.icon as ComponentProps<typeof Ionicons>['name']} size={fontSize.jumbo} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text style={styles.headline}>{t.badges.newBadge}</Text>
        <Text style={styles.title}>{badgeI18n?.title ?? badge.id}</Text>
        <Text style={styles.description}>{badgeI18n?.description ?? badge.id}</Text>
        <View style={styles.buttonRow}>
          <Button variant="secondary" size="md" onPress={handleSharePress} enableHaptics={false}>
            {t.share.shareButton}
          </Button>
          <Button variant="primary" size="md" onPress={onClose} enableHaptics={false}>
            {t.badges.great}
          </Button>
        </View>
      </View>

      {/* Off-screen ViewShot for image capture */}
      <View style={{ position: 'absolute', left: -9999 }}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <ShareCard
            variant="badge"
            title={badgeI18n?.title ?? badge.id}
            description={badgeI18n?.description ?? badge.id}
            icon={badge.icon}
            category={badge.category}
          />
        </ViewShot>
      </View>

      <ShareBottomSheet
        visible={shareSheet.isOpen}
        onClose={shareSheet.close}
        onShareText={handleShareText}
        onShareImage={handleShareImage}
      />
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
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
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
  }), [colors])
}
