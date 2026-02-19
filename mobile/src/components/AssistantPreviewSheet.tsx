import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import type { GeneratedPlan } from '../services/ai/types'

interface AssistantPreviewSheetProps {
  visible: boolean
  plan: GeneratedPlan | null
  isLoading: boolean
  mode: 'program' | 'session'
  onClose: () => void
  onModify: () => void
  onValidate: (plan: GeneratedPlan) => Promise<void>
}

export const AssistantPreviewSheet: React.FC<AssistantPreviewSheetProps> = ({
  visible,
  plan,
  isLoading,
  mode,
  onClose,
  onModify,
  onValidate,
}) => {
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

  const title = mode === 'program' ? 'Programme généré' : 'Séance générée'

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Génération en cours...</Text>
        </View>
      ) : plan ? (
        <>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.nameInput}
            value={editableName}
            onChangeText={setEditableName}
            placeholder="Nom du programme ou de la séance"
            placeholderTextColor={colors.textSecondary}
          />

          {(() => {
            const totalExercises = plan.sessions.reduce((acc, s) => acc + s.exercises.length, 0)
            const summary = `${plan.sessions.length} séance${plan.sessions.length > 1 ? 's' : ''} · ${totalExercises} exercice${totalExercises > 1 ? 's' : ''}`
            return <Text style={styles.summary}>{summary}</Text>
          })()}

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {plan.sessions.map((session, si) => (
              <View key={`${si}-${session.name}`} style={styles.sessionCard}>
                <Text style={styles.sessionName}>{session.name}</Text>
                {session.exercises.map((ex, ei) => (
                  <View key={`${ei}-${ex.exerciseName}`} style={styles.exerciseRow}>
                    <Text style={styles.exerciseName} numberOfLines={1}>
                      {ex.exerciseName}
                    </Text>
                    <Text style={styles.exerciseSets}>
                      {ex.setsTarget}×{ex.repsTarget}{ex.weightTarget > 0 ? `  ·  ~${ex.weightTarget} kg` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.modifyButton} onPress={handleModify}>
              <Text style={styles.modifyButtonText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.validateButton, isSaving && styles.disabledButton]}
              onPress={handleValidate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={styles.validateButtonText}>Valider</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
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
  sessionCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sessionName: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  summary: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
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
})
