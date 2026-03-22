/**
 * WeeklyReportCard — Card rapport hebdomadaire pour le HomeScreen dashboard
 *
 * Affiche un résumé de la semaine en cours :
 * - Nombre de séances, volume total, PRs
 * - Comparaison % avec la semaine précédente
 * - Top 3 muscles travaillés
 */

import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { spacing, borderRadius, fontSize } from '../theme'
import type { ThemeColors } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUnits } from '../contexts/UnitContext'
import { useHaptics } from '../hooks/useHaptics'

interface WeeklyReportCardProps {
  sessionsCount: number
  totalVolumeKg: number
  prsCount: number
  comparedToPrevious: number  // % change
  topMuscles: string[]        // noms des top 3 muscles
  onPress: () => void
}

function formatVolumeCompact(kg: number, weightUnit = 'kg', convertWeight?: (kg: number) => number): string {
  const value = convertWeight ? convertWeight(kg) : kg
  if (value >= 1000) {
    const tons = Math.round(value / 100) / 10
    return `${tons.toLocaleString('fr-FR')} t`
  }
  return `${Math.round(value).toLocaleString('fr-FR')} ${weightUnit}`
}

export function WeeklyReportCard({
  sessionsCount,
  totalVolumeKg,
  prsCount,
  comparedToPrevious,
  topMuscles,
  onPress,
}: WeeklyReportCardProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const { weightUnit, convertWeight } = useUnits()
  const haptics = useHaptics()

  const handlePress = () => {
    haptics.onPress()
    onPress()
  }

  const comparisonColor = comparedToPrevious >= 0 ? colors.primary : colors.danger
  const comparisonArrow = comparedToPrevious > 0 ? '\u2191' : comparedToPrevious < 0 ? '\u2193' : ''
  const comparisonText = comparedToPrevious !== 0
    ? `${comparisonArrow}${Math.abs(comparedToPrevious)}% ${t.home.vsLastWeek}`
    : ''

  const muscleText = topMuscles.length > 0
    ? `${t.home.topMuscles} : ${topMuscles.join(', ')}`
    : ''

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
          <Text style={styles.title}>{t.home.weeklyReport}</Text>
        </View>
        <View style={styles.viewBtn}>
          <Text style={styles.viewText}>{t.home.viewReport}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>

      {/* KPI row */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiValue}>{sessionsCount}</Text>
          <Text style={styles.kpiLabel}>
            {sessionsCount > 1 ? t.home.sessions : t.home.session}
          </Text>
        </View>
        <View style={styles.kpiSeparator} />
        <View style={styles.kpiItem}>
          <Text style={styles.kpiValue}>{formatVolumeCompact(totalVolumeKg, weightUnit, convertWeight)}</Text>
          <Text style={styles.kpiLabel}>{t.stats.volume}</Text>
        </View>
        <View style={styles.kpiSeparator} />
        <View style={styles.kpiItem}>
          <Text style={styles.kpiValue}>{prsCount}</Text>
          <Text style={styles.kpiLabel}>PRs</Text>
        </View>
      </View>

      {/* Comparison */}
      {comparisonText !== '' && (
        <Text style={[styles.comparison, { color: comparisonColor }]}>
          {comparisonText}
        </Text>
      )}

      {/* Top muscles */}
      {muscleText !== '' && (
        <Text style={styles.topMuscles}>{muscleText}</Text>
      )}
    </TouchableOpacity>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    viewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    viewText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    kpiRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    kpiItem: {
      flex: 1,
      alignItems: 'center',
    },
    kpiValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    kpiLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    kpiSeparator: {
      width: 1,
      height: spacing.xl,
      backgroundColor: colors.separator,
    },
    comparison: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    topMuscles: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
  }), [colors])
}
