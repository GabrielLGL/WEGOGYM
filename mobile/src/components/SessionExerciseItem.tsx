import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import { ExerciseInfoSheet } from './ExerciseInfoSheet'
import { useHaptics } from '../hooks/useHaptics'
import { of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

interface SessionExerciseItemProps {
  item: SessionExercise
  onEditTargets: (se: SessionExercise) => void
  onRemove: (se: SessionExercise, exoName: string) => void
  onUngroup?: (se: SessionExercise) => void
  drag?: () => void
  dragActive?: boolean
  isSelected?: boolean
  onSelect?: (se: SessionExercise) => void
  selectionMode?: boolean
  groupInfo?: { type: string; isFirst: boolean; isLast: boolean }
}

interface EnhancedProps extends SessionExerciseItemProps {
  exercise: Exercise | null
}

const SessionExerciseItemComponent: React.FC<EnhancedProps> = ({
  item, exercise, onEditTargets, onRemove, onUngroup,
  drag, dragActive, isSelected, onSelect, selectionMode, groupInfo,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const [infoVisible, setInfoVisible] = useState(false)
  const haptics = useHaptics()

  if (!exercise) return null

  const handleInfoPress = () => {
    haptics.onPress()
    setInfoVisible(true)
  }

  const handlePress = () => {
    if (selectionMode && onSelect) {
      haptics.onSelect()
      onSelect(item)
    }
  }

  const handleLongPress = () => {
    if (!selectionMode && onSelect) {
      haptics.onPress()
      onSelect(item)
    }
  }

  const groupBorderColor = groupInfo
    ? (groupInfo.type === 'superset' ? colors.primary : colors.warning)
    : 'transparent'

  return (
    <TouchableOpacity
      activeOpacity={selectionMode ? 0.7 : 1}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <View style={[
        styles.itemContainer,
        dragActive && styles.itemContainerDragging,
        isSelected && { borderColor: colors.primary, borderWidth: 2 },
        groupInfo && {
          borderLeftWidth: 4,
          borderLeftColor: groupBorderColor,
          marginTop: groupInfo.isFirst ? spacing.sm : 2,
          marginBottom: groupInfo.isLast ? spacing.sm : 0,
          borderTopLeftRadius: groupInfo.isFirst ? borderRadius.md : 4,
          borderTopRightRadius: groupInfo.isFirst ? borderRadius.md : 4,
          borderBottomLeftRadius: groupInfo.isLast ? borderRadius.md : 4,
          borderBottomRightRadius: groupInfo.isLast ? borderRadius.md : 4,
        },
      ]}>
        {groupInfo?.isFirst && (
          <View style={[styles.groupBadge, { backgroundColor: groupBorderColor + '20' }]}>
            <Text style={[styles.groupBadgeText, { color: groupBorderColor }]}>
              {groupInfo.type === 'superset' ? 'SS' : 'CIR'}
            </Text>
            {onUngroup && (
              <TouchableOpacity
                onPress={() => onUngroup(item)}
                style={styles.ungroupBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={groupBorderColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
        {drag && !selectionMode && (
          <TouchableOpacity style={styles.dragHandle} onPressIn={drag}>
            <View style={styles.dragBar} />
            <View style={styles.dragBar} />
            <View style={styles.dragBar} />
          </TouchableOpacity>
        )}
        {selectionMode && (
          <View style={[styles.checkbox, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {isSelected && <Ionicons name="checkmark" size={14} color={colors.background} />}
          </View>
        )}
        <View style={styles.itemInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle} numberOfLines={2}>{exercise.name}</Text>
            <TouchableOpacity onPress={handleInfoPress} style={styles.infoBtn} testID="info-button">
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTags}>{exercise.muscles?.join(', ')} • {exercise.equipment}</Text>
          {exercise.notes ? <Text style={styles.noteIndicator}>{t.common.notes}</Text> : null}
          <TouchableOpacity style={styles.targetRow} onPress={() => onEditTargets(item)}>
            <View style={styles.targetBox}>
              <Text style={styles.targetValue}>{item.setsTarget || 0}</Text>
              <Text style={styles.targetLabel}>{t.exerciseTargetInputs.sets}</Text>
            </View>
            <Text style={styles.targetSeparator}>×</Text>
            <View style={styles.targetBox}>
              <Text style={styles.targetValue}>{item.repsTarget || '0'}</Text>
              <Text style={styles.targetLabel}>{t.exerciseTargetInputs.reps}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {!selectionMode && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onRemove(item, exercise.name)} testID="delete-btn">
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
        <ExerciseInfoSheet
          exercise={exercise}
          visible={infoVisible}
          onClose={() => setInfoVisible(false)}
        />
      </View>
    </TouchableOpacity>
  )
}

export const SessionExerciseItem = withObservables(['item'], ({ item }: SessionExerciseItemProps) => ({
  item,
  exercise: item.exercise.observe().pipe(catchError(() => of(null))),
}))(SessionExerciseItemComponent)

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      borderRadius: borderRadius.xxs,
      backgroundColor: colors.border,
    },
    itemInfo: { flex: 1 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    itemTitle: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: 'bold',
      flex: 1,
    },
    infoBtn: {
      marginLeft: spacing.sm,
      padding: spacing.xs,
    },
    itemTags: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginBottom: spacing.ms,
    },
    noteIndicator: {
      color: colors.textSecondary,
      fontSize: fontSize.caption,
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
    checkbox: {
      width: spacing.lg,
      height: spacing.lg,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    groupBadge: {
      position: 'absolute',
      top: -1,
      left: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderBottomLeftRadius: borderRadius.sm,
      borderBottomRightRadius: borderRadius.sm,
      gap: spacing.xs,
    },
    groupBadgeText: {
      fontSize: fontSize.caption,
      fontWeight: '800',
      letterSpacing: 1,
    },
    ungroupBtn: {
      marginLeft: 2,
    },
  })
}
