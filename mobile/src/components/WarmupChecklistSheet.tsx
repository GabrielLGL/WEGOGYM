/**
 * WarmupChecklistSheet — Checklist d'échauffement adaptée aux muscles de la séance
 *
 * Affiche des suggestions de warmup basées sur les groupes musculaires ciblés.
 * État local (pas de DB) — reset à chaque ouverture.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, fontSize, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'

const WARMUP_SUGGESTIONS: Record<string, string[]> = {
  'Pecs':        ['Rotations épaules', 'Pompes légères (×10)', 'Étirements pecs'],
  'Epaules':     ['Rotations épaules', 'Face pulls bande (×15)', 'Élévations légères'],
  'Dos':         ['Cat-cow (×10)', 'Pull-over léger', 'Rotations thoraciques'],
  'Biceps':      ['Rotations poignets', 'Curl léger (×15)', 'Étirements biceps'],
  'Triceps':     ['Dips au poids du corps (×10)', 'Extensions légères'],
  'Trapèzes':    ['Haussements épaules (×10)', 'Rotations nuque'],
  'Quadriceps':  ['Squats poids du corps (×15)', 'Leg swings', 'Fente statique'],
  'Ischios':     ['Good morning léger (×10)', 'Fente arrière', 'Étirements ischios'],
  'Mollets':     ['Montées sur pointes (×20)', 'Étirements mollets'],
  'Abdos':       ['Planche 30s', 'Crunch léger (×15)', 'Rotation tronc'],
  'Cardio':      ['2 min marche rapide', 'Jumping jacks (×20)', 'Montées genoux'],
}

const GENERIC_SUGGESTIONS = [
  'Rotations épaules',
  'Squats poids du corps (×15)',
  'Cat-cow (×10)',
  'Jumping jacks (×20)',
  'Rotations poignets',
]

const MAX_SUGGESTIONS = 8

function generateSuggestions(muscles: string[]): string[] {
  if (muscles.length === 0) return GENERIC_SUGGESTIONS

  const seen = new Set<string>()
  const result: string[] = []

  for (const muscle of muscles) {
    const items = WARMUP_SUGGESTIONS[muscle]
    if (!items) continue
    for (const item of items) {
      if (!seen.has(item) && result.length < MAX_SUGGESTIONS) {
        seen.add(item)
        result.push(item)
      }
    }
  }

  return result.length > 0 ? result : GENERIC_SUGGESTIONS
}

interface WarmupChecklistSheetProps {
  visible: boolean
  onClose: () => void
  muscles: string[]
}

export function WarmupChecklistSheet({ visible, onClose, muscles }: WarmupChecklistSheetProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const haptics = useHaptics()

  const suggestions = useMemo(() => generateSuggestions(muscles), [muscles])
  const [checked, setChecked] = useState<boolean[]>([])

  // Reset checked state when suggestions change or sheet reopens
  useEffect(() => {
    if (visible) {
      setChecked(new Array(suggestions.length).fill(false))
    }
  }, [visible, suggestions.length])

  const toggleItem = useCallback((index: number) => {
    haptics.onSelect()
    setChecked(prev => prev.map((v, i) => i === index ? !v : v))
  }, [haptics])

  const checkedCount = checked.filter(Boolean).length

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.warmup.title}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t.warmup.subtitle}</Text>

        {muscles.length > 0 && (
          <View style={styles.musclesRow}>
            {muscles.map(m => (
              <View key={m} style={styles.muscleChip}>
                <Text style={styles.muscleChipText}>{m}</Text>
              </View>
            ))}
          </View>
        )}

        {suggestions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.checkItem}
            onPress={() => toggleItem(index)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={checked[index] ? 'checkbox' : 'square-outline'}
              size={22}
              color={checked[index] ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.checkText,
              checked[index] && styles.checkTextDone,
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.progress}>
          {checkedCount}/{suggestions.length} {t.warmup.done}
        </Text>
      </ScrollView>
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    scrollContent: {
      maxHeight: 400,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginBottom: spacing.md,
    },
    musclesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    muscleChip: {
      backgroundColor: colors.primary + '20',
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    muscleChipText: {
      color: colors.primary,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    checkText: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      flex: 1,
    },
    checkTextDone: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    progress: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
  }), [colors])
}
