import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { importGeneratedPlan, importGeneratedSession } from '../model/utils/databaseHelpers'
import { useHaptics } from '../hooks/useHaptics'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { spacing, fontSize, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'
import type { RootStackParamList } from '../navigation/index'
import type { GeneratedSession } from '../services/ai/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssistantPreview'>
  route: RouteProp<RootStackParamList, 'AssistantPreview'>
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function AssistantPreviewScreen({ navigation, route }: Props) {
  const { plan, mode, targetProgramId } = route.params
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const { t } = useLanguage()

  const [programName, setProgramName] = useState(plan.name)
  const [isSaving, setIsSaving] = useState(false)

  const handleModify = useCallback(() => {
    haptics.onPress()
    navigation.goBack()
  }, [haptics, navigation])

  const handleValidate = useCallback(async () => {
    haptics.onSuccess()
    setIsSaving(true)
    try {
      const planToSave = { ...plan, name: programName.trim() || plan.name }
      if (mode === 'program') {
        await importGeneratedPlan(planToSave)
        navigation.navigate('Programs')
      } else {
        if (!targetProgramId || !plan.sessions.length) return
        await importGeneratedSession(plan.sessions[0], targetProgramId)
        navigation.navigate('ProgramDetail', { programId: targetProgramId })
      }
    } catch (e) {
      if (__DEV__) console.error('[AssistantPreview] handleValidate:', e)
    } finally {
      setIsSaving(false)
    }
  }, [haptics, plan, programName, mode, targetProgramId, navigation])

  const totalExercises = plan.sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0,
  )

  return (
    <View style={styles.container}>
      {/* ── Nom du programme ── */}
      <View style={styles.nameRow}>
        <TextInput
          style={styles.nameInput}
          value={programName}
          onChangeText={setProgramName}
          placeholder={t.assistantPreview.programNamePlaceholder}
          placeholderTextColor={colors.textSecondary}
          maxLength={60}
        />
      </View>

      {/* ── Résumé ── */}
      <Text style={styles.summary}>
        {plan.sessions.length} {plan.sessions.length > 1 ? t.assistantPreview.sessions : t.assistantPreview.session} · {totalExercises} {totalExercises > 1 ? t.assistantPreview.exercises : t.assistantPreview.exercise}
      </Text>

      {/* ── Liste des séances ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {plan.sessions.map((session: GeneratedSession, sIdx: number) => (
          <View key={sIdx} style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{session.name}</Text>
            {session.exercises.map((ex, eIdx) => (
              <View key={eIdx} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                <Text style={styles.exerciseSets}>
                  {ex.setsTarget} {ex.setsTarget > 1 ? t.assistantPreview.setsPlural : t.assistantPreview.sets} × {ex.repsTarget} reps
                </Text>
                {ex.restSeconds !== undefined && ex.restSeconds > 0 && (
                  <Text style={styles.exerciseRest}>{t.assistantPreview.rest} : {ex.restSeconds}s</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ── Boutons sticky ── */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleModify} disabled={isSaving}>
          <Text style={styles.btnSecondaryText}>{t.assistantPreview.modify}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary, isSaving && styles.btnDisabled]} onPress={handleValidate} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.btnPrimaryText}>{t.assistantPreview.validate}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── Nom ─────────────────────────────────────────────────────────────────
    nameRow: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    nameInput: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: '600',
    },

    // ── Résumé ──────────────────────────────────────────────────────────────
    summary: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },

    // ── Scroll ──────────────────────────────────────────────────────────────
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },

    // ── Séance ──────────────────────────────────────────────────────────────
    sessionCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    sessionTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },

    // ── Exercice ────────────────────────────────────────────────────────────
    exerciseRow: {
      paddingVertical: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.background,
    },
    exerciseName: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    exerciseSets: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginTop: 2,
    },
    exerciseRest: {
      color: colors.textSecondary,
      fontSize: fontSize.caption,
      marginTop: 2,
    },

    // ── Boutons bottom ───────────────────────────────────────────────────────
    bottomRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.card,
    },
    btn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimary: {
      backgroundColor: colors.primary,
    },
    btnSecondary: {
      backgroundColor: colors.card,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnPrimaryText: {
      color: colors.primaryText,
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    btnSecondaryText: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
  }), [colors])
}
