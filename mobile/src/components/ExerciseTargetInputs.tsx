import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

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
 * Affiche 3 inputs côte à côte (séries — reps — poids).
 * Le champ Reps dispose d'un toggle interne **Fixe | Plage** :
 * - Mode Fixe : un seul input numérique (ex: "8")
 * - Mode Plage : deux inputs [min] — [max] composant une range "6-10"
 *
 * Mode 100% natif (Option C) : aucun prop `value` ni `defaultValue` sur les TextInput.
 * La valeur initiale est injectée via `setNativeProps({ text })` au mount uniquement.
 * Après le mount, le natif gère le texte de façon totalement autonome — zéro interférence
 * React Native → zéro perte de caractère à la frappe rapide.
 * Le clamping des valeurs est délégué aux parents (au moment du DB write).
 *
 * @param sets - Valeur initiale du champ séries
 * @param reps - Valeur initiale du champ reps (entier OU range ex: '6-10')
 * @param weight - Valeur initiale du champ poids
 * @param onSetsChange - Callback appelé quand séries change
 * @param onRepsChange - Callback appelé quand reps change — la valeur peut être un entier ou une range 'N-M'
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
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)

  // --- Reps toggle state (local) ---
  const [repsMode, setRepsMode] = useState<'fixed' | 'range'>(() =>
    reps.includes('-') ? 'range' : 'fixed'
  )
  const repsMinRef = useRef(reps.includes('-') ? reps.split('-')[0] : reps)
  const repsMaxRef = useRef(reps.includes('-') ? (reps.split('-')[1] ?? '') : '')

  // Refs pour injecter la valeur initiale via setNativeProps (une seule fois au mount)
  // Aucun prop value/defaultValue → React Native ne touche JAMAIS au texte natif après le mount
  const setsInputRef = useRef<TextInput>(null)
  const weightInputRef = useRef<TextInput>(null)
  const repsFixedInputRef = useRef<TextInput>(null)
  const repsMinInputRef = useRef<TextInput>(null)
  const repsMaxInputRef = useRef<TextInput>(null)

  // Initialise les champs fixes (séries, poids, reps fixe) au premier mount
  // Les deps vides sont intentionnelles : on n'initialise qu'une seule fois
  useEffect(() => {
    if (sets) setsInputRef.current?.setNativeProps({ text: sets })
    if (weight) weightInputRef.current?.setNativeProps({ text: weight })
    if (repsMinRef.current) repsFixedInputRef.current?.setNativeProps({ text: repsMinRef.current })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialise les inputs de plage quand on bascule en mode Range (inputs qui viennent de monter)
  useEffect(() => {
    if (repsMode === 'range') {
      if (repsMinRef.current) repsMinInputRef.current?.setNativeProps({ text: repsMinRef.current })
      if (repsMaxRef.current) repsMaxInputRef.current?.setNativeProps({ text: repsMaxRef.current })
    }
  }, [repsMode])

  // --- Handlers (non-contrôlés : pas de clamp ici, délégué aux parents) ---
  const handleSetsChange = (v: string) => onSetsChange(v)
  const handleWeightChange = (v: string) => onWeightChange(v)

  const handleRepsMinChange = (value: string) => {
    repsMinRef.current = value
    if (value === '') { onRepsChange(''); return }
    onRepsChange(repsMode === 'range' && repsMaxRef.current ? `${value}-${repsMaxRef.current}` : value)
  }

  const handleRepsMaxChange = (value: string) => {
    repsMaxRef.current = value
    if (value === '') { onRepsChange(repsMinRef.current || ''); return }
    onRepsChange(repsMinRef.current ? `${repsMinRef.current}-${value}` : value)
  }

  const switchToFixed = () => {
    setRepsMode('fixed')
    repsMaxRef.current = ''
    onRepsChange(repsMinRef.current)
  }

  const switchToRange = () => {
    setRepsMode('range')
  }

  return (
    <View>
      {/* Ligne 1 : Séries + Poids */}
      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          {showLabels && <Text style={styles.label}>{t.exerciseTargetInputs.sets}</Text>}
          <TextInput
            ref={setsInputRef}
            testID="input-sets"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={handleSetsChange}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
            autoFocus={autoFocus}
          />
        </View>
        <View style={styles.inputWrapperLast}>
          {showLabels && <Text style={styles.label}>{t.exerciseTargetInputs.weight}</Text>}
          <TextInput
            ref={weightInputRef}
            testID="input-weight"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={handleWeightChange}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>

      {/* Ligne 2 : Reps (pleine largeur) */}
      <View>
        {showLabels && (
          <View style={styles.repsHeader}>
            <Text style={styles.label}>{t.exerciseTargetInputs.reps}</Text>
            <View style={styles.repsToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, repsMode === 'fixed' && styles.modeBtnActive]}
                onPress={switchToFixed}
              >
                <Text style={[styles.modeBtnText, repsMode === 'fixed' && styles.modeBtnTextActive]}>{t.exerciseTargetInputs.modeFixed}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, repsMode === 'range' && styles.modeBtnActive]}
                onPress={switchToRange}
              >
                <Text style={[styles.modeBtnText, repsMode === 'range' && styles.modeBtnTextActive]}>{t.exerciseTargetInputs.modeRange}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {repsMode === 'fixed' ? (
          <TextInput
            ref={repsFixedInputRef}
            testID="input-reps"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={handleRepsMinChange}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
          />
        ) : (
          <View style={styles.repsRangeRow}>
            <TextInput
              ref={repsMinInputRef}
              testID="input-reps-min"
              style={[styles.input, styles.repsRangeInput]}
              keyboardType="numeric"
              onChangeText={handleRepsMinChange}
              placeholder="min"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.rangeSeparator}>—</Text>
            <TextInput
              ref={repsMaxInputRef}
              testID="input-reps-max"
              style={[styles.input, styles.repsRangeInput]}
              keyboardType="numeric"
              onChangeText={handleRepsMaxChange}
              placeholder="max"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        )}
      </View>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    inputWrapper: {
      flex: 1,
    },
    inputWrapperLast: {
      flex: 1,
    },
    repsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    repsToggle: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    modeBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
    },
    modeBtnActive: {
      backgroundColor: colors.primary,
    },
    modeBtnText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    modeBtnTextActive: {
      color: colors.background,
    },
    repsRangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    repsRangeInput: {
      flex: 1,
    },
    rangeSeparator: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      marginBottom: spacing.md,
    },
    label: {
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      fontSize: fontSize.xs,
    },
    input: {
      backgroundColor: colors.cardSecondary,
      color: colors.text,
      padding: spacing.ms,
      borderRadius: borderRadius.sm,
      fontSize: fontSize.md,
      marginBottom: spacing.md,
    },
  })
}
