/**
 * StatsHallOfFameScreen — Hall of Fame (stub)
 * TODO: implémentation complète par le groupe dédié
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { spacing, fontSize } from '../theme'

export default function StatsHallOfFameScreen() {
  const colors = useColors()
  const { t } = useLanguage()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t.hallOfFame.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.hallOfFame.subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
})
