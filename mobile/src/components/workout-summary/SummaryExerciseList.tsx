import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, borderRadius, fontSize } from '../../theme'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useUnits } from '../../contexts/UnitContext'
import type { ThemeColors } from '../../theme'
import type { RecapExerciseData, RecapComparisonData } from '../../types/workout'

interface SummaryExerciseListProps {
  recapExercises: RecapExerciseData[]
  recapComparison: RecapComparisonData
  exercisesWithDelta: RecapExerciseData[]
}

function formatWeight(w: number): string {
  return w % 1 === 0 ? `${w}` : `${w.toFixed(1)}`
}

const SummaryExerciseList: React.FC<SummaryExerciseListProps> = ({
  recapExercises,
  recapComparison,
  exercisesWithDelta,
}) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()
  const { weightUnit, convertWeight } = useUnits()

  if (recapExercises.length === 0) return null

  return (
    <>
      {/* Section "Ce que tu as fait" */}
      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>{t.workoutSummary.sectionDone}</Text>
      {recapExercises.map((exo, idx) => {
        const isComplete = exo.setsValidated >= exo.setsTarget && exo.setsTarget > 0
        return (
          <View key={idx} style={styles.exoRow}>
            <View style={styles.exoHeader}>
              <Text style={styles.exoName}>{exo.exerciseName}</Text>
              {exo.setsTarget > 0 && (
                isComplete
                  ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  : <Text style={styles.incompleteBadge}>
                      {exo.setsValidated}/{exo.setsTarget}
                    </Text>
              )}
            </View>
            <Text style={styles.exoSets}>
              {exo.sets.map(s => `${s.reps}×${formatWeight(convertWeight(s.weight))} ${weightUnit}`).join('  ·  ')}
            </Text>
          </View>
        )
      })}

      {/* Section "Progression" */}
      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>{t.workoutSummary.sectionProgression}</Text>

      {recapComparison.prevVolume === null ? (
        <Text style={styles.progressionFirstTime}>{t.workoutSummary.firstSession}</Text>
      ) : (
        <View style={styles.progressionVolRow}>
          <Text style={styles.progressionLabel}>{t.workoutSummary.totalVolume}</Text>
          {recapComparison.volumeGain > 0 ? (
            <View style={styles.row}>
              <Text style={[styles.progressionDelta, { color: colors.primary }]}>
                +{convertWeight(recapComparison.volumeGain).toFixed(1)} {weightUnit}
              </Text>
              <Ionicons name="chevron-up-outline" size={12} color={colors.primary} />
            </View>
          ) : recapComparison.volumeGain < 0 ? (
            <View style={styles.row}>
              <Text style={[styles.progressionDelta, { color: colors.danger }]}>
                {convertWeight(recapComparison.volumeGain).toFixed(1)} {weightUnit}
              </Text>
              <Ionicons name="chevron-down-outline" size={12} color={colors.danger} />
            </View>
          ) : (
            <Text style={[styles.progressionDelta, { color: colors.textSecondary }]}>
              {t.workoutSummary.sameVolume}
            </Text>
          )}
        </View>
      )}

      {exercisesWithDelta.map((exo, idx) => (
        <View key={idx} style={styles.progressionExoRow}>
          <Text style={styles.progressionExoName}>{exo.exerciseName}</Text>
          <View style={styles.row}>
            <Text style={[
              styles.progressionDelta,
              { color: exo.currMaxWeight > exo.prevMaxWeight ? colors.primary : colors.danger }
            ]}>
              {formatWeight(convertWeight(exo.prevMaxWeight))} → {formatWeight(convertWeight(exo.currMaxWeight))} {weightUnit}
            </Text>
            <Ionicons
              name={exo.currMaxWeight > exo.prevMaxWeight ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={12}
              color={exo.currMaxWeight > exo.prevMaxWeight ? colors.primary : colors.danger}
            />
          </View>
        </View>
      ))}
    </>
  )
}

export default React.memo(SummaryExerciseList)

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
    },
    exoRow: {
      marginBottom: spacing.sm,
    },
    exoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: 2,
    },
    exoName: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
      flex: 1,
    },
    incompleteBadge: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      backgroundColor: colors.cardSecondary,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
      borderRadius: borderRadius.sm,
    },
    exoSets: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    progressionFirstTime: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    progressionVolRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    progressionLabel: {
      color: colors.text,
      fontSize: fontSize.sm,
    },
    progressionDelta: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    progressionExoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    progressionExoName: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      flex: 1,
      marginRight: spacing.sm,
    },
  })
}
