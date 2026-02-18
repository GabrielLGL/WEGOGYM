import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
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
import type { MainTabParamList } from '../navigation/index'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'program' | 'session'

const GOALS: { key: AIGoal; label: string }[] = [
  { key: 'masse',  label: 'Prise de masse' },
  { key: 'force',  label: 'Force'          },
  { key: 'perte',  label: 'Perte de poids' },
  { key: 'cardio', label: 'Cardio'         },
]

const LEVELS: { key: AILevel; label: string }[] = [
  { key: 'débutant',      label: 'Débutant'      },
  { key: 'intermédiaire', label: 'Intermédiaire' },
  { key: 'avancé',        label: 'Avancé'        },
]

const EQUIPMENT_OPTIONS = ['Poids du corps', 'Haltères', 'Barre & disques', 'Machines']

const DAYS_OPTIONS = [2, 3, 4, 5, 6]

const DURATIONS: AIDuration[] = [30, 45, 60, 90]

const MUSCLES = [
  'Pecs', 'Dos', 'Quadriceps', 'Ischios',
  'Epaules', 'Biceps', 'Triceps', 'Abdos', 'Full Body',
]

const PROVIDER_LABELS: Record<string, string> = {
  offline: 'Offline',
  claude:  'Claude',
  openai:  'OpenAI',
  gemini:  'Gemini',
}

// ─── Composant interne (reçoit programs et user depuis withObservables) ────────

interface AssistantScreenInnerProps {
  programs: Program[]
  user: User | null
  navigation: BottomTabScreenProps<MainTabParamList, 'Assistant'>['navigation']
}

