import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { FatigueResult } from '../../model/utils/fatigueIndexHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useUnits } from '../../contexts/UnitContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface BodyFatigueCardProps {
  fatigueResult: FatigueResult
}

function getFatigueColor(zone: FatigueResult['zone'], colors: ThemeColors) {
  switch (zone) {
    case 'overreaching': return colors.danger
    case 'reaching': return colors.amber
    case 'recovery': return colors.placeholder
    default: return colors.primary
  }
}

function getFatigueIcon(zone: FatigueResult['zone']): keyof typeof Ionicons.glyphMap {
  switch (zone) {
    case 'overreaching': return 'warning-outline'
    case 'reaching': return 'alert-circle-outline'
    case 'recovery': return 'bed-outline'
    default: return 'checkmark-circle-outline'
  }
}

function BodyFatigueCardInner({ fatigueResult }: BodyFatigueCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const { weightUnit, convertWeight } = useUnits()
  const styles = useCardStyles(colors)

  const fatigueColor = getFatigueColor(fatigueResult.zone, colors)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name={getFatigueIcon(fatigueResult.zone)}
          size={20}
          color={fatigueColor}
        />
        <Text style={[styles.title, { color: fatigueColor }]}>
          {t.home.fatigue.zones[fatigueResult.zone]}
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${fatigueResult.index}%`, backgroundColor: fatigueColor }]} />
        <View style={[styles.marker, { left: '50%' }]} />
      </View>
      <Text style={styles.stats}>
        {t.home.fatigue.thisWeek}: {Math.round(convertWeight(fatigueResult.weeklyVolume))} {weightUnit}
        {'  \u2022  '}
        {t.home.fatigue.average}: {Math.round(convertWeight(fatigueResult.avgWeeklyVolume))} {weightUnit}
      </Text>
    </View>
  )
}

export const BodyFatigueCard = React.memo(BodyFatigueCardInner)

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    barBg: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xxs,
      marginBottom: spacing.sm,
      overflow: 'hidden',
      position: 'relative',
    },
    barFill: {
      height: '100%',
      borderRadius: borderRadius.xxs,
    },
    marker: {
      position: 'absolute',
      top: -2,
      width: 2,
      height: 10,
      backgroundColor: colors.text,
      borderRadius: borderRadius.xxs,
    },
    stats: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  }), [colors])
}
