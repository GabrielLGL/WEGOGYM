import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import withObservables from '@nozbe/with-observables'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import { of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface SessionExerciseItemProps {
  item: SessionExercise
  onEditTargets: (se: SessionExercise) => void
  onRemove: (se: SessionExercise, exoName: string) => void
  drag?: () => void
  dragActive?: boolean
}

interface EnhancedProps extends SessionExerciseItemProps {
  exercise: Exercise | null
}

const SessionExerciseItemComponent: React.FC<EnhancedProps> = ({ item, exercise, onEditTargets, onRemove, drag, dragActive }) => {
  if (!exercise) return null

  return (
    <View style={[styles.itemContainer, dragActive && styles.itemContainerDragging]}>
      {drag && (
        <TouchableOpacity style={styles.dragHandle} onPressIn={drag}>
          <View style={styles.dragBar} />
          <View style={styles.dragBar} />
          <View style={styles.dragBar} />
        </TouchableOpacity>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{exercise.name}</Text>
        <Text style={styles.itemTags}>{exercise.muscles?.join(', ')} • {exercise.equipment}</Text>
        {exercise.notes ? <Text style={styles.noteIndicator}>Notes</Text> : null}
        <TouchableOpacity style={styles.targetRow} onPress={() => onEditTargets(item)}>
          <View style={styles.targetBox}>
            <Text style={styles.targetValue}>{item.setsTarget || 0}</Text>
            <Text style={styles.targetLabel}>Séries</Text>
          </View>
          <Text style={styles.targetSeparator}>×</Text>
          <View style={styles.targetBox}>
            <Text style={styles.targetValue}>{item.repsTarget || '0'}</Text>
            <Text style={styles.targetLabel}>Reps</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onRemove(item, exercise.name)}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardSecondary,
  },
  itemContainerDragging: {
    backgroundColor: colors.cardSecondary,
  },
  dragHandle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dragBar: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  itemTags: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: spacing.ms,
  },
  noteIndicator: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetBox: {
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minWidth: 55,
  },
  targetValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  targetLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  targetSeparator: {
    color: colors.placeholder,
    fontSize: fontSize.md,
    marginHorizontal: spacing.sm,
    fontWeight: '300',
  },
  deleteBtn: { padding: spacing.md },
  deleteIcon: { fontSize: fontSize.xl, color: colors.placeholder },
})

export const SessionExerciseItem = withObservables(['item'], ({ item }: SessionExerciseItemProps) => ({
  item,
  exercise: item.exercise.observe().pipe(catchError(() => of(null))),
}))(SessionExerciseItemComponent)
