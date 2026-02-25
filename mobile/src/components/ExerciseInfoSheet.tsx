import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import Exercise from '../model/models/Exercise'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface ExerciseInfoSheetProps {
  exercise: Exercise
  visible: boolean
  onClose: () => void
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
}) => {
  const muscles = exercise.muscles || []
  const description = exercise.description
  const notes = exercise.notes

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Zone placeholder animation */}
      <View style={styles.placeholderContainer}>
        <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>Animation à venir</Text>
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
              <Text style={styles.muscleChipText}>{muscle}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        {description ? (
          <Text style={styles.descriptionText}>{description}</Text>
        ) : (
          <Text style={styles.emptyText}>Pas de description disponible</Text>
        )}
      </View>

      {/* Notes personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notes personnelles</Text>
        {notes ? (
          <Text style={styles.notesText}>{notes}</Text>
        ) : (
          <Text style={styles.emptyText}>Aucune note</Text>
        )}
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
})
