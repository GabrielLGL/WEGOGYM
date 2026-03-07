import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Animated, BackHandler, Platform } from 'react-native'
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
import { useProgramManager } from '../hooks/useProgramManager'
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
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false)
  const [isProgramModalVisible, setIsProgramModalVisible] = useState(false)
  const [isOptionsVisible, setIsOptionsVisible] = useState(false)
  const [isCreateChoiceVisible, setIsCreateChoiceVisible] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: async () => {} })
  const [errorAlertVisible, setErrorAlertVisible] = useState(false)
  const [errorAlertMessage, setErrorAlertMessage] = useState('')

  const renameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref pour lire l'état courant dans le BackHandler sans le re-enregistrer
  const backHandlerVisibilityRef = useRef({
    isCreateChoiceVisible: false,
    isOptionsVisible: false,
  })

  // Sync du ref avec l'état courant
  useEffect(() => {
    backHandlerVisibilityRef.current = { isCreateChoiceVisible, isOptionsVisible }
  }, [isCreateChoiceVisible, isOptionsVisible])

  // --- GESTION BOUTON RETOUR ANDROID ---
  // Enregistré une seule fois (deps vides) — élimine la race condition
  // lors du remove/re-add à chaque changement d'état
  useEffect(() => {
    const backAction = () => {
      const v = backHandlerVisibilityRef.current
      if (v.isCreateChoiceVisible) {
        setIsCreateChoiceVisible(false)
        return true
      }
      if (v.isOptionsVisible) {
        setIsOptionsVisible(false)
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
      const timer = setTimeout(() => setIsOnboardingVisible(true), 400)
      return () => clearTimeout(timer)
    }
  }, [programs, user])

  const handleProgramSelected = async (preset: PresetProgram) => {
    try {
      await importPresetProgram(preset)
      await markOnboardingCompleted()
      setIsOnboardingVisible(false)
      haptics.onSuccess()
    } catch (error) {
      if (__DEV__) console.error('[ProgramsScreen] Erreur import programme :', error)
      // Ne pas appeler markOnboardingCompleted en cas d'erreur (AC8)
    }
  }

  const handleSkipOnboarding = async () => {
    try {
      await markOnboardingCompleted()
      setIsOnboardingVisible(false)
    } catch (error) {
      if (__DEV__) console.error('[ProgramsScreen] handleSkipOnboarding:', error)
      setIsOnboardingVisible(false)
    }
  }

  // --- LOGIQUE MÉTIER ---

  const handleSaveProgram = async () => {
    const success = await saveProgram()
    if (success) {
      setIsProgramModalVisible(false)
    }
  }

  const handleDuplicateProgram = async () => {
    setIsOptionsVisible(false)
    await duplicateProgram()
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
            setIsOptionsVisible(true)
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
                setErrorAlertVisible(true)
              }
            }}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 20 }}
          />
        </View>

        <Animated.View style={[styles.footerFloating, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.bigButton}
            onPress={() => {
              haptics.onPress()
              setIsCreateChoiceVisible(true)
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
          visible={isCreateChoiceVisible}
          onClose={() => setIsCreateChoiceVisible(false)}
          title={t.programs.createLabel}
        >
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              haptics.onPress()
              setIsCreateChoiceVisible(false)
              setIsRenamingProgram(false)
              setProgramNameInput('')
              setIsProgramModalVisible(true)
            }}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: 20, width: 30 }} />
            <Text style={styles.sheetOptionText}>{t.programs.self}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              haptics.onPress()
              setIsCreateChoiceVisible(false)
              navigation.navigate('Assistant')
            }}
          >
            <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} style={{ marginRight: 20, width: 30 }} />
            <Text style={styles.sheetOptionText}>{t.programs.automatic}</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Programme Modal (Création / Renommage) */}
        <CustomModal
          visible={isProgramModalVisible}
          title={isRenamingProgram ? t.programs.renameTitle : t.programs.newTitle}
          onClose={() => setIsProgramModalVisible(false)}
          buttons={
            <>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.secondaryButton}]} onPress={() => setIsProgramModalVisible(false)}>
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
          visible={isOptionsVisible}
          onClose={() => setIsOptionsVisible(false)}
          title={selectedProgram?.name}
        >
          <TouchableOpacity style={styles.sheetOption} onPress={() => { if (selectedProgram) prepareRenameProgram(selectedProgram); setIsOptionsVisible(false); if (renameTimerRef.current) clearTimeout(renameTimerRef.current); renameTimerRef.current = setTimeout(() => { setIsProgramModalVisible(true); renameTimerRef.current = null }, 300) }}>
            <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: 20, width: 30 }} /><Text style={styles.sheetOptionText}>{t.programs.rename}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={handleDuplicateProgram}>
            <Ionicons name="copy-outline" size={20} color={colors.text} style={{ marginRight: 20, width: 30 }} /><Text style={styles.sheetOptionText}>{t.programs.duplicate}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsOptionsVisible(false); setAlertConfig({ title: `${t.programs.deleteTitle} ${selectedProgram?.name} ?`, message: t.programs.deleteMessage, onConfirm: async () => { await deleteProgram() } }); setIsAlertVisible(true); }}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: 20, width: 30 }} /><Text style={[styles.sheetOptionText, { color: colors.danger }]}>{t.programs.delete}</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Alerte Suppression Générique */}
        <AlertDialog
          visible={isAlertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={async () => {
            try {
              await alertConfig.onConfirm()
            } finally {
              setIsAlertVisible(false)
            }
          }}
          onCancel={() => setIsAlertVisible(false)}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
        />

        {/* Alerte Erreur */}
        <AlertDialog
          visible={errorAlertVisible}
          title={t.programs.errorTitle}
          message={errorAlertMessage}
          onConfirm={() => setErrorAlertVisible(false)}
          onCancel={() => setErrorAlertVisible(false)}
          confirmText={t.common.ok}
          confirmColor={colors.primary}
          hideCancel
        />

      </SafeAreaView>

      {/* Onboarding premier lancement */}
      <OnboardingSheet
        visible={isOnboardingVisible}
        onClose={() => setIsOnboardingVisible(false)}
        onProgramSelected={handleProgramSelected}
        onSkip={handleSkipOnboarding}
      />

    </GestureHandlerRootView>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      marginTop: 20,
      marginBottom: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginLeft: 5,
    },
    moveRow: { flexDirection: 'row', marginBottom: 10 },
    moveChip: {
      backgroundColor: colors.cardSecondary,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: borderRadius.sm,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moveChipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  })
}

export { ProgramsScreen as ProgramsContent }

const ObservableProgramsContent = withObservables([], () => ({
  programs: database.get<Program>('programs').query(Q.sortBy('position', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(ProgramsScreen)

const ProgramsScreenWrapper = ({ navigation }: { navigation: NavigationProp }) => {
  const colors = useColors()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableProgramsContent navigation={navigation} />}
    </View>
  )
}

export default ProgramsScreenWrapper
