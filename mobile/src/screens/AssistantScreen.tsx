import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { database } from '../model'
import { generatePlan } from '../services/ai/aiService'
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import type Program from '../model/models/Program'
import type User from '../model/models/User'
import type { AIFormData, AIGoal, AILevel, AIDuration, AISplit } from '../services/ai/types'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/index'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValue = string | number | string[]

interface StepOption {
  value: string | number
  label: string
  sub?: string
  icon?: keyof typeof Ionicons.glyphMap
}

type WizardStepKind = 'single' | 'multi' | 'programs' | 'multi-focus' | 'multi-muscle' | 'multi-injuries'

interface WizardStep {
  id: string
  field: keyof AIFormData
  question: string
  kind: WizardStepKind
  options?: StepOption[]
}

// ─── Options ──────────────────────────────────────────────────────────────────

const MODE_OPTIONS: StepOption[] = [
  { value: 'program', label: 'Programme complet', sub: 'Plusieurs séances structurées', icon: 'calendar-outline' },
  { value: 'session', label: 'Séance du jour', sub: "Une session pour aujourd'hui", icon: 'flash-outline' },
]

const GOAL_OPTIONS: StepOption[] = [
  { value: 'bodybuilding', label: 'Bodybuilding', icon: 'body-outline' },
  { value: 'power',        label: 'Power',        icon: 'barbell-outline' },
  { value: 'renfo',        label: 'Renfo',        icon: 'flame-outline' },
  { value: 'cardio',       label: 'Cardio',       icon: 'walk-outline' },
]

const LEVEL_OPTIONS: StepOption[] = [
  { value: 'débutant',      label: 'Débutant',      icon: 'leaf-outline' },
  { value: 'intermédiaire', label: 'Intermédiaire', icon: 'trending-up-outline' },
  { value: 'avancé',        label: 'Avancé',        icon: 'rocket-outline' },
]

const EQUIPMENT_OPTIONS = ['Poids du corps', 'Haltères', 'Barre & disques', 'Machines']

const DURATION_OPTIONS: StepOption[] = [
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '2h' },
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
  { value: 'auto',       label: 'Automatique',       sub: "L'IA choisit selon tes jours",              icon: 'refresh-outline' },
  { value: 'fullbody',   label: 'Full Body',          sub: 'Tout le corps à chaque séance',             icon: 'grid-outline' },
  { value: 'upperlower', label: 'Upper / Lower',      sub: 'Haut du corps / Bas du corps',              icon: 'swap-vertical-outline' },
  { value: 'ppl',        label: 'PPL',                sub: 'Push · Pull · Legs',                        icon: 'repeat-outline' },
  { value: 'brosplit',   label: 'Bro Split',          sub: '1 groupe musculaire par séance',            icon: 'barbell-outline' },
  { value: 'arnold',     label: 'Arnold Split',       sub: 'Poitrine+Dos / Épaules+Bras / Jambes',      icon: 'star-outline' },
  { value: 'phul',       label: 'PHUL',               sub: 'Force + Hypertrophie sur 4 jours',          icon: 'flash-outline' },
  { value: 'fiveday',    label: '5 Jours',            sub: 'Poitrine / Dos / Épaules / Jambes / Bras',  icon: 'calendar-outline' },
  { value: 'pushpull',   label: 'Push / Pull',        sub: '2 jours alternés',                          icon: 'swap-horizontal-outline' },
  { value: 'fullbodyhi', label: 'Full Body Intensif', sub: '3 séances haute intensité',                 icon: 'flame-outline' },
]

const PHASE_OPTIONS: StepOption[] = [
  { value: 'prise_masse',    label: 'Prise de masse', sub: 'Surplus calorique, volume élevé'    },
  { value: 'seche',          label: 'Sèche',          sub: 'Déficit, maintien musculaire'        },
  { value: 'recomposition',  label: 'Recomposition',  sub: 'Maintien calorique, transformation' },
  { value: 'maintien',       label: 'Maintien',       sub: 'Conserver les acquis'                },
]

const RECOVERY_OPTIONS: StepOption[] = [
  { value: 'rapide',   label: 'Rapide',   sub: 'Prêt dès le lendemain'         },
  { value: 'normale',  label: 'Normale',  sub: '48h entre groupes musculaires' },
  { value: 'lente',    label: 'Lente',    sub: 'Besoin de 72h+'               },
]

const INJURIES_OPTIONS: StepOption[] = [
  { value: 'none',     label: 'Aucune'     },
  { value: 'epaules',  label: 'Épaules'    },
  { value: 'genoux',   label: 'Genoux'     },
  { value: 'bas_dos',  label: 'Bas du dos' },
  { value: 'poignets', label: 'Poignets'   },
  { value: 'nuque',    label: 'Nuque/Cou'  },
]

const AGE_GROUP_OPTIONS: StepOption[] = [
  { value: '18-25', label: '18–25 ans' },
  { value: '26-35', label: '26–35 ans' },
  { value: '36-45', label: '36–45 ans' },
  { value: '45+',   label: '45+ ans'   },
]

