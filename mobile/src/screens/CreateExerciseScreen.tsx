import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { database } from '../model/index'
import Exercise from '../model/models/Exercise'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { useHaptics } from '../hooks/useHaptics'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { AlertDialog } from '../components/AlertDialog'
import { fontSize, spacing, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'

const SCREEN_PADDING_H = 20
const LIST_ITEM_PADDING_V = 15
const FONT_SIZE_LABEL = 13
const INPUT_MARGIN_BOTTOM = 20
const EQUIP_ROW_MARGIN_BOTTOM = 20
const EQUIP_BORDER_RADIUS = 10
const ICON_PADDING = 10
const SEARCH_PADDING_H = 15
const BTN_PADDING = 16

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: SCREEN_PADDING_H, paddingBottom: 40 },
    label: { color: colors.textSecondary, fontSize: FONT_SIZE_LABEL, marginBottom: spacing.sm, fontWeight: '600', textTransform: 'uppercase' },
    input: { backgroundColor: colors.cardSecondary, color: colors.text, padding: LIST_ITEM_PADDING_V, borderRadius: borderRadius.md, fontSize: fontSize.md, marginBottom: INPUT_MARGIN_BOTTOM },
    inputMultiline: { backgroundColor: colors.cardSecondary, color: colors.text, padding: LIST_ITEM_PADDING_V, borderRadius: borderRadius.md, fontSize: fontSize.md, marginBottom: INPUT_MARGIN_BOTTOM, minHeight: 90, textAlignVertical: 'top' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: INPUT_MARGIN_BOTTOM },
    chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.ms, borderRadius: borderRadius.lg, backgroundColor: colors.cardSecondary, marginRight: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary, fontSize: fontSize.xs },
    chipTextActive: { color: colors.primaryText, fontWeight: 'bold' },
    equipRow: { marginBottom: EQUIP_ROW_MARGIN_BOTTOM },
    equipBtn: { paddingVertical: ICON_PADDING, paddingHorizontal: SEARCH_PADDING_H, borderRadius: EQUIP_BORDER_RADIUS, backgroundColor: colors.cardSecondary, marginRight: spacing.sm },
    equipBtnActive: { backgroundColor: colors.secondaryButton, borderWidth: 1, borderColor: colors.primary },
    equipText: { color: colors.textSecondary, fontSize: FONT_SIZE_LABEL },
    equipTextActive: { color: colors.text, fontWeight: 'bold' },
    footer: { padding: SCREEN_PADDING_H, paddingBottom: spacing.xl, backgroundColor: colors.background },
    createBtn: { backgroundColor: colors.primary, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center' },
    createBtnDisabled: { opacity: 0.4 },
    createBtnText: { color: colors.primaryText, fontWeight: 'bold', fontSize: fontSize.md },
  })
}

export default function CreateExerciseScreen() {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation()
  const haptics = useHaptics()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [muscles, setMuscles] = useState<string[]>([])
  const [equipment, setEquipment] = useState('')
  const [description, setDescription] = useState('')
  const [isErrorVisible, setIsErrorVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isFormValid = name.trim() !== '' && muscles.length > 0 && equipment !== ''

  const toggleMuscle = (muscle: string) => {
    setMuscles(prev =>
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    )
  }

  const handleCreate = async () => {
    try {
      await database.write(async () => {
        await database.get<Exercise>('exercises').create(e => {
          e.name = name.trim()
          e.muscles = muscles
          e.equipment = equipment
          e.isCustom = true
          if (description.trim()) e.description = description.trim()
        })
      })
      haptics.onSuccess()
      navigation.goBack()
    } catch {
      setErrorMessage(t.exercises.createError)
      setIsErrorVisible(true)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t.exercises.namePlaceholder}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t.exercises.namePlaceholder}
          placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.label}>{t.exercises.muscles}</Text>
        <View style={styles.chipsContainer}>
          {MUSCLES_LIST.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, muscles.includes(m) && styles.chipActive]}
              onPress={() => { haptics.onSelect(); toggleMuscle(m) }}
            >
              <Text style={[styles.chipText, muscles.includes(m) && styles.chipTextActive]}>
                {t.muscleNames[m as keyof typeof t.muscleNames] ?? m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t.exercises.equipment}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipRow}>
          {EQUIPMENT_LIST.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.equipBtn, equipment === e && styles.equipBtnActive]}
              onPress={() => { haptics.onSelect(); setEquipment(e) }}
            >
              <Text style={[styles.equipText, equipment === e && styles.equipTextActive]}>
                {t.equipmentNames[e as keyof typeof t.equipmentNames] ?? e}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>{t.exercises.descriptionLabel}</Text>
        <TextInput
          style={styles.inputMultiline}
          value={description}
          onChangeText={setDescription}
          placeholder={t.exercises.descriptionPlaceholder}
          placeholderTextColor={colors.placeholder}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createBtn, !isFormValid && styles.createBtnDisabled]}
          onPress={() => { haptics.onPress(); handleCreate() }}
          disabled={!isFormValid}
        >
          <Text style={styles.createBtnText}>{t.exercises.create}</Text>
        </TouchableOpacity>
      </View>

      <AlertDialog
        visible={isErrorVisible}
        title={t.common.error}
        message={errorMessage}
        onConfirm={() => setIsErrorVisible(false)}
        onCancel={() => setIsErrorVisible(false)}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        hideCancel
      />
    </KeyboardAvoidingView>
  )
}
