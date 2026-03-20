import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { spacing, borderRadius, fontSize } from '../../theme'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import type { IntensityResult } from '../../model/utils/sessionIntensityHelpers'

interface SummaryIntensityProps {
  intensity: IntensityResult
}

const SummaryIntensity: React.FC<SummaryIntensityProps> = ({ intensity }) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()

  return (
    <>
      <View style={styles.intensitySection}>
        <Text style={styles.intensityTitle}>{t.intensity.title}</Text>
        <View style={styles.intensityScoreRow}>
          <Text style={[styles.intensityScore, { color: intensity.color }]}>
            {intensity.score}
          </Text>
          <Text style={[styles.intensityLabel, { color: intensity.color }]}>
            {t.intensity.levels[intensity.label]}
          </Text>
        </View>
        <View style={styles.intensityBarBg}>
          <View style={[
            styles.intensityBarFill,
            { width: `${intensity.score}%`, backgroundColor: intensity.color },
          ]} />
        </View>
        <View style={styles.intensityBreakdown}>
          <Text style={styles.intensityBreakdownItem}>
            {t.intensity.volume}: {intensity.breakdown.volumeScore}/33
          </Text>
          <Text style={styles.intensityBreakdownItem}>
            {t.intensity.prs}: {intensity.breakdown.prScore}/33
          </Text>
          <Text style={styles.intensityBreakdownItem}>
            {t.intensity.effort}: {intensity.breakdown.effortScore}/34
          </Text>
        </View>
      </View>
      <View style={styles.sectionDivider} />
    </>
  )
}

export default React.memo(SummaryIntensity)

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    intensitySection: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    intensityTitle: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    intensityScoreRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    intensityScore: {
      fontSize: fontSize.jumbo,
      fontWeight: '900',
    },
    intensityLabel: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    intensityBarBg: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xxs,
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    intensityBarFill: {
      height: '100%',
      borderRadius: borderRadius.xxs,
    },
    intensityBreakdown: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    intensityBreakdownItem: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
  })
}
