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
import { useModalState } from '../hooks/useModalState'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import type Program from '../model/models/Program'
import type User from '../model/models/User'
import type { AIFormData, AIGoal, AILevel, AIDuration, GeneratedPlan } from '../services/ai/types'
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

type WizardStepKind = 'single' | 'multi' | 'programs'

interface WizardStep {
  id: string
  field: keyof AIFormData
  question: string
  kind: WizardStepKind
  options?: StepOption[]
}

interface ChatMsg {
  id: string
  role: 'ai' | 'user'
  text: string
}

type ChatStepId =
  | 'goal'
  | 'level'
  | 'equipment'
  | 'duration'
  | 'mode'
  | 'daysPerWeek'
  | 'muscleGroup'
  | 'targetProgram'
  | 'done'

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

const PROVIDER_LABELS: Record<string, string> = {
  offline: 'Offline',
  claude:  'Claude',
  openai:  'OpenAI',
  gemini:  'Gemini',
}

const PROVIDER_DISPLAY: Record<string, string> = {
  claude: 'Claude',
  openai: 'GPT-4o',
  gemini: 'Gemini',
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
    steps.push({ id: 'muscle',        field: 'muscleGroup',    question: 'Quel groupe musculaire ?', kind: 'single',   options: MUSCLE_OPTIONS })
    steps.push({ id: 'targetProgram', field: 'targetProgramId', question: 'Dans quel programme ?',  kind: 'programs'                           })
  } else {
    steps.push({ id: 'days', field: 'daysPerWeek', question: 'Combien de jours par semaine ?', kind: 'single', options: DAYS_OPTIONS })
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
  const [formData, setFormData]           = useState<Partial<AIFormData>>({ equipment: [] })
  const [isGenerating, setIsGenerating]   = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)

  const progressAnim = useRef(new Animated.Value(0)).current

  // ── Chat state ────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatStep, setChatStep]         = useState<ChatStepId>('goal')
  const [chatFormData, setChatFormData] = useState<Partial<AIFormData>>({ equipment: [] })
  const chatScrollRef                   = useRef<ScrollView>(null)
  const chatInitRef                     = useRef(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const isConnectedMode = user?.aiProvider !== 'offline' && user?.aiProvider !== undefined
  const providerName    = PROVIDER_DISPLAY[user?.aiProvider ?? ''] ?? "l'IA"
  const providerLabel   = PROVIDER_LABELS[user?.aiProvider ?? 'offline'] ?? 'Offline'

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

  // ── Chat init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConnectedMode || chatInitRef.current) return
    chatInitRef.current = true
    setChatMessages([{
      id: 'init-0',
      role: 'ai',
      text: `Bonjour ! Je suis ${providerName}, ton assistant sportif. 💪\nQuelle est ton ambition ?`,
    }])
  }, [isConnectedMode, providerName])

  // ── Chat scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    if (chatMessages.length === 0) return
    const timer = setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true })
    }, 100)
    return () => clearTimeout(timer)
  }, [chatMessages])

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
      setCurrentStep(prev => prev + 1)
    }
  }, [formData, currentStep, haptics, triggerGenerate])

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

  const handleEquipmentNext = useCallback(() => {
    haptics.onPress()
    const currentSteps = buildSteps(formData)
    if (currentStep === currentSteps.length - 1) {
      triggerGenerate(formData as AIFormData)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [formData, currentStep, haptics, triggerGenerate])

  const handleBack = useCallback(() => {
    if (currentStep === 0) return
    setCurrentStep(prev => prev - 1)
  }, [currentStep])

  // ─── Chat handlers ────────────────────────────────────────────────────────

  const toggleChatEquipment = useCallback((item: string) => {
    haptics.onSelect()
    setChatFormData(prev => {
      const eq = prev.equipment ?? []
      return {
        ...prev,
        equipment: eq.includes(item) ? eq.filter(e => e !== item) : [...eq, item],
      }
    })
  }, [haptics])

  const handleChatSelect = useCallback((field: keyof AIFormData, value: FormValue, userLabel: string) => {
    haptics.onSelect()

    const newFormData: Partial<AIFormData> = { ...chatFormData, [field]: value }
    setChatFormData(newFormData)

    const userMsg: ChatMsg = { id: `${Date.now()}-u`, role: 'user', text: userLabel }

    let nextStep: ChatStepId
    let aiText: string

    switch (field) {
      case 'goal':
        nextStep = 'level'
        aiText = "Super choix ! Quel est ton niveau d'entraînement ?"
        break
      case 'level':
        nextStep = 'equipment'
        aiText = 'De quel équipement disposes-tu ? (plusieurs choix possibles)'
        break
      case 'durationMin':
        nextStep = 'mode'
        aiText = "Tu veux un programme sur plusieurs semaines ou une séance pour aujourd'hui ?"
        break
      case 'mode':
        if (value === 'program') {
          nextStep = 'daysPerWeek'
          aiText = "Combien de jours par semaine tu t'entraînes ?"
        } else {
          nextStep = 'muscleGroup'
          aiText = 'Quel groupe musculaire ?'
        }
        break
      case 'daysPerWeek':
        nextStep = 'done'
        aiText = 'Parfait ! Je génère ton programme... ✨'
        break
      case 'muscleGroup':
        nextStep = 'targetProgram'
        aiText = programs.length === 0
          ? "Aucun programme disponible. Crée d'abord un programme dans l'onglet Accueil."
          : 'Dans quel programme ajouter cette séance ?'
        break
      case 'targetProgramId':
        nextStep = 'done'
        aiText = 'Parfait ! Je génère ton programme... ✨'
        break
      default:
        nextStep = 'done'
        aiText = 'Parfait ! Je génère ton programme... ✨'
    }

    const aiMsg: ChatMsg = { id: `${Date.now() + 1}-a`, role: 'ai', text: aiText }
    setChatMessages(prev => [...prev, userMsg, aiMsg])
    setChatStep(nextStep)

    if (nextStep === 'done') {
      // Sync formData so handleValidate has correct mode/targetProgramId
      setFormData(newFormData)
      triggerGenerate(newFormData as AIFormData)
    }
  }, [chatFormData, haptics, triggerGenerate, programs.length])

  const handleEquipmentChatNext = useCallback(() => {
    haptics.onPress()
    const eq    = chatFormData.equipment ?? []
    const label = eq.length > 0 ? eq.join(', ') : 'Aucun équipement'
    const userMsg: ChatMsg = { id: `${Date.now()}-u`,     role: 'user', text: label }
    const aiMsg: ChatMsg   = { id: `${Date.now() + 1}-a`, role: 'ai',  text: 'Combien de temps par séance ?' }
    setChatMessages(prev => [...prev, userMsg, aiMsg])
    setChatStep('duration')
  }, [chatFormData.equipment, haptics])

  // ─── Preview actions ──────────────────────────────────────────────────────

  const handleModify = useCallback(() => {
    previewModal.close()
    setGeneratedPlan(null)

    if (isConnectedMode) {
      const greeting = `Bonjour ! Je suis ${providerName}, ton assistant sportif. 💪\nQuelle est ton ambition ?`
      setChatStep('goal')
      setChatFormData({ equipment: [] })
      setChatMessages([{ id: `${Date.now()}-init`, role: 'ai', text: greeting }])
    } else {
      setCurrentStep(0)
      setFormData({ equipment: [] })
    }
  }, [previewModal, isConnectedMode, providerName])

  const handleValidate = useCallback(async (plan: GeneratedPlan) => {
    const currentMode            = formData.mode ?? 'program'
    const currentTargetProgramId = formData.targetProgramId
    try {
      if (currentMode === 'program') {
        await importGeneratedPlan(plan)
        previewModal.close()
        navigation.navigate('Home')
      } else {
        if (!currentTargetProgramId) return
        if (!plan.sessions.length) { previewModal.close(); return }
        const session = await importGeneratedSession(plan.sessions[0], currentTargetProgramId)
        previewModal.close()
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

  // ─── Chat options renderer ────────────────────────────────────────────────

  const renderChatOptions = (): React.ReactElement | null => {
    if (chatStep === 'done') return null

    const renderSingleChips = (options: StepOption[], field: keyof AIFormData) => (
      <View style={styles.chatChipsWrap}>
        {options.map(opt => (
          <TouchableOpacity
            key={String(opt.value)}
            style={styles.chatChip}
            onPress={() => handleChatSelect(field, opt.value, `${opt.icon ? opt.icon + ' ' : ''}${opt.label}`)}
          >
            {opt.icon !== undefined && <Text style={styles.chatChipIcon}>{opt.icon}</Text>}
            <Text style={styles.chatChipText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )

    switch (chatStep) {
      case 'goal':        return renderSingleChips(GOAL_OPTIONS, 'goal')
      case 'level':       return renderSingleChips(LEVEL_OPTIONS, 'level')
      case 'duration':    return renderSingleChips(DURATION_OPTIONS, 'durationMin')
      case 'mode':        return renderSingleChips(MODE_OPTIONS, 'mode')
      case 'daysPerWeek': return renderSingleChips(DAYS_OPTIONS, 'daysPerWeek')
      case 'muscleGroup': return renderSingleChips(MUSCLE_OPTIONS, 'muscleGroup')

      case 'equipment': {
        const selected     = chatFormData.equipment ?? []
        const hasSelection = selected.length > 0
        return (
          <View>
            <View style={styles.chatChipsWrap}>
              {EQUIPMENT_OPTIONS.map(eq => {
                const isSelected = selected.includes(eq)
                return (
                  <TouchableOpacity
                    key={eq}
                    style={[styles.chatChip, isSelected && styles.chatChipActive]}
                    onPress={() => toggleChatEquipment(eq)}
                  >
                    <Text style={[styles.chatChipText, isSelected && styles.chatChipTextActive]}>{eq}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <TouchableOpacity
              style={[styles.chatNextBtn, !hasSelection && styles.chatNextBtnDisabled]}
              disabled={!hasSelection}
              onPress={handleEquipmentChatNext}
            >
              <Text style={styles.chatNextBtnText}>C'est tout !</Text>
            </TouchableOpacity>
          </View>
        )
      }

      case 'targetProgram': {
        if (programs.length === 0) return null
        return (
          <View style={styles.chatChipsWrap}>
            {programs.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.chatChip}
                onPress={() => handleChatSelect('targetProgramId', p.id, p.name)}
              >
                <Text style={styles.chatChipIcon}>📋</Text>
                <Text style={styles.chatChipText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      }

      default: return null
    }
  }

  // ─── Chat UI ──────────────────────────────────────────────────────────────

  const renderChatUI = () => (
    <View style={styles.chatContainer}>
      <ScrollView
        ref={chatScrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {chatMessages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.chatMsgRow,
              msg.role === 'user' ? styles.chatMsgRowUser : styles.chatMsgRowAi,
            ]}
          >
            {msg.role === 'ai' && (
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>🤖</Text>
              </View>
            )}
            <View style={[
              styles.chatBubble,
              msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi,
            ]}>
              <Text style={styles.chatBubbleText}>{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {chatStep !== 'done' && (
        <View style={styles.chatOptionsZone}>
          {renderChatOptions()}
        </View>
      )}
    </View>
  )

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {isConnectedMode ? (
        renderChatUI()
      ) : (
        <>
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

          {/* ── Header : retour + compteur ── */}
          <View style={styles.header}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>←</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtnPlaceholder} />
            )}
            <Text style={styles.stepCounter}>{currentStep + 1} / {totalSteps}</Text>
            <View style={styles.backBtnPlaceholder} />
          </View>

          {/* ── Contenu ── */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.question}>{step?.question}</Text>
            {renderStepContent()}
          </ScrollView>

          {/* ── Provider hint ── */}
          <Text style={styles.providerHint}>
            {providerLabel}
            {providerLabel === 'Offline' ? ' — configure une clé API dans Paramètres pour booster' : ''}
          </Text>
        </>
      )}

      {/* ── Preview sheet ── */}
      <AssistantPreviewSheet
        visible={previewModal.isOpen}
        plan={generatedPlan}
        isLoading={isGenerating}
        onClose={previewModal.close}
        onModify={handleModify}
        onValidate={handleValidate}
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

  // ── Progress (wizard) ───────────────────────────────────────────────────
  progressTrack: {
    height: 3,
    backgroundColor: colors.card,
    width: '100%',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },

  // ── Header (wizard) ─────────────────────────────────────────────────────
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
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  // ── Scroll (wizard) ─────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // ── Question (wizard) ───────────────────────────────────────────────────
  question: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
    lineHeight: 34,
  },

  // ── Options single-choice (wizard) ──────────────────────────────────────
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

  // ── Chips multi-select (wizard) ─────────────────────────────────────────
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

  // ── Bouton Suivant (wizard multi-select) ────────────────────────────────
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

  // ── Empty state (wizard) ────────────────────────────────────────────────
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

  // ── Provider hint (wizard) ──────────────────────────────────────────────
  providerHint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  // ── Chat container ──────────────────────────────────────────────────────
  chatContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // ── Chat message row ────────────────────────────────────────────────────
  chatMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  chatMsgRowAi: {
    justifyContent: 'flex-start',
  },
  chatMsgRowUser: {
    justifyContent: 'flex-end',
  },

  // ── Chat avatar (IA) ────────────────────────────────────────────────────
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  chatAvatarText: {
    fontSize: 16,
  },

  // ── Chat bubble ─────────────────────────────────────────────────────────
  chatBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: spacing.md,
  },
  chatBubbleAi: {
    backgroundColor: colors.card,
  },
  chatBubbleUser: {
    backgroundColor: colors.primary,
  },
  chatBubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },

  // ── Chat options zone (bas d'écran) ─────────────────────────────────────
  chatOptionsZone: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    backgroundColor: colors.background,
  },

  // ── Chat chips ──────────────────────────────────────────────────────────
  chatChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chatChipActive: {
    borderColor: colors.primary,
  },
  chatChipIcon: {
    fontSize: 14,
  },
  chatChipText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  chatChipTextActive: {
    color: colors.text,
    fontWeight: '700',
  },

  // ── Chat "C'est tout !" button ──────────────────────────────────────────
  chatNextBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chatNextBtnDisabled: {
    opacity: 0.4,
  },
  chatNextBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
})
