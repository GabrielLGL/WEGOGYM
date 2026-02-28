import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { AIFormData } from '../services/ai/types'
import type { WizardStep, StepOption, FormValue } from '../hooks/useAssistantWizard'

interface WizardStepContentProps {
  step: WizardStep
  formData: Partial<AIFormData>
  equipmentOptions: string[]
  muscleOptions: StepOption[]
  musclesFocusOptions: string[]
  injuriesOptions: StepOption[]
  onToggleEquipment: (item: string) => void
  onToggleMusclesFocus: (muscle: string) => void
  onToggleMuscleGroup: (muscle: string) => void
  onToggleInjuries: (value: string) => void
  onMultiNext: () => void
  onSelect: (field: keyof AIFormData, value: FormValue) => void
}

export function WizardStepContent({
  step,
  formData,
  equipmentOptions,
  muscleOptions,
  musclesFocusOptions,
  injuriesOptions,
  onToggleEquipment,
  onToggleMusclesFocus,
  onToggleMuscleGroup,
  onToggleInjuries,
  onMultiNext,
  onSelect,
}: WizardStepContentProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  if (step.kind === 'multi') {
    const selected     = formData.equipment ?? []
    const hasSelection = selected.length > 0
    return (
      <View>
        <View style={styles.chipsWrap}>
          {equipmentOptions.map(eq => {
            const isSelected = selected.includes(eq)
            return (
              <TouchableOpacity
                key={eq}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onToggleEquipment(eq)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{eq}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity
          style={[styles.nextBtn, !hasSelection && styles.nextBtnDisabled]}
          disabled={!hasSelection}
          onPress={onMultiNext}
        >
          <Text style={styles.nextBtnText}>{t.assistant.next}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step.kind === 'multi-focus') {
    const selected    = formData.musclesFocus ?? []
    const isEquilibre = selected.length === 0
    return (
      <View>
        <View style={styles.chipsWrap}>
          {musclesFocusOptions.map(muscle => {
            const isActive = muscle === 'Équilibré' ? isEquilibre : selected.includes(muscle)
            const label = t.assistant.musclesFocus[muscle as keyof typeof t.assistant.musclesFocus] ?? muscle
            return (
              <TouchableOpacity
                key={muscle}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onToggleMusclesFocus(muscle)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={onMultiNext}>
          <Text style={styles.nextBtnText}>{t.assistant.next}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step.kind === 'multi-muscle') {
    const selected     = formData.muscleGroups ?? []
    const hasSelection = selected.length > 0
    return (
      <View>
        <View style={styles.chipsWrap}>
          {muscleOptions.map(opt => {
            const isActive = selected.includes(String(opt.value))
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onToggleMuscleGroup(String(opt.value))}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity
          style={[styles.nextBtn, !hasSelection && styles.nextBtnDisabled]}
          disabled={!hasSelection}
          onPress={onMultiNext}
        >
          <Text style={styles.nextBtnText}>{t.assistant.next}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step.kind === 'multi-injuries') {
    const selected = formData.injuries ?? []
    return (
      <View>
        <View style={styles.chipsWrap}>
          {injuriesOptions.map(opt => {
            const isActive = selected.includes(String(opt.value))
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onToggleInjuries(String(opt.value))}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={onMultiNext}>
          <Text style={styles.nextBtnText}>{t.assistant.next}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Single choice
  const selectedValue = formData[step.field]
  return (
    <View style={styles.optionsList}>
      {step.options?.map(opt => {
        const isSelected = opt.value === selectedValue
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[styles.optionCard, isSelected && styles.optionCardActive]}
            onPress={() => onSelect(step.field, opt.value)}
          >
            <View style={styles.optionRow}>
              {opt.icon !== undefined && (
                <Ionicons name={opt.icon} size={24} color={colors.primary} />
              )}
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
                {opt.sub !== undefined && (
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // ── Chips multi-select ─────────────────────────────────────────────────
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    chipActive: {
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '500',
    },
    chipTextActive: {
      color: colors.text,
      fontWeight: '600',
    },

    // ── Bouton Suivant ─────────────────────────────────────────────────────
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    nextBtnDisabled: {
      opacity: 0.4,
    },
    nextBtnText: {
      color: colors.primaryText,
      fontSize: fontSize.md,
      fontWeight: '700',
    },

    // ── Options single-choice ──────────────────────────────────────────────
    optionsList: {
      gap: spacing.sm,
    },
    optionCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionCardActive: {
      borderColor: colors.primary,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    optionTextWrap: {
      flex: 1,
    },
    optionLabel: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    optionLabelActive: {
      color: colors.primary,
    },
    optionSub: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginTop: 2,
    },
  })
}
