import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

interface ShareBottomSheetProps {
  visible: boolean
  onClose: () => void
  onShareText: () => void
  onShareImage: () => void
}

export function ShareBottomSheet({ visible, onClose, onShareText, onShareImage }: ShareBottomSheetProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.share.shareButton}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.option} onPress={onShareText} activeOpacity={0.7}>
          <Text style={styles.optionIcon}>{'\u{1F4DD}'}</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t.share.shareAsText}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onShareImage} activeOpacity={0.7}>
          <Text style={styles.optionIcon}>{'\u{1F5BC}\u{FE0F}'}</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t.share.shareAsImage}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    content: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.ms,
    },
    optionIcon: {
      fontSize: fontSize.xxl,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
  }), [colors])
}
