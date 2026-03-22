import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { spacing, borderRadius, fontSize } from '../../theme'
import type { ThemeColors } from '../../theme'
import type { Translations } from '../../i18n'
import { useUnits } from '../../contexts/UnitContext'
import type { PRPrediction } from '../../model/utils/prPredictionHelpers'
import type { PlateauData } from '../../model/utils/plateauHelpers'
import type { OverloadTrend } from '../../model/utils/progressiveOverloadHelpers'
import type { AlternativeExercise } from '../../model/utils/exerciseAlternativesHelpers'
import type { VariantSuggestion } from '../../model/utils/variantHelpers'

interface ExerciseHistoryInsightsProps {
  prediction: PRPrediction | null
  plateauData: PlateauData | null
  weightTrend: OverloadTrend
  volumeTrend: OverloadTrend
  alternatives: AlternativeExercise[]
  variantSuggestions: VariantSuggestion[]
  colors: ThemeColors
  t: Translations
  onExercisePress: (exerciseId: string) => void
}

function ExerciseHistoryInsights({
  prediction,
  plateauData,
  weightTrend,
  volumeTrend,
  alternatives,
  variantSuggestions,
  colors,
  t,
  onExercisePress,
}: ExerciseHistoryInsightsProps) {
  const styles = useStyles(colors)
  const { weightUnit, convertWeight } = useUnits()

  return (
    <>
      {/* Progressive overload section */}
      {weightTrend.lastSessions >= 3 && (
        <View style={styles.overloadSection}>
          <Text style={styles.overloadTitle}>{t.exerciseHistory.overload.title}</Text>

          <View style={styles.overloadRow}>
            <Ionicons name="barbell-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.overloadLabel}>{t.exerciseHistory.overload.maxWeight}</Text>
            <View style={styles.overloadTrendBadge}>
              <Text style={[
                styles.overloadTrendText,
                { color: weightTrend.trend === 'up' ? colors.primary
                  : weightTrend.trend === 'down' ? colors.danger
                  : colors.textSecondary },
              ]}>
                {weightTrend.trend === 'up' ? '↑' : weightTrend.trend === 'down' ? '↓' : '→'}
                {' '}{Math.abs(weightTrend.percentChange).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.overloadRow}>
            <Ionicons name="trending-up-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.overloadLabel}>{t.exerciseHistory.overload.volume}</Text>
            <View style={styles.overloadTrendBadge}>
              <Text style={[
                styles.overloadTrendText,
                { color: volumeTrend.trend === 'up' ? colors.primary
                  : volumeTrend.trend === 'down' ? colors.danger
                  : colors.textSecondary },
              ]}>
                {volumeTrend.trend === 'up' ? '↑' : volumeTrend.trend === 'down' ? '↓' : '→'}
                {' '}{Math.abs(volumeTrend.percentChange).toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.overloadDisclaimer}>
            {t.exerciseHistory.overload.disclaimer.replace('{n}', String(weightTrend.lastSessions))}
          </Text>
        </View>
      )}

      {/* Alternatives Section */}
      {alternatives.length > 0 && (
        <View style={styles.alternativesSection}>
          <Text style={styles.alternativesTitle}>{t.exerciseHistory.alternatives.title}</Text>
          {alternatives.map(alt => (
            <TouchableOpacity
              key={alt.exerciseId}
              style={styles.alternativeRow}
              onPress={() => onExercisePress(alt.exerciseId)}
            >
              <View style={styles.alternativeInfo}>
                <Text style={styles.alternativeName}>{alt.exerciseName}</Text>
                <Text style={styles.alternativeMuscles}>{alt.sharedMuscles.join(', ')}</Text>
              </View>
              <View style={styles.alternativeMeta}>
                <Text style={styles.alternativeSets}>
                  {alt.totalSets} {t.exerciseHistory.alternatives.sets}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Prediction Section */}
      {prediction !== null && (
        <>
          <View style={styles.separator} />
          <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
            {t.exerciseHistory.prediction.title}
          </Text>
          <View style={styles.predictionCard}>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>
                📈 {t.exerciseHistory.prediction.currentOrm}
              </Text>
              <Text style={styles.predictionValue}>
                ~{convertWeight(prediction.currentBest1RM).toFixed(1)} {weightUnit}
              </Text>
            </View>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>
                🎯 {t.exerciseHistory.prediction.nextTarget}
              </Text>
              <Text style={[styles.predictionValue, styles.predictionTarget]}>
                ~{convertWeight(prediction.targetWeight).toFixed(1)} {weightUnit}
              </Text>
            </View>
            {prediction.weeksToTarget > 52 ? (
              <Text style={styles.predictionTooFar}>
                {t.exerciseHistory.prediction.tooFar}
              </Text>
            ) : (
              <>
                <Text style={styles.predictionWeeks}>
                  ⏱  {t.exerciseHistory.prediction.weeksAway.replace('{n}', String(prediction.weeksToTarget))}
                </Text>
                <Text style={styles.predictionGain}>
                  {t.exerciseHistory.prediction.weeklyGain.replace('{n}', prediction.weeklyGainRate.toFixed(1))}
                </Text>
              </>
            )}
            <View style={styles.predictionConfidenceRow}>
              <Text style={styles.predictionLabel}>
                {t.exerciseHistory.prediction.confidence} :
              </Text>
              <Text style={styles.predictionDots}>
                {prediction.confidence === 'low' && '●○○'}
                {prediction.confidence === 'medium' && '●●○'}
                {prediction.confidence === 'high' && '●●●'}
              </Text>
              <Text style={styles.predictionLabel}>
                {prediction.confidence === 'low' && t.exerciseHistory.prediction.confidenceLow}
                {prediction.confidence === 'medium' && t.exerciseHistory.prediction.confidenceMedium}
                {prediction.confidence === 'high' && t.exerciseHistory.prediction.confidenceHigh}
              </Text>
              <Text style={styles.predictionBasedOn}>
                ({t.exerciseHistory.prediction.basedOn.replace('{n}', String(prediction.dataPoints))})
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Plateau Section */}
      {plateauData?.isPlateauing && (
        <View>
          <View style={styles.separator} />
          <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
            {t.exerciseHistory.plateau.title}
          </Text>
          <View style={styles.plateauCard}>
            <View style={styles.plateauHeader}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
              <Text style={styles.plateauAlert}>
                {t.exerciseHistory.plateau.alert
                  .replace('{sessions}', String(plateauData.sessionsSinceLastPR))
                  .replace('{days}', String(plateauData.daysSinceLastProgress))}
              </Text>
            </View>
            <Text style={styles.plateauSubtitle}>{t.exerciseHistory.plateau.suggestions}</Text>
            {plateauData.strategies.map(strategy => (
              <View key={strategy} style={styles.strategyRow}>
                <Text style={styles.strategyBullet}>•</Text>
                <Text style={styles.strategyText}>
                  {t.exerciseHistory.plateau.strategies[strategy]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Variants Section */}
      {variantSuggestions.length > 0 && (
        <View>
          <View style={styles.separator} />
          <Text style={[styles.sectionTitle, styles.historySectionTitle]}>
            {t.exerciseHistory.variants.title}
          </Text>
          <View style={styles.historyCard}>
            {variantSuggestions.map((variant, index) => (
              <TouchableOpacity
                key={variant.exercise.id}
                style={styles.variantRow}
                onPress={() => onExercisePress(variant.exercise.id)}
                activeOpacity={0.7}
              >
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.variantContent}>
                  <View style={styles.variantLeft}>
                    <Text style={styles.variantName}>{variant.exercise.name}</Text>
                    <Text style={styles.variantMuscles}>{variant.sharedMuscles.join(' · ')}</Text>
                  </View>
                  <View style={styles.variantRight}>
                    {variant.hasHistory
                      ? <Text style={styles.variantDone}>{t.exerciseHistory.variants.done}</Text>
                      : <Text style={styles.variantNew}>{t.exerciseHistory.variants.discover}</Text>
                    }
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </>
  )
}

export default React.memo(ExerciseHistoryInsights)

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    historySectionTitle: {
      marginTop: spacing.lg,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing.md,
    },
    overloadSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    overloadTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    overloadRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    overloadLabel: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    overloadTrendBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
    },
    overloadTrendText: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
    },
    overloadDisclaimer: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
      marginTop: spacing.sm,
    },
    alternativesSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    alternativesTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    alternativeRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.cardSecondary,
    },
    alternativeInfo: {
      flex: 1,
    },
    alternativeName: {
      fontSize: fontSize.sm,
      fontWeight: '600' as const,
      color: colors.text,
    },
    alternativeMuscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    alternativeMeta: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
    },
    alternativeSets: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    predictionCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    predictionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    predictionLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    predictionValue: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    predictionTarget: {
      color: colors.warning,
    },
    predictionWeeks: {
      fontSize: fontSize.sm,
      color: colors.text,
      marginTop: spacing.xs,
    },
    predictionGain: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    predictionTooFar: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    predictionConfidenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    predictionDots: {
      fontSize: fontSize.sm,
      color: colors.primary,
    },
    predictionBasedOn: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    plateauCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    plateauHeader: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    plateauAlert: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    plateauSubtitle: {
      fontSize: fontSize.xs,
      color: colors.text,
      fontWeight: '600' as const,
      marginBottom: spacing.xs,
    },
    strategyRow: {
      flexDirection: 'row' as const,
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    strategyBullet: {
      color: colors.primary,
      fontWeight: '700' as const,
    },
    strategyText: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 17,
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    variantRow: {
      paddingHorizontal: spacing.md,
    },
    variantContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: spacing.sm,
    },
    variantLeft: {
      flex: 1,
    },
    variantName: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '500' as const,
    },
    variantMuscles: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    variantRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
    },
    variantDone: {
      fontSize: fontSize.caption,
      color: colors.primary,
      fontWeight: '500' as const,
    },
    variantNew: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
    },
  }), [colors])
}
