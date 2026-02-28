import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { database } from '../model'
import { AlertDialog } from '../components/AlertDialog'
import { WizardStepContent } from '../components/WizardStepContent'
import { useAssistantWizard } from '../hooks/useAssistantWizard'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type Program from '../model/models/Program'
import type User from '../model/models/User'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../navigation/index'

// ─── Composant interne ────────────────────────────────────────────────────────

interface AssistantScreenInnerProps {
  programs: Program[]
  user: User | null
  navigation: NativeStackNavigationProp<RootStackParamList, 'Assistant'>
  route: RouteProp<RootStackParamList, 'Assistant'>
}

export function AssistantScreenInner({ programs: _programs, user, navigation, route }: AssistantScreenInnerProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const sessionMode = route.params?.sessionMode
  const wizard = useAssistantWizard({ user, sessionMode, navigation })

  return (
    <View style={styles.container}>
      {/* ── Barre de progression ── */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: wizard.progressAnim.interpolate({
                inputRange:  [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* ── Header : retour + compteur + badge provider ── */}
      <View style={styles.header}>
        {wizard.currentStep > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={wizard.handleBack}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}
        <Text style={styles.stepCounter}>{wizard.currentStep + 1} / {wizard.totalSteps}</Text>
        <View style={[styles.badge, styles.badgeContent]}>
          <Ionicons
            name={wizard.providerLabel === 'Offline' ? 'cloud-offline-outline' : 'flash-outline'}
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.badgeText}>{wizard.providerLabel}</Text>
        </View>
      </View>

      {/* ── Contenu ── */}
      {wizard.isGenerating ? (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.generatingText}>{t.assistant.generating}</Text>
        </View>
      ) : (
        <Animated.View style={[styles.contentWrapper, { opacity: wizard.contentAnim }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.question}>{wizard.step?.question}</Text>
            {wizard.step?.subtitle !== undefined && (
              <Text style={styles.stepSubtitle}>{wizard.step.subtitle}</Text>
            )}
            {wizard.step !== undefined && (
              <WizardStepContent
                step={wizard.step}
                formData={wizard.formData}
                equipmentOptions={wizard.equipmentOptions}
                muscleOptions={wizard.muscleOptions}
                musclesFocusOptions={wizard.musclesFocusOptions}
                injuriesOptions={wizard.injuriesOptions}
                onToggleEquipment={wizard.toggleEquipment}
                onToggleMusclesFocus={wizard.toggleMusclesFocus}
                onToggleMuscleGroup={wizard.toggleMuscleGroup}
                onToggleInjuries={wizard.toggleInjuries}
                onMultiNext={wizard.handleMultiNext}
                onSelect={wizard.handleSelect}
              />
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Bouton recommencer ── */}
      {wizard.currentStep > 0 && (
        <TouchableOpacity style={styles.resetFooterBtn} onPress={wizard.handleResetRequest}>
          <Text style={styles.resetFooterBtnText}>{t.assistant.restart}</Text>
        </TouchableOpacity>
      )}

      <AlertDialog
        visible={wizard.isResetAlertVisible}
        title={t.assistant.restartTitle}
        message={t.assistant.restartMessage}
        onConfirm={wizard.handleReset}
        onCancel={() => wizard.setIsResetAlertVisible(false)}
        confirmText={t.assistant.restart}
        cancelText={t.common.cancel}
      />

      <AlertDialog
        visible={wizard.errorAlertVisible}
        title={t.assistant.errorTitle}
        message={wizard.errorAlertMessage}
        onConfirm={() => wizard.setErrorAlertVisible(false)}
        onCancel={() => wizard.setErrorAlertVisible(false)}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        hideCancel
      />
    </View>
  )
}

// ─── withObservables — injecte programs et user ───────────────────────────────

export default withObservables([], () => ({
  programs: database.get<Program>('programs').query().observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(AssistantScreenInner)

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── Progress ────────────────────────────────────────────────────────────
    progressTrack: {
      height: 6,
      backgroundColor: colors.card,
      width: '100%',
    },
    progressFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.card,
    },
    backBtnText: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: '600',
    },
    backBtnPlaceholder: {
      width: 40,
      height: 40,
    },
    stepCounter: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
    },
    badgeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    badgeText: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },

    // ── Generating spinner ───────────────────────────────────────────────────
    generatingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    generatingText: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      fontWeight: '500',
    },

    // ── Content wrapper (fade animation) ────────────────────────────────────
    contentWrapper: {
      flex: 1,
    },

    // ── Scroll ──────────────────────────────────────────────────────────────
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
    },

    // ── Question ────────────────────────────────────────────────────────────
    question: {
      fontSize: fontSize.title,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      lineHeight: 34,
    },

    // ── Step subtitle ─────────────────────────────────────────────────────
    stepSubtitle: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginBottom: spacing.lg,
      lineHeight: 20,
    },

    // ── Bouton recommencer (footer) ──────────────────────────────────────────
    resetFooterBtn: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    resetFooterBtnText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '500',
    },
  })
}