const SPLIT_VALID_DAYS: Record<AISplit, number[]> = {
  auto:       [2, 3, 4, 5, 6],
  fullbody:   [2, 3, 4, 5, 6],
  upperlower: [2, 4],
  ppl:        [3, 6],
  brosplit:   [5],
  arnold:     [3, 6],
  phul:       [4],
  fiveday:    [5],
  pushpull:   [2, 4, 6],
  fullbodyhi: [2, 3, 4, 5, 6],
}

function getDaysForSplit(split: AISplit | undefined): number[] {
  if (split === undefined) return [2, 3, 4, 5, 6]
  return SPLIT_VALID_DAYS[split]
}

const MUSCLES_FOCUS_OPTIONS = ['Équilibré', 'Pecs', 'Dos', 'Épaules', 'Bras', 'Jambes', 'Abdos']

const PROVIDER_LABELS: Record<string, string> = {
  offline: 'Offline',
  openai:  'OpenAI',
  gemini:  'Gemini',
  claude:  'Claude',
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
    steps.push({ id: 'muscle',        field: 'muscleGroups',    question: 'Quels groupes musculaires ?', kind: 'multi-muscle' })
    steps.push({ id: 'targetProgram', field: 'targetProgramId', question: 'Dans quel programme ?',   kind: 'programs'                           })
  } else {
    steps.push({
      id: 'split',
      field: 'split',
      question: 'Quel style de programme ?',
      kind: 'single',
      options: SPLIT_OPTIONS,
    })
    steps.push({ id: 'phase',    field: 'phase',    question: 'Dans quelle phase es-tu ?',         kind: 'single',          options: PHASE_OPTIONS    })
    steps.push({ id: 'recovery', field: 'recovery', question: 'Comment te récupères-tu ?',          kind: 'single',          options: RECOVERY_OPTIONS })
    steps.push({ id: 'injuries', field: 'injuries', question: 'As-tu des zones sensibles ?',        kind: 'multi-injuries'                              })
    steps.push({ id: 'ageGroup', field: 'ageGroup', question: "Dans quelle tranche d'âge es-tu ?", kind: 'single',          options: AGE_GROUP_OPTIONS })
    const daysOptions: StepOption[] = getDaysForSplit(data.split).map(d => ({ value: d, label: `${d}j` }))
    steps.push({ id: 'days', field: 'daysPerWeek', question: 'Combien de jours par semaine ?', kind: 'single', options: daysOptions })
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'Assistant'>
}