function AssistantScreenInner({ programs, user, navigation }: AssistantScreenInnerProps) {
  const haptics = useHaptics()
  const previewModal = useModalState()

  // ─── État formulaire ──────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('program')
  const [goal, setGoal] = useState<AIGoal>('masse')
  const [level, setLevel] = useState<AILevel>('débutant')
  const [equipment, setEquipment] = useState<string[]>(['Poids du corps'])
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [durationMin, setDurationMin] = useState<AIDuration>(60)
  const [muscleGroup, setMuscleGroup] = useState('Full Body')
  const [targetProgramId, setTargetProgramId] = useState<string | undefined>(
    programs[0]?.id
  )

  // ─── État génération ──────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)

  const toggleEquipment = (item: string) => {
    haptics.onSelect()
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    )
  }

  const handleGenerate = useCallback(async () => {
    if (mode === 'session' && !targetProgramId) {
      Alert.alert('Programme requis', 'Sélectionne un programme pour ajouter cette séance.')
      return
    }
    haptics.onPress()
    setIsGenerating(true)
    previewModal.open()

    const form: AIFormData = {
      mode,
      goal,
      level,
      equipment,
      durationMin,
      ...(mode === 'program' ? { daysPerWeek } : { muscleGroup, targetProgramId }),
    }

    try {
      const plan = await generatePlan(form, user ?? ({} as User))
      setGeneratedPlan(plan)
    } catch {
      previewModal.close()
      Alert.alert('Erreur', 'Impossible de générer le plan. Réessaie.')
    } finally {
      setIsGenerating(false)
    }
  }, [mode, goal, level, equipment, durationMin, daysPerWeek, muscleGroup, targetProgramId, user])

  const handleModify = useCallback(() => {
    previewModal.close()
    setGeneratedPlan(null)
  }, [])

  const handleValidate = useCallback(async (plan: GeneratedPlan) => {
    if (mode === 'program') {
      await importGeneratedPlan(plan)
      previewModal.close()
      navigation.navigate('Home')
    } else {
      if (!targetProgramId) return
      const session = await importGeneratedSession(plan.sessions[0], targetProgramId)
      previewModal.close()
      // @ts-ignore — navigate vers un écran du stack parent
      navigation.getParent()?.navigate('SessionDetail', { sessionId: session.id })
    }
  }, [mode, targetProgramId, navigation])

  const providerLabel = PROVIDER_LABELS[user?.aiProvider ?? 'offline'] ?? 'Offline'

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Sélecteur de mode ── */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeCard, mode === 'program' && styles.modeCardActive]}
            onPress={() => { haptics.onSelect(); setMode('program') }}
          >
            <Text style={styles.modeEmoji}>📅</Text>
            <Text style={styles.modeTitle}>Programme</Text>
            <Text style={styles.modeSub}>Plusieurs séances structurées</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, mode === 'session' && styles.modeCardActive]}
            onPress={() => { haptics.onSelect(); setMode('session') }}
          >
            <Text style={styles.modeEmoji}>⚡</Text>
            <Text style={styles.modeTitle}>Séance</Text>
            <Text style={styles.modeSub}>Une session pour aujourd'hui</Text>
          </TouchableOpacity>
        </View>

        {/* ── Objectif ── */}
        <Text style={styles.sectionLabel}>Objectif</Text>
        <View style={styles.chipsWrap}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.key}
              style={[styles.chip, goal === g.key && styles.chipActive]}
              onPress={() => { haptics.onSelect(); setGoal(g.key) }}
            >
              <Text style={[styles.chipText, goal === g.key && styles.chipTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Niveau ── */}
        <Text style={styles.sectionLabel}>Niveau</Text>
        <View style={styles.chipsWrap}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.key}
              style={[styles.chip, level === l.key && styles.chipActive]}
              onPress={() => { haptics.onSelect(); setLevel(l.key) }}
            >
              <Text style={[styles.chipText, level === l.key && styles.chipTextActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Équipement ── */}
        <Text style={styles.sectionLabel}>Équipement disponible</Text>
        <View style={styles.chipsWrap}>
          {EQUIPMENT_OPTIONS.map(eq => (
            <TouchableOpacity
              key={eq}
              style={[styles.chip, equipment.includes(eq) && styles.chipActive]}
              onPress={() => toggleEquipment(eq)}
            >
              <Text style={[styles.chipText, equipment.includes(eq) && styles.chipTextActive]}>
                {eq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Durée par séance ── */}
        <Text style={styles.sectionLabel}>Durée par séance</Text>
        <View style={styles.chipsWrap}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, durationMin === d && styles.chipActive]}
              onPress={() => { haptics.onSelect(); setDurationMin(d) }}
            >
              <Text style={[styles.chipText, durationMin === d && styles.chipTextActive]}>
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Spécifique Programme ── */}
        {mode === 'program' && (
          <>
            <Text style={styles.sectionLabel}>Jours par semaine</Text>
            <View style={styles.chipsWrap}>
              {DAYS_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, daysPerWeek === d && styles.chipActive]}
                  onPress={() => { haptics.onSelect(); setDaysPerWeek(d) }}
                >
                  <Text style={[styles.chipText, daysPerWeek === d && styles.chipTextActive]}>
                    {d}j
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── Spécifique Séance ── */}
        {mode === 'session' && (
          <>
            <Text style={styles.sectionLabel}>Groupe musculaire</Text>
            <View style={styles.chipsWrap}>
              {MUSCLES.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, muscleGroup === m && styles.chipActive]}
                  onPress={() => { haptics.onSelect(); setMuscleGroup(m) }}
                >
                  <Text style={[styles.chipText, muscleGroup === m && styles.chipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Ajouter à quel programme ?</Text>
            {programs.length === 0 ? (
              <Text style={styles.emptyText}>Aucun programme disponible — crée-en un d'abord.</Text>
            ) : (
              <View style={styles.chipsWrap}>
                {programs.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, targetProgramId === p.id && styles.chipActive]}
                    onPress={() => { haptics.onSelect(); setTargetProgramId(p.id) }}
                  >
                    <Text style={[styles.chipText, targetProgramId === p.id && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Bouton Générer ── */}
        <TouchableOpacity
          style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.generateBtnText}>✨ Générer</Text>
          )}
        </TouchableOpacity>

        {/* ── Indicateur provider ── */}
        <Text style={styles.providerHint}>
          Mode actif : {providerLabel}
          {providerLabel === 'Offline' ? '  — configure une clé API dans Paramètres pour booster' : ''}
        </Text>

      </ScrollView>

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

// ─── withObservables — injecte programs ───────────────────────────────────────

const AssistantScreenEnhanced = withObservables([], () => ({
  programs: database.get<Program>('programs').query(),
}))(AssistantScreenInner as any)

// ─── Export avec user récupéré via observable ──────────────────────────────

import { useEffect } from 'react'
import { Q } from '@nozbe/watermelondb'

export default function AssistantScreen(props: BottomTabScreenProps<MainTabParamList, 'Assistant'>) {
  const [user, setUser] = React.useState<User | null>(null)

  useEffect(() => {
    const obs = database.get<User>('users').query(Q.take(1)).observe()
    const sub = obs.subscribe(users => setUser(users[0] ?? null))
    return () => sub.unsubscribe()
  }, [])

  return <AssistantScreenEnhanced {...props} user={user} />
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 60,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardActive: {
    borderColor: colors.primary,
  },
  modeEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  modeTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  modeSub: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardSecondary,
  },
  chipActive: {
    backgroundColor: colors.primary,
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
  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  providerHint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
})
