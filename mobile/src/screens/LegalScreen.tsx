import React, { useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { CGU_URL } from '../model/constants'
import type { ThemeColors } from '../theme'

export default function LegalScreen() {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const handleOpenWeb = async () => {
    try {
      await Linking.openURL(CGU_URL)
    } catch (e) {
      if (__DEV__) console.error('[LegalScreen] Cannot open URL:', e)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={handleOpenWeb} style={styles.webLinkContainer}>
        <Text style={[styles.webLink, { color: colors.primary }]}>
          {CGU_URL}
        </Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <Text style={styles.body}>{t.legal.fallbackContent}</Text>
    </ScrollView>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    webLinkContainer: {
      marginBottom: spacing.md,
    },
    webLink: {
      fontSize: fontSize.sm,
      textDecorationLine: 'underline',
    },
    separator: {
      height: 1,
      backgroundColor: colors.cardSecondary,
      marginBottom: spacing.lg,
    },
    body: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      lineHeight: 22,
    },
  }), [colors])
}
