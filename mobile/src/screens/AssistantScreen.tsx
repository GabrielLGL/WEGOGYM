import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Alert, ScrollView,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { database } from '../model'
import { generatePlan } from '../services/ai/aiService'
import { importGeneratedPlan, importGeneratedSession } from '../model/utils/databaseHelpers'
import { AssistantPreviewSheet } from '../components/AssistantPreviewSheet'
import { AlertDialog } from '../components/AlertDialog'
import { useModalState } from '../hooks/useModalState'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import type Program from '../model/models/Program'
import type User from '../model/models/User'
import type { AIFormData, AIGoal, AILevel, AIDuration, AISplit, GeneratedPlan } from '../services/ai/types'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NavigationProp } from '@react-navigation/native'
import type { MainTabParamList, RootStackParamList } from '../navigation/index'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValue = string | number | string[]

interface StepOption {
  value: string | number
  label: string
  sub?: string
  icon?: string
}

type WizardStepKind = 'single' | 'multi' | 'programs' | 'multi-focus'

interface WizardStep {
  id: string
  field: keyof AIFormData
  question: string
  kind: WizardStepKind
  options?: StepOption[]
}

// ─── Options ──────────────────────────────────────────────────────────────────

const MODE_OPTIONS: StepOption[] = [
  { value: 'program', label: 'Programme complet', sub: 'Plusieurs séances structurées', icon: '📅' },
  { value: 'session', label: 'Séance du jour', sub: "Une session pour aujourd'hui", icon: '⚡' },
]

const GOAL_OPTIONS: StepOption[] = [
  { value: 'bodybuilding', label: 'Bodybuilding', icon: '💪' },
  { value: 'power',        label: 'Power',        icon: '🏋️' },
  { value: 'renfo',        label: 'Renfo',        icon: '🔥' },
  { value: 'cardio',       label: 'Cardio',       icon: '🏃' },
]

const LEVEL_OPTIONS: StepOption[] = [
  { value: 'débutant',      label: 'Débutant',      icon: '🌱' },
  { value: 'intermédiaire', label: 'Intermédiaire', icon: '📈' },
  { value: 'avancé',        label: 'Avancé',        icon: '🔝' },
]

const EQUIPMENT_OPTIONS = ['Poids du corps', 'Haltères', 'Barre & disques', 'Machines']

const DURATION_OPTIONS: StepOption[] = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
]

const DAYS_OPTIONS: StepOption[] = [
  { value: 2, label: '2j' },
  { value: 3, label: '3j' },
  { value: 4, label: '4j' },
  { value: 5, label: '5j' },
  { value: 6, label: '6j' },
]

const MUSCLE_OPTIONS: StepOption[] = [
  { value: 'Pecs',       label: 'Pecs'       },
  { value: 'Dos',        label: 'Dos'        },
  { value: 'Quadriceps', label: 'Quadriceps' },
  { value: 'Ischios',    label: 'Ischios'    },
  { value: 'Epaules',    label: 'Epaules'    },
  { value: 'Biceps',     label: 'Biceps'     },
  { value: 'Triceps',    label: 'Triceps'    },
  { value: 'Abdos',      label: 'Abdos'      },
  { value: 'Full Body',  label: 'Full Body'  },
]

const SPLIT_OPTIONS: StepOption[] = [
  { value: 'auto',       label: 'Automatique',  sub: "L'IA choisit selon tes jours",  icon: '🔄' },
  { value: 'fullbody',   label: 'Full Body',     sub: 'Tout le corps à chaque séance', icon: '💪' },
  { value: 'upperlower', label: 'Upper / Lower', sub: 'Haut du corps / Bas du corps',  icon: '↕️' },
  { value: 'ppl',        label: 'PPL',           sub: 'Push · Pull · Legs',            icon: '🔁' },
]

const MUSCLES_FOCUS_OPTIONS = ['Équilibré', 'Pecs', 'Dos', 'Épaules', 'Bras', 'Jambes', 'Abdos']

