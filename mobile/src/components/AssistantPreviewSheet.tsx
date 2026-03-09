import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { GeneratedPlan, GeneratedExercise } from '../services/ai/types'

function formatExerciseSets(ex: GeneratedExercise, setsLabel: string): string {
  if (ex.setsTarget > 0 && ex.repsTarget) {
    const weight = ex.weightTarget > 0 ? ` · ~${ex.weightTarget} kg` : ''
    return `${ex.setsTarget} ${setsLabel} × ${ex.repsTarget}${weight}`
  }
  if (ex.repsTarget) {
    return `× ${ex.repsTarget}`
  }
  return ''
}

interface AssistantPreviewSheetProps {
  visible: boolean
  plan: GeneratedPlan | null
  isLoading: boolean
  mode: 'program' | 'session'
  onClose: () => void
  onModify: () => void
  onValidate: (plan: GeneratedPlan) => Promise<void>
  fallbackNotice?: string
}

export const AssistantPreviewSheet: React.FC<AssistantPreviewSheetProps> = ({
  visible,
  plan,
  isLoading,
  mode,
  onClose,
  onModify,
  onValidate,
  fallbackNotice,
}) => {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const [editableName, setEditableName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (plan) setEditableName(plan.name)
  }, [plan])

  const handleValidate = async () => {
    if (!plan) return
    haptics.onSuccess()
    setIsSaving(true)
    try {
      await onValidate({ ...plan, name: editableName.trim() || plan.name })
    } finally {
      setIsSaving(false)
    }
  }

  const handleModify = () => {
    haptics.onPress()
    onModify()
  }

  const title = mode === 'program' ? t.assistantPreview.titleProgram : t.assistantPreview.titleSession

  const totalExercises = plan
    ? plan.sessions.reduce((acc, s) => acc + s.exercises.length, 0)
    : 0
  const summary = plan
    ? `${plan.sessions.length} ${plan.sessions.length > 1 ? t.assistantPreview.sessions : t.assistantPreview.session} · ${totalExercises} ${totalExercises > 1 ? t.assistantPreview.exercises : t.assistantPreview.exercise}`
    : ''

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t.assistant.generating}</Text>
        </View>
      ) : plan ? (
        <>
          <Text style={styles.label}>{t.assistantPreview.nameLabel}</Text>
          <TextInput
            style={styles.nameInput}
            value={editableName}
            onChangeText={setEditableName}
            placeholder={t.assistantPreview.namePlaceholder}
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.summary}>{summary}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {plan.sessions.map((session, si) => (
              <View key={`${si}-${session.name}`} style={styles.sessionCard}>
                <Text style={styles.sessionName}>{session.name}</Text>
                {session.exercises.map((ex, ei) => {
                  const setsInfo = formatExerciseSets(ex, t.assistantPreview.setsPlural)
                  return (
                    <View key={`${ei}-${ex.exerciseName}`} style={styles.exerciseRow}>
                      <Text style={styles.exerciseName} numberOfLines={1}>
                        {'• '}{ex.exerciseName}
                      </Text>
                      {setsInfo ? <Text style={styles.exerciseSets}>{setsInfo}</Text> : null}
                    </View>
                  )
                })}
              </View>
            ))}
          </ScrollView>

          {fallbackNotice ? (
            <Text style={styles.fallbackNotice}>{fallbackNotice}</Text>
          ) : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.modifyButton} onPress={handleModify}>
              <Text style={styles.modifyButtonText}>{t.assistantPreview.modify}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.validateButton, isSaving && styles.disabledButton]}
              onPress={handleValidate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={styles.validateButtonText}>{t.assistantPreview.validate}</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.md,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
    },
    label: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginBottom: spacing.xs,
    },
    nameInput: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      color: colors.text,
      fontSize: fontSize.md,
      marginBottom: spacing.md,
    },
    scrollView: {
      flex: 1,
      marginBottom: spacing.md,
    },
    summary: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginBottom: spacing.md,
    },
    sessionCard: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    sessionName: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    exerciseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    exerciseName: {
      color: colors.text,
      fontSize: fontSize.sm,
      flex: 1,
      marginRight: spacing.sm,
    },
    exerciseSets: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    fallbackNotice: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    modifyButton: {
      flex: 1,
      backgroundColor: colors.secondaryButton,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    modifyButtonText: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    validateButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    validateButtonText: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
  }), [colors])
}