export function AssistantScreenInner({ programs, user, navigation }: AssistantScreenInnerProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()

  // ── Wizard state ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep]     = useState(0)
  const [formData, setFormData]           = useState<Partial<AIFormData>>({ equipment: [], musclesFocus: [], muscleGroups: [], injuries: [] })
  const [isGenerating, setIsGenerating]         = useState(false)
  const [isResetAlertVisible, setIsResetAlertVisible] = useState(false)
  const [errorAlertVisible, setErrorAlertVisible]     = useState(false)
  const [errorAlertMessage, setErrorAlertMessage]     = useState('')

  const progressAnim   = useRef(new Animated.Value(0)).current
  const contentAnim    = useRef(new Animated.Value(1)).current
  const pendingFadeIn  = useRef(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  // Réactif via withObservables — mise à jour depuis les settings uniquement
  const providerLabel = PROVIDER_LABELS[user?.aiProvider ?? 'offline'] ?? 'Offline'

  const steps      = useMemo(() => buildSteps(formData), [formData])
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

  // ── Reset au retour sur l'onglet (badge provider + étape 1) ─────────────
  useFocusEffect(
    useCallback(() => {
      // Reset wizard à l'étape 1
      setCurrentStep(0)
      setFormData({ equipment: [], musclesFocus: [], muscleGroups: [], injuries: [] })
      contentAnim.setValue(1)
    }, [contentAnim])
  )

  // ── Transition fade entre étapes ─────────────────────────────────────────
  // Pas de fade-out animée : setValue(0) est synchrone (JS thread), donc
  // le nouveau contenu est garanti invisible quand React le rend.
  // La fade-in se déclenche dans un useEffect, après le commit React.
  const goToStep = useCallback((nextIndex: number, newData?: Partial<AIFormData>) => {
    contentAnim.setValue(0)
    pendingFadeIn.current = true
    if (newData !== undefined) setFormData(newData)
    setCurrentStep(nextIndex)
  }, [contentAnim])

  useEffect(() => {
    if (!pendingFadeIn.current) return
    pendingFadeIn.current = false
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [currentStep, contentAnim])

  // ─── Génération ───────────────────────────────────────────────────────────

  const triggerGenerate = useCallback(async (data: AIFormData) => {
    haptics.onPress()
    setIsGenerating(true)
    try {
      const result = await generatePlan(data, user)
      let fallbackNotice: string | undefined
      if (result.usedFallback) {
        const providerName = PROVIDER_LABELS[result.fallbackReason ?? ''] ?? result.fallbackReason ?? 'cloud'
        fallbackNotice = `Plan généré hors ligne — ${providerName} indisponible`
      }
      setCurrentStep(0)
      setFormData({ equipment: [], musclesFocus: [], muscleGroups: [], injuries: [] })
      contentAnim.setValue(1)
      navigation.navigate('AssistantPreview', {
        plan: result.plan,
        mode: (data.mode ?? 'program') as 'program' | 'session',
        targetProgramId: data.targetProgramId,
      })
      void fallbackNotice
    } catch {
      setErrorAlertMessage('Impossible de générer le plan. Réessaie.')
      setErrorAlertVisible(true)
    } finally {
      setIsGenerating(false)
    }
  }, [user, haptics, navigation, contentAnim])

  // ─── Navigation wizard ────────────────────────────────────────────────────

  const handleSelect = useCallback((field: keyof AIFormData, value: FormValue) => {
    let newData: Partial<AIFormData> = { ...formData, [field]: value }

    // Auto-corriger daysPerWeek si le split change et que le nombre de jours courant n'est plus valide
    if (field === 'split') {
      const validDays = getDaysForSplit(value as AISplit)
      if (validDays.length > 0 && newData.daysPerWeek !== undefined && !validDays.includes(newData.daysPerWeek)) {
        newData = { ...newData, daysPerWeek: validDays[0] }
      }
    }

    haptics.onSelect()

    const currentSteps = buildSteps(newData)
    if (currentStep === currentSteps.length - 1) {
      setFormData(newData)
      triggerGenerate(newData as AIFormData)
    } else {
      goToStep(currentStep + 1, newData)  // formData mis à jour dans le callback
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

  const toggleMuscleGroup = useCallback((muscle: string) => {
    haptics.onSelect()
    setFormData(prev => {
      const current = prev.muscleGroups ?? []
      const isSelected = current.includes(muscle)
      return {
        ...prev,
        muscleGroups: isSelected ? current.filter(m => m !== muscle) : [...current, muscle],
      }
    })
  }, [haptics])

  const toggleInjuries = useCallback((value: string) => {
    haptics.onSelect()
    setFormData(prev => {
      const current = prev.injuries ?? []
      if (value === 'none') {
        return { ...prev, injuries: ['none'] }
      }
      const withoutNone = current.filter(v => v !== 'none')
      const isSelected = withoutNone.includes(value)
      return {
        ...prev,
        injuries: isSelected ? withoutNone.filter(v => v !== value) : [...withoutNone, value],
      }
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
    setFormData({ equipment: [], musclesFocus: [], muscleGroups: [], injuries: [] })
    setCurrentStep(0)
    contentAnim.setValue(1)
  }, [haptics, contentAnim])

  const handleResetRequest = useCallback(() => {
    if (currentStep > 2) {
      haptics.onPress()
      setIsResetAlertVisible(true)
    } else {
      haptics.onDelete()
      setFormData({ equipment: [], musclesFocus: [], injuries: [] })
      setCurrentStep(0)
      contentAnim.setValue(1)
    }
  }, [currentStep, haptics, contentAnim])

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

    if (step.kind === 'multi-muscle') {
      const selected = formData.muscleGroups ?? []
      const hasSelection = selected.length > 0
      return (
        <View>
          <View style={styles.chipsWrap}>
            {MUSCLE_OPTIONS.map(opt => {
              const isActive = selected.includes(String(opt.value))
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => toggleMuscleGroup(String(opt.value))}
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
            onPress={handleEquipmentNext}
          >
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (step.kind === 'multi-injuries') {
      const selected = formData.injuries ?? []
      return (
        <View>
          <View style={styles.chipsWrap}>
            {INJURIES_OPTIONS.map(opt => {
              const isActive = selected.includes(String(opt.value))
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => toggleInjuries(String(opt.value))}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleEquipmentNext}>
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
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
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
        <View style={[styles.badge, styles.badgeContent]}>
          <Ionicons
            name={providerLabel === 'Offline' ? 'cloud-offline-outline' : 'flash-outline'}
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.badgeText}>{providerLabel}</Text>
        </View>
      </View>

      {/* ── Contenu ── */}
      {isGenerating ? (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.generatingText}>Génération en cours...</Text>
        </View>
      ) : (
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
      )}

      {/* ── Bouton recommencer ── */}
      {currentStep > 0 && (
        <TouchableOpacity style={styles.resetFooterBtn} onPress={handleResetRequest}>
          <Text style={styles.resetFooterBtnText}>Recommencer</Text>
        </TouchableOpacity>
      )}

      <AlertDialog
        visible={isResetAlertVisible}
        title="Recommencer ?"
        message="Ta progression actuelle sera perdue."
        onConfirm={handleReset}
        onCancel={() => setIsResetAlertVisible(false)}
        confirmText="Recommencer"
        cancelText="Annuler"
      />

      <AlertDialog
        visible={errorAlertVisible}
        title="Erreur"
        message={errorAlertMessage}
        onConfirm={() => setErrorAlertVisible(false)}
        onCancel={() => setErrorAlertVisible(false)}
        confirmText="OK"
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
}