const PROVIDER_LABELS: Record<string, string> = {
  offline: 'Offline',
  claude:  'Claude',
  openai:  'GPT-4o',
  gemini:  'Gemini',
}

// ─── buildSteps ───────────────────────────────────────────────────────────────

function buildSteps(data: Partial<AIFormData>): WizardStep[] {
  const steps: WizardStep[] = [
    { id: 'mode',      field: 'mode',        question: 'Que veux-tu générer ?',          kind: 'single', options: MODE_OPTIONS      },
    { id: 'goal',      field: 'goal',        question: 'Quel est ton objectif ?',         kind: 'single', options: GOAL_OPTIONS      },
    { id: 'level',     field: 'level',       question: 'Quel est ton niveau ?',           kind: 'single', options: LEVEL_OPTIONS     },
    { id: 'equipment', field: 'equipment',   question: 'Quel équipement as-tu ?',         kind: 'multi'                               },
    { id: 'duration',  field: 'durationMin', question: 'Combien de temps par séance ?',   kind: 'single', options: DURATION_OPTIONS  },
  ]

  if (data.mode === 'session') {
    steps.push({ id: 'muscle',        field: 'muscleGroup',     question: 'Quel groupe musculaire ?', kind: 'single',   options: MUSCLE_OPTIONS })
    steps.push({ id: 'targetProgram', field: 'targetProgramId', question: 'Dans quel programme ?',   kind: 'programs'                           })
  } else {
    steps.push({ id: 'days', field: 'daysPerWeek', question: 'Combien de jours par semaine ?', kind: 'single', options: DAYS_OPTIONS })
    steps.push({
      id: 'split',
      field: 'split',
      question: 'Quel style de programme ?',
      kind: 'single',
      options: SPLIT_OPTIONS,
    })
    steps.push({
      id: 'musclesFocus',
      field: 'musclesFocus',
      question: 'Sur quels muscles veux-tu progresser ?',
      kind: 'multi-focus',
    })
  }

  return steps
}

// ─── Composant interne ────────────────────────────────────────────────────────

interface AssistantScreenInnerProps {
  programs: Program[]
  user: User | null
  navigation: BottomTabScreenProps<MainTabParamList, 'Assistant'>['navigation']
}

