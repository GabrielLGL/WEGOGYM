import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Animated, BackHandler } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../model/index'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { map } from 'rxjs/operators'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/index'

import { CustomModal } from '../components/CustomModal'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { OnboardingSheet } from '../components/OnboardingSheet'
import Program from '../model/models/Program'
import User from '../model/models/User'
import ProgramSection from '../components/ProgramSection'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useProgramManager } from '../hooks/useProgramManager'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { importPresetProgram, markOnboardingCompleted } from '../model/utils/databaseHelpers'
import type { PresetProgram } from '../model/onboardingPrograms'
import { fontSize, spacing, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface Props {
  programs: Program[]
  user: User | null
  navigation: NavigationProp
}

const ProgramsScreen: React.FC<Props> = ({ programs, user, navigation }) => {
  // --- HOOKS ---
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const { t } = useLanguage()
  const slideAnim = useKeyboardAnimation(-150)
  const {
    // Program states
    programNameInput,
    setProgramNameInput,
    isRenamingProgram,
    setIsRenamingProgram,
    selectedProgram,
    setSelectedProgram,
    // Operations
    saveProgram,
    duplicateProgram,
    deleteProgram,
    prepareRenameProgram,
  } = useProgramManager(haptics.onSuccess)

  // --- ÉTATS LOCAUX ---
  const onboardingModal = useModalState()
  const programModal = useModalState()
  const optionsModal = useModalState()
  const createChoiceModal = useModalState()
  const alertModal = useModalState()
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: async () => {} })
  const errorAlert = useModalState()
  const [errorAlertMessage, setErrorAlertMessage] = useState('')

  const renameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref pour lire l'état courant dans le BackHandler sans le re-enregistrer
  const backHandlerVisibilityRef = useRef({
    isCreateChoiceVisible: false,
    isOptionsVisible: false,
  })

  // Sync du ref avec l'état courant
  useEffect(() => {
    backHandlerVisibilityRef.current = { isCreateChoiceVisible: createChoiceModal.isOpen, isOptionsVisible: optionsModal.isOpen }
  }, [createChoiceModal.isOpen, optionsModal.isOpen])

  // --- GESTION BOUTON RETOUR ANDROID ---
  // Enregistré une seule fois (deps vides) — élimine la race condition
  // lors du remove/re-add à chaque changement d'état
  useEffect(() => {
    const backAction = () => {
      const v = backHandlerVisibilityRef.current
      if (v.isCreateChoiceVisible) {
        createChoiceModal.close()
        return true
      }
      if (v.isOptionsVisible) {
        optionsModal.close()
        return true
      }
      return false
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, []) // Enregistré une seule fois — lit depuis la ref

  // --- CLEANUP TIMER RENOMMAGE ---
  useEffect(() => {
    return () => {
      if (renameTimerRef.current) clearTimeout(renameTimerRef.current)
    }
  }, [])

  // --- ONBOARDING ---

  useEffect(() => {
    if (programs.length === 0 && user && !user.onboardingCompleted) {
      const timer = setTimeout(() => onboardingModal.open(), 400)
      return () => clearTimeout(timer)
    }
  }, [programs, user])

  const handleProgramSelected = async (preset: PresetProgram) => {
    try {
      await importPresetProgram(preset)
      await markOnboardingCompleted()
      onboardingModal.close()
      haptics.onSuccess()
    } catch (error) {
      if (__DEV__) console.error('[ProgramsScreen] Erreur import programme :', error)
      // Ne pas appeler markOnboardingCompleted en cas d'erreur (AC8)
    }
  }

  const handleSkipOnboarding = async () => {
    try {
      await markOnboardingCompleted()
      onboardingModal.close()
    } catch (error) {
      if (__DEV__) console.error('[ProgramsScreen] handleSkipOnboarding:', error)
      onboardingModal.close()
    }
  }

  // --- LOGIQUE MÉTIER ---

  const handleSaveProgram = async () => {
    try {
      const success = await saveProgram()
      if (success) {
        programModal.close()
      }
    } catch (e) {
      if (__DEV__) console.error('[ProgramsScreen] handleSaveProgram:', e)
    }
  }

  const handleDuplicateProgram = async () => {
    try {
      optionsModal.close()
      await duplicateProgram()
    } catch (e) {
      if (__DEV__) console.error('[ProgramsScreen] handleDuplicateProgram:', e)
    }
  }

  const handleProgramPress = useCallback((program: Program) => {
    haptics.onPress()
    navigation.navigate('ProgramDetail', { programId: program.id })
  }, [haptics, navigation])

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Program>) => (
    <ScaleDecorator>
      <View style={{ opacity: isActive ? 0.8 : 1 }}>
        <ProgramSection
          program={item}
          sessions={[]}
          onPress={() => handleProgramPress(item)}
          onLongPressProgram={drag}
          onOptionsPress={() => {
            haptics.onSelect()
            setSelectedProgram(item)
            optionsModal.open()
          }}
        />
      </View>
    </ScaleDecorator>
  ), [haptics, handleProgramPress])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.listWrapper}>
          <DraggableFlatList
            data={programs}
            onDragEnd={async ({ data }) => {
              try {
                await database.write(async () => {
                  const updates = data
                    .map((p, index) => p.position !== index ? p.prepareUpdate(u => { u.position = index }) : null)
                    .filter((x): x is Program => x !== null)
                  if (updates.length) await database.batch(updates)
                })
              } catch (error) {
                if (__DEV__) console.error('[ProgramsScreen] Drag-and-drop batch update failed:', error)
                setErrorAlertMessage(t.programs.reorderError)
                errorAlert.open()
              }
            }}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: spacing.lg }}
          />
        </View>

        <Animated.View style={[styles.footerFloating, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.bigButton}
            onPress={() => {
              haptics.onPress()
              createChoiceModal.open()
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primaryText} />
              <Text style={styles.btnText}>{t.programs.createTitle}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* --- MODALES --- */}

        {/* Choix création programme BottomSheet */}
        <BottomSheet
          visible={createChoiceModal.isOpen}
          onClose={createChoiceModal.close}
          title={t.programs.createLabel}
        >
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              haptics.onPress()
              createChoiceModal.close()
              setIsRenamingProgram(false)
              setProgramNameInput('')
              programModal.open()
            }}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: spacing.lg, width: 30 }} />
            <Text style={styles.sheetOptionText}>{t.programs.self}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              haptics.onPress()
              createChoiceModal.close()
              navigation.navigate('Assistant')
            }}
          >
            <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} style={{ marginRight: spacing.lg, width: 30 }} />
            <Text style={styles.sheetOptionText}>{t.programs.automatic}</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Programme Modal (Création / Renommage) */}
        <CustomModal
          visible={programModal.isOpen}
          title={isRenamingProgram ? t.programs.renameTitle : t.programs.newTitle}
          onClose={programModal.close}
          buttons={
            <>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.secondaryButton}]} onPress={programModal.close}>
                <Text style={styles.buttonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.primary}]} onPress={handleSaveProgram}>
                <Text style={styles.buttonTextPrimary}>{t.common.validate}</Text>
              </TouchableOpacity>
            </>
          }
        >
          <TextInput
            style={styles.input}
            value={programNameInput}
            onChangeText={setProgramNameInput}
            autoFocus
            placeholderTextColor={colors.textSecondary}
            placeholder={t.programs.namePlaceholder}
          />
        </CustomModal>

        {/* Options Programme BottomSheet */}
        <BottomSheet
          visible={optionsModal.isOpen}
          onClose={optionsModal.close}
          title={selectedProgram?.name}
        >
          <TouchableOpacity style={styles.sheetOption} onPress={() => { if (selectedProgram) prepareRenameProgram(selectedProgram); optionsModal.close(); if (renameTimerRef.current) clearTimeout(renameTimerRef.current); renameTimerRef.current = setTimeout(() => { programModal.open(); renameTimerRef.current = null }, 300) }}>
            <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: spacing.lg, width: 30 }} /><Text style={styles.sheetOptionText}>{t.programs.rename}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={handleDuplicateProgram}>
            <Ionicons name="copy-outline" size={20} color={colors.text} style={{ marginRight: spacing.lg, width: 30 }} /><Text style={styles.sheetOptionText}>{t.programs.duplicate}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={() => { optionsModal.close(); setAlertConfig({ title: `${t.programs.deleteTitle} ${selectedProgram?.name} ?`, message: t.programs.deleteMessage, onConfirm: async () => { await deleteProgram() } }); alertModal.open(); }}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: spacing.lg, width: 30 }} /><Text style={[styles.sheetOptionText, { color: colors.danger }]}>{t.programs.delete}</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Alerte Suppression Générique */}
        <AlertDialog
          visible={alertModal.isOpen}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={async () => {
            try {
              await alertConfig.onConfirm()
            } finally {
              alertModal.close()
            }
          }}
          onCancel={alertModal.close}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
        />

        {/* Alerte Erreur */}
        <AlertDialog
          visible={errorAlert.isOpen}
          title={t.programs.errorTitle}
          message={errorAlertMessage}
          onConfirm={errorAlert.close}
          onCancel={errorAlert.close}
          confirmText={t.common.ok}
          confirmColor={colors.primary}
          hideCancel
        />

      </SafeAreaView>

      {/* Onboarding premier lancement */}
      <OnboardingSheet
        visible={onboardingModal.isOpen}
        onClose={onboardingModal.close}
        onProgramSelected={handleProgramSelected}
        onSkip={handleSkipOnboarding}
      />

    </GestureHandlerRootView>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listWrapper: { flex: 1 },
    footerFloating: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.background,
    },
    bigButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
    },
    btnText: { color: colors.primaryText, fontWeight: 'bold', fontSize: fontSize.md },

    // Modal styles
    input: {
      backgroundColor: colors.cardSecondary,
      color: colors.text,
      padding: spacing.ms,
      borderRadius: borderRadius.sm,
      fontSize: fontSize.md,
      textAlign: 'center',
    },
    modalButton: {
      flex: 0.47,
      padding: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    buttonText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.bodyMd },
    buttonTextPrimary: { color: colors.primaryText, fontWeight: 'bold', fontSize: fontSize.bodyMd },

    // BottomSheet content styles
    sheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.cardSecondary,
    },
    sheetOptionText: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginLeft: spacing.xs,
    },
    moveRow: { flexDirection: 'row', marginBottom: spacing.sm },
    moveChip: {
      backgroundColor: colors.cardSecondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moveChipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  }), [colors])
}

export { ProgramsScreen as ProgramsContent }

const ObservableProgramsContent = withObservables([], () => ({
  programs: database.get<Program>('programs').query(Q.sortBy('position', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(ProgramsScreen)

const ProgramsScreenWrapper = ({ navigation }: { navigation: NavigationProp }) => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableProgramsContent navigation={navigation} />}
    </View>
  )
}

export default ProgramsScreenWrapper
