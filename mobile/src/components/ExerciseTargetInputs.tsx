import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors } from '../theme'

interface ExerciseTargetInputsProps {
  sets: string
  reps: string
  weight: string
  onSetsChange: (value: string) => void
  onRepsChange: (value: string) => void
  onWeightChange: (value: string) => void
  showLabels?: boolean
  autoFocus?: boolean
}

/**
 * ExerciseTargetInputs - Composant réutilisable pour les inputs d'objectifs
 *
 * Affiche 3 inputs côte à côte pour:
 * - Séries (nombre entier)
 * - Reps (nombre entier)
 * - Poids en kg (nombre décimal)
 *
 * @param sets - Valeur du champ séries
 * @param reps - Valeur du champ reps
 * @param weight - Valeur du champ poids
 * @param onSetsChange - Callback appelé quand séries change
 * @param onRepsChange - Callback appelé quand reps change
 * @param onWeightChange - Callback appelé quand poids change
 * @param showLabels - Afficher les labels au-dessus des inputs (défaut: true)
 * @param autoFocus - Auto-focus sur le premier input (défaut: false)
 *
 * @example
 * <ExerciseTargetInputs
 *   sets={targetSets}
 *   reps={targetReps}
 *   weight={targetWeight}
 *   onSetsChange={setTargetSets}
 *   onRepsChange={setTargetReps}
 *   onWeightChange={setTargetWeight}
 *   autoFocus
 * />
 */
export const ExerciseTargetInputs: React.FC<ExerciseTargetInputsProps> = ({
  sets,
  reps,
  weight,
  onSetsChange,
  onRepsChange,
  onWeightChange,
  showLabels = true,
  autoFocus = false,
}) => {
  return (
    <View style={styles.row}>
      {/* Séries */}
      <View style={styles.inputWrapper}>
        {showLabels && <Text style={styles.label}>Séries</Text>}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={sets}
          onChangeText={onSetsChange}
          placeholder="0"
          placeholderTextColor={colors.placeholder}
          autoFocus={autoFocus}
        />
      </View>

      {/* Reps */}
      <View style={styles.inputWrapper}>
        {showLabels && <Text style={styles.label}>Reps</Text>}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={reps}
          onChangeText={onRepsChange}
          placeholder="0"
          placeholderTextColor={colors.placeholder}
        />
      </View>

      {/* Poids */}
      <View style={styles.inputWrapperLast}>
        {showLabels && <Text style={styles.label}>Poids (kg)</Text>}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={onWeightChange}
          placeholder="0"
          placeholderTextColor={colors.placeholder}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  inputWrapperLast: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 5,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.cardSecondary,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
})