function AssistantScreenInner({ programs, user, navigation }: AssistantScreenInnerProps) {
  const haptics      = useHaptics()
  const previewModal = useModalState()

  // ── Wizard state ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep]     = useState(0)
  const [formData, setFormData]           = useState<Partial<AIFormData>>({ equipment: [], musclesFocus: [] })
  const [isGenerating, setIsGenerating]         = useState(false)
  const [generatedPlan, setGeneratedPlan]       = useState<GeneratedPlan | null>(null)
  const [isResetAlertVisible, setIsResetAlertVisible] = useState(false)

  const progressAnim = useRef(new Animated.Value(0)).current
  const contentAnim  = useRef(new Animated.Value(1)).current

  // ── Derived ───────────────────────────────────────────────────────────────
  // Réactif via withObservables — mise à jour depuis les settings uniquement
  const providerLabel = PROVIDER_LABELS[user?.aiProvider ?? 'offline'] ?? 'Offline'

  const steps      = buildSteps(formData)
  const totalSteps = steps.length
  const step       = steps[currentStep]

  // ── Wizard progress animation ─────────────────────────────────────────────
  useEffect(() => {
    const progress = totalSteps > 1 ? currentStep / (totalSteps - 1) : 0
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 250,
      useNativeDriver: false,
    }).start()
  }, [currentStep, totalSteps, progressAnim])

  // ── Transition fade entre étapes ─────────────────────────────────────────
  const goToStep = useCallback((nextIndex: number) => {
    Animated.timing(contentAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(nextIndex)
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start()
    })
  }, [contentAnim])

  // ─── Génération ───────────────────────────────────────────────────────────

  const triggerGenerate = useCallback(async (data: AIFormData) => {
    haptics.onPress()
    setIsGenerating(true)
    previewModal.open()
    try {
      const plan = await generatePlan(data, user)
      setGeneratedPlan(plan)
    } catch {
      previewModal.close()
      Alert.alert('Erreur', 'Impossible de générer le plan. Réessaie.')
    } finally {
      setIsGenerating(false)
    }
  }, [user, haptics, previewModal])

  // ─── Navigation wizard ────────────────────────────────────────────────────

  const handleSelect = useCallback((field: keyof AIFormData, value: FormValue) => {
    const newData: Partial<AIFormData> = { ...formData, [field]: value }
    setFormData(newData)
    haptics.onSelect()

    const currentSteps = buildSteps(newData)
    if (currentStep === currentSteps.length - 1) {
      triggerGenerate(newData as AIFormData)
    } else {
      goToStep(currentStep + 1)
    }
  }, [formData, currentStep, haptics, triggerGenerate, goToStep])

  const toggleEquipment = useCallback((item: string) => {
    haptics.onSelect()
    setFormData(prev => {
      const eq = prev.equipment ?? []
      return {
        ...prev,
        equipment: eq.includes(item) ? eq.filter(e => e !== item) : [...eq, item],
      }
    })
  }, [haptics])

  const toggleMusclesFocus = useCallback((muscle: string) => {
    haptics.onSelect()
    setFormData(prev => {
      const current = prev.musclesFocus ?? []
      if (muscle === 'Équilibré') {
        return { ...prev, musclesFocus: [] }
      }
      const isSelected = current.includes(muscle)
      const next = isSelected
        ? current.filter(m => m !== muscle)
        : [...current, muscle]
      return { ...prev, musclesFocus: next }
    })
  }, [haptics])

  const handleEquipmentNext = useCallback(() => {
    haptics.onPress()
    const currentSteps = buildSteps(formData)
    if (currentStep === currentSteps.length - 1) {
      triggerGenerate(formData as AIFormData)
    } else {
      goToStep(currentStep + 1)
    }
  }, [formData, currentStep, haptics, triggerGenerate, goToStep])

  const handleBack = useCallback(() => {
    if (currentStep === 0) return
    goToStep(currentStep - 1)
  }, [currentStep, goToStep])

  const handleReset = useCallback(() => {
    haptics.onDelete()
    setIsResetAlertVisible(false)
    setFormData({ equipment: [], musclesFocus: [] })
    setCurrentStep(0)
    contentAnim.setValue(1)
  }, [haptics, contentAnim])

  const handleResetRequest = useCallback(() => {
    if (currentStep > 2) {
      haptics.onPress()
      setIsResetAlertVisible(true)
    } else {
      haptics.onDelete()
      setFormData({ equipment: [], musclesFocus: [] })
      setCurrentStep(0)
      contentAnim.setValue(1)
    }
  }, [currentStep, haptics, contentAnim])

  // ─── Preview actions ──────────────────────────────────────────────────────

  const handleModify = useCallback(() => {
    previewModal.close()
    setGeneratedPlan(null)
    setCurrentStep(0)
    setFormData({ equipment: [], musclesFocus: [] })
  }, [previewModal])

  const handleValidate = useCallback(async (plan: GeneratedPlan) => {
    const currentMode            = formData.mode ?? 'program'
    const currentTargetProgramId = formData.targetProgramId
    try {
      if (currentMode === 'program') {
        await importGeneratedPlan(plan)
        previewModal.close()
        setCurrentStep(0)
        setFormData({ equipment: [], musclesFocus: [] })
        setGeneratedPlan(null)
        contentAnim.setValue(1)
        navigation.navigate('Home')
      } else {
        if (!currentTargetProgramId) return
        if (!plan.sessions.length) { previewModal.close(); return }
        const session = await importGeneratedSession(plan.sessions[0], currentTargetProgramId)
        previewModal.close()
        setCurrentStep(0)
        setFormData({ equipment: [], musclesFocus: [] })
        setGeneratedPlan(null)
        contentAnim.setValue(1)
        ;(navigation.getParent() as NavigationProp<RootStackParamList> | undefined)
          ?.navigate('SessionDetail', { sessionId: session.id })
      }
    } catch {
      previewModal.close()
      Alert.alert('Erreur', "Impossible d'enregistrer le plan. Réessaie.")
    }
  }, [formData.mode, formData.targetProgramId, navigation, previewModal])

  // ─── Rendu du step courant (wizard) ──────────────────────────────────────

  const renderStepContent = () => {
    if (!step) return null

    if (step.kind === 'multi') {
      const selected     = formData.equipment ?? []
      const hasSelection = selected.length > 0
      return (
        <View>
          <View style={styles.chipsWrap}>
            {EQUIPMENT_OPTIONS.map(eq => {
              const isSelected = selected.includes(eq)
              return (
                <TouchableOpacity
                  key={eq}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleEquipment(eq)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{eq}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, !hasSelection && styles.nextBtnDisabled]}
            disabled={!hasSelection}
            onPress={handleEquipmentNext}
          >
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (step.kind === 'multi-focus') {
      const selected   = formData.musclesFocus ?? []
      const isEquilibre = selected.length === 0
      return (
        <View>
          <View style={styles.chipsWrap}>
            {MUSCLES_FOCUS_OPTIONS.map(muscle => {
              const isActive = muscle === 'Équilibré' ? isEquilibre : selected.includes(muscle)
              return (
                <TouchableOpacity
                  key={muscle}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => toggleMusclesFocus(muscle)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {muscle}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleEquipmentNext}
          >
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (step.kind === 'programs') {
      if (programs.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun programme disponible.{'\n'}Crée d'abord un programme dans l'onglet Accueil.
            </Text>
          </View>
        )
      }
      return (
        <View style={styles.optionsList}>
          {programs.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.optionCard}
              onPress={() => handleSelect('targetProgramId', p.id)}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>📋</Text>
                <Text style={styles.optionLabel}>{p.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
              onPress={() => handleSelect(step.field, opt.value)}
            >
              <View style={styles.optionRow}>
                {opt.icon !== undefined && (
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
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

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Barre de progression ── */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange:  [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* ── Header : retour + compteur + badge provider ── */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}
        <Text style={styles.stepCounter}>{currentStep + 1} / {totalSteps}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {providerLabel === 'Offline' ? '🔌' : '⚡'} {providerLabel}
          </Text>
        </View>
      </View>

      {/* ── Contenu ── */}
      <Animated.View style={[styles.contentWrapper, { opacity: contentAnim }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.question}>{step?.question}</Text>
          {renderStepContent()}
        </ScrollView>
      </Animated.View>

      {/* ── Bouton recommencer ── */}
      {currentStep > 0 && (
        <TouchableOpacity style={styles.resetFooterBtn} onPress={handleResetRequest}>
          <Text style={styles.resetFooterBtnText}>Recommencer</Text>
        </TouchableOpacity>
      )}

      {/* ── Preview sheet ── */}
      <AssistantPreviewSheet
        visible={previewModal.isOpen}
        plan={generatedPlan}
        isLoading={isGenerating}
        mode={formData.mode === 'session' ? 'session' : 'program'}
        onClose={previewModal.close}
        onModify={handleModify}
        onValidate={handleValidate}
      />

      <AlertDialog
        visible={isResetAlertVisible}
        title="Recommencer ?"
        message="Ta progression actuelle sera perdue."
        onConfirm={handleReset}
        onCancel={() => setIsResetAlertVisible(false)}
        confirmText="Recommencer"
        cancelText="Annuler"
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

const styles = StyleSheet.create({
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
  badgeText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
    lineHeight: 34,
  },

  // ── Options single-choice ────────────────────────────────────────────────
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
  optionIcon: {
    fontSize: 28,
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

  // ── Chips multi-select ───────────────────────────────────────────────────
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

  // ── Bouton Suivant ───────────────────────────────────────────────────────
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
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
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

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyContainer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
})
