import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import Exercise from '../model/models/Exercise'
import { ANIMATION_MAP } from '../model/utils/animationMap'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

interface ExerciseInfoSheetProps {
  exercise: Exercise
  visible: boolean
  onClose: () => void
  onViewHistory?: () => void
}

/**
 * ExerciseInfoSheet — Fiche d'information d'un exercice dans un BottomSheet.
 *
 * Affiche : placeholder animation, nom, muscles, description, notes.
 * Utilise le BottomSheet existant (Portal pattern, pas de Modal natif).
 */
export const ExerciseInfoSheet: React.FC<ExerciseInfoSheetProps> = ({
  exercise,
  visible,
  onClose,
  onViewHistory,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const muscles = exercise.muscles || []
  const description = exercise.description
  const notes = exercise.notes
  const animationUrl = exercise.animationKey ? ANIMATION_MAP[exercise.animationKey] : undefined

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Zone démonstration */}
      <View style={styles.animationContainer}>
        {animationUrl ? (
          <Image
            source={{ uri: animationUrl }}
            style={styles.animationImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={300}
          />
        ) : (
          <>
            <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.placeholderText}>{t.exerciseInfoSheet.noAnimation}</Text>
          </>
        )}
      </View>

      {/* Nom de l'exercice */}
      <Text style={styles.exerciseName} numberOfLines={2}>
        {exercise.name}
      </Text>

      {/* Chips muscles */}
      {muscles.length > 0 && (
        <View style={styles.musclesRow}>
          {muscles.map((muscle) => (
            <View key={muscle} style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>{t.muscleNames[muscle as keyof typeof t.muscleNames] ?? muscle}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t.exerciseInfoSheet.description}</Text>
        {description ? (
          <Text style={styles.descriptionText}>{description}</Text>
        ) : (
          <Text style={styles.emptyText}>{t.exerciseInfoSheet.noDescription}</Text>
        )}
      </View>

      {/* Notes personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t.exerciseInfoSheet.personalNotes}</Text>
        {notes ? (
          <Text style={styles.notesText}>{notes}</Text>
        ) : (
          <Text style={styles.emptyText}>{t.exerciseInfoSheet.noNotes}</Text>
        )}
      </View>

      {/* Bouton historique */}
      {onViewHistory && (
        <TouchableOpacity style={styles.historyButton} onPress={onViewHistory}>
          <Text style={styles.historyButtonText}>{t.exerciseInfoSheet.viewHistory}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    animationContainer: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
      height: 200,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    animationImage: {
      width: '100%',
      height: '100%',
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    exerciseName: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: 'bold',
      marginBottom: spacing.sm,
    },
    musclesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    muscleChip: {
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    muscleChipText: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    section: {
      marginBottom: spacing.md,
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    descriptionText: {
      color: colors.text,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    notesText: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontStyle: 'italic',
      lineHeight: 20,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontStyle: 'italic',
    },
    historyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      marginTop: spacing.xs,
    },
    historyButtonText: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
  })
}
