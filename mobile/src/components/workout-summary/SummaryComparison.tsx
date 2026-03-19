import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { spacing, borderRadius, fontSize } from '../../theme'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import type { SessionComparison } from '../../model/utils/sessionComparisonHelpers'

interface SummaryComparisonProps {
  comparison: SessionComparison
}

const SummaryComparison: React.FC<SummaryComparisonProps> = ({ comparison }) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()

  return (
    <>
      <View style={styles.comparisonSection}>
        <Text style={styles.comparisonTitle}>{t.sessionComparison.title}</Text>

        <View style={styles.comparisonOverall}>
          <Text style={styles.comparisonOverallLabel}>{t.sessionComparison.totalVolume}</Text>
          <Text style={[
            styles.comparisonOverallDelta,
            { color: comparison.overallVolumeDelta >= 0 ? colors.primary : colors.danger }
          ]}>
            {comparison.overallVolumeDelta >= 0 ? '↑' : '↓'}
            {' '}{Math.abs(comparison.overallVolumeDeltaPercent).toFixed(1)}%
            {' '}({comparison.overallVolumeDelta >= 0 ? '+' : ''}{Math.round(comparison.overallVolumeDelta)} kg)
          </Text>
        </View>

        {comparison.exercises.filter(e => e.deltas).map((ex) => (
          <View key={ex.exerciseId} style={styles.comparisonExRow}>
            <Text style={styles.comparisonExName} numberOfLines={1}>{ex.exerciseName}</Text>
            <View style={styles.comparisonExDeltas}>
              <Text style={[
                styles.comparisonExDelta,
                { color: ex.deltas!.volume >= 0 ? colors.primary : colors.danger }
              ]}>
                {ex.deltas!.volume >= 0 ? '+' : ''}{Math.round(ex.deltas!.volume)} kg
              </Text>
              {ex.deltas!.maxWeight !== 0 && (
                <Text style={[
                  styles.comparisonExDelta,
                  { color: ex.deltas!.maxWeight >= 0 ? colors.primary : colors.danger }
                ]}>
                  max {ex.deltas!.maxWeight >= 0 ? '+' : ''}{ex.deltas!.maxWeight} kg
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.sectionDivider} />
    </>
  )
}

export default React.memo(SummaryComparison)

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    comparisonSection: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    comparisonTitle: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    comparisonOverall: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    comparisonOverallLabel: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
    comparisonOverallDelta: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    comparisonExRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    comparisonExName: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    comparisonExDeltas: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    comparisonExDelta: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
  })
}
