import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Animated, ScrollView, BackHandler } from 'react-native'
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
import Session from '../model/models/Session'
import User from '../model/models/User'
import ProgramSection from '../components/ProgramSection'
import ProgramDetailBottomSheet from '../components/ProgramDetailBottomSheet'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useProgramManager } from '../hooks/useProgramManager'
import { importPresetProgram, markOnboardingCompleted } from '../model/utils/databaseHelpers'
import type { PresetProgram } from '../model/onboardingPrograms'
import { colors, fontSize, spacing, borderRadius } from '../theme'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface Props {
  programs: Program[]
  user: User | null
  navigation: NavigationProp
}

const ProgramsScreen: React.FC<Props> = ({ programs, user, navigation }) => {
  // --- HOOKS ---
  const haptics = useHaptics()
  const slideAnim = useKeyboardAnimation(-150)
  const {
    // Program states
    programNameInput,
    setProgramNameInput,
    isRenamingProgram,
    setIsRenamingProgram,
    selectedProgram,
    setSelectedProgram,
    // Session states
    sessionNameInput,
    setSessionNameInput,
    isRenamingSession,
    setIsRenamingSession,
    selectedSession,
    setSelectedSession,
    targetProgram,
    setTargetProgram,
    // Operations
    saveProgram,
    duplicateProgram,
    deleteProgram,
    saveSession,
    duplicateSession,
    deleteSession,
    moveSession,
    prepareRenameProgram,
    prepareRenameSession,
  } = useProgramManager(haptics.onSuccess)

  // --- ÉTATS LOCAUX ---
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false)
  const [isProgramModalVisible, setIsProgramModalVisible] = useState(false)
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false)
  const [isOptionsVisible, setIsOptionsVisible] = useState(false)
  const [isSessionOptionsVisible, setIsSessionOptionsVisible] = useState(false)
  const [selectedSessionProgramId, setSelectedSessionProgramId] = useState<string | null>(null)
  const [isCreateChoiceVisible, setIsCreateChoiceVisible] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: async () => {} })
  const [errorAlertVisible, setErrorAlertVisible] = useState(false)
  const [errorAlertMessage, setErrorAlertMessage] = useState('')
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<Program | null>(null)
  const [isDetailVisible, setIsDetailVisible] = useState(false)

  const renameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const renameSessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref pour lire l'état courant dans le BackHandler sans le re-enregistrer
  const backHandlerVisibilityRef = useRef({
    isCreateChoiceVisible: false,
    isDetailVisible: false,
    isOptionsVisible: false,
    isSessionOptionsVisible: false,
  })

  // Sync du ref avec l'état courant
  useEffect(() => {
    backHandlerVisibilityRef.current = { isCreateChoiceVisible, isDetailVisible, isOptionsVisible, isSessionOptionsVisible }
  }, [isCreateChoiceVisible, isDetailVisible, isOptionsVisible, isSessionOptionsVisible])

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
      if (v.isDetailVisible) {
        setIsDetailVisible(false)
        return true
      }
      if (v.isOptionsVisible) {
        setIsOptionsVisible(false)
        return true
      }
      if (v.isSessionOptionsVisible) {
        setIsSessionOptionsVisible(false)
        return true
      }
      return false
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, []) // Enregistré une seule fois — lit depuis la ref

  // --- CLEANUP TIMERS RENOMMAGE ---
  useEffect(() => {
    return () => {
      if (renameTimerRef.current) clearTimeout(renameTimerRef.current)
      if (renameSessionTimerRef.current) clearTimeout(renameSessionTimerRef.current)
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

  const handleSaveSession = async () => {
    const success = await saveSession()
    if (success) {
      setIsSessionModalVisible(false)
    }
  }

  const handleDuplicateProgram = async () => {
    setIsOptionsVisible(false)
    await duplicateProgram()
  }

  const handleDuplicateSession = async () => {
    setIsSessionOptionsVisible(false)
    await duplicateSession()
  }

  const handleMoveSession = async (targetProg: Program) => {
    await moveSession(targetProg)
    setIsSessionOptionsVisible(false)
  }

  const handleProgramPress = useCallback((program: Program) => {
    haptics.onPress()
    setSelectedProgramForDetail(program)
    setIsDetailVisible(true)
  }, [haptics])

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
                  if (updates.length) await database.batch(...updates)
                })
              } catch (error) {
                if (__DEV__) console.error('[ProgramsScreen] Drag-and-drop batch update failed:', error)
                setErrorAlertMessage('Impossible de réorganiser les programmes.')
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
            <Text style={styles.btnText}>📂 Créer un Programme</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* --- MODALES --- */}

        {/* Choix création programme BottomSheet */}
        <BottomSheet
          visible={isCreateChoiceVisible}
          onClose={() => setIsCreateChoiceVisible(false)}
          title="Créer un programme"
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
            <Text style={styles.sheetOptionIcon}>✏️</Text>
            <Text style={styles.sheetOptionText}>Soi-même</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              haptics.onPress()
              setIsCreateChoiceVisible(false)
              navigation.navigate('Assistant')
            }}
          >
            <Text style={styles.sheetOptionIcon}>✨</Text>
            <Text style={styles.sheetOptionText}>Automatique</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Programme Modal (Création / Renommage) */}
        <CustomModal
          visible={isProgramModalVisible}
          title={isRenamingProgram ? "Renommer le programme" : "Nouveau programme"}
          onClose={() => setIsProgramModalVisible(false)}
          buttons={
            <>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.secondaryButton}]} onPress={() => setIsProgramModalVisible(false)}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.primary}]} onPress={handleSaveProgram}>
                <Text style={styles.buttonText}>Valider</Text>
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
            placeholder="ex : PPL ou Upper Lower"
          />
        </CustomModal>

        {/* Session Modal (Création / Renommage) */}
        <CustomModal
            visible={isSessionModalVisible}
            title={isRenamingSession ? "Renommer la séance" : "Ajouter une séance"}
            onClose={() => setIsSessionModalVisible(false)}
            buttons={
                <>
                <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.secondaryButton}]} onPress={() => setIsSessionModalVisible(false)}><Text style={styles.buttonText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.primary}]} onPress={handleSaveSession}><Text style={styles.buttonText}>Valider</Text></TouchableOpacity>
                </>
            }
        >
            <TextInput style={styles.input} value={sessionNameInput} onChangeText={setSessionNameInput} autoFocus placeholderTextColor={colors.textSecondary} placeholder="ex : Push ou Pull" />
        </CustomModal>

        {/* Options Programme BottomSheet */}
        <BottomSheet
          visible={isOptionsVisible}
          onClose={() => setIsOptionsVisible(false)}
          title={selectedProgram?.name}
        >
          <TouchableOpacity style={styles.sheetOption} onPress={() => { if (selectedProgram) prepareRenameProgram(selectedProgram); setIsOptionsVisible(false); if (renameTimerRef.current) clearTimeout(renameTimerRef.current); renameTimerRef.current = setTimeout(() => { setIsProgramModalVisible(true); renameTimerRef.current = null }, 300) }}>
            <Text style={styles.sheetOptionIcon}>✏️</Text><Text style={styles.sheetOptionText}>Renommer le Programme</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={handleDuplicateProgram}>
            <Text style={styles.sheetOptionIcon}>👯</Text><Text style={styles.sheetOptionText}>Dupliquer le Programme</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsOptionsVisible(false); setAlertConfig({ title: `Supprimer ${selectedProgram?.name} ?`, message: "Supprimer ce programme et toutes ses séances ?", onConfirm: async () => { await deleteProgram() } }); setIsAlertVisible(true); }}>
            <Text style={styles.sheetOptionIcon}>🗑️</Text><Text style={[styles.sheetOptionText, { color: colors.danger }]}>Supprimer le Programme</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Options Session BottomSheet */}
        <BottomSheet
          visible={isSessionOptionsVisible}
          onClose={() => setIsSessionOptionsVisible(false)}
          title={selectedSession?.name}
        >
          <TouchableOpacity style={styles.sheetOption} onPress={() => { if (selectedSession) prepareRenameSession(selectedSession); setIsSessionOptionsVisible(false); if (renameSessionTimerRef.current) clearTimeout(renameSessionTimerRef.current); renameSessionTimerRef.current = setTimeout(() => { setIsSessionModalVisible(true); renameSessionTimerRef.current = null }, 300) }}>
            <Text style={styles.sheetOptionIcon}>✏️</Text><Text style={styles.sheetOptionText}>Renommer la Séance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={handleDuplicateSession}>
            <Text style={styles.sheetOptionIcon}>👯</Text><Text style={styles.sheetOptionText}>Dupliquer la Séance</Text>
          </TouchableOpacity>
          {programs.length > 1 && (
            <>
              <Text style={styles.sectionLabel}>Déplacer vers :</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moveRow}>
                {programs.filter(p => p.id !== selectedSessionProgramId).map(p => (
                  <TouchableOpacity key={p.id} style={styles.moveChip} onPress={() => handleMoveSession(p)}>
                    <Text style={styles.moveChipText}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsSessionOptionsVisible(false); setAlertConfig({ title: `Supprimer ${selectedSession?.name} ?`, message: "Supprimer cette séance ?", onConfirm: async () => { await deleteSession() } }); setIsAlertVisible(true); }}>
            <Text style={styles.sheetOptionIcon}>🗑️</Text><Text style={[styles.sheetOptionText, { color: colors.danger }]}>Supprimer la Séance</Text>
          </TouchableOpacity>
        </BottomSheet>

        {/* Détail Programme BottomSheet */}
        <ProgramDetailBottomSheet
          program={selectedProgramForDetail}
          visible={isDetailVisible}
          onClose={() => setIsDetailVisible(false)}
          onOpenSession={(s: Session) => {
            setIsDetailVisible(false)
            navigation.navigate('SessionDetail', { sessionId: s.id })
          }}
          onAddSession={() => {
            setIsDetailVisible(false)
            if (selectedProgramForDetail) setTargetProgram(selectedProgramForDetail)
            setIsSessionModalVisible(true)
          }}
          onSessionOptions={(session: Session) => {
            setIsDetailVisible(false)
            haptics.onSelect()
            setSelectedSession(session)
            setSelectedSessionProgramId(selectedProgramForDetail?.id ?? null)
            setIsSessionOptionsVisible(true)
          }}
        />

        {/* Alerte Suppression Générique */}
        <AlertDialog
          visible={isAlertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={async () => {
            await alertConfig.onConfirm()
            setIsAlertVisible(false)
          }}
          onCancel={() => setIsAlertVisible(false)}
          confirmText="Supprimer"
          cancelText="Annuler"
        />

        {/* Alerte Erreur */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listWrapper: { flex: 1 },
  footerFloating: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 85,
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
  btnText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.md },

  // Modal styles
  input: {
    backgroundColor: colors.cardSecondary,
    color: colors.text,
    padding: spacing.ms,
    borderRadius: 10,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  modalButton: {
    flex: 0.47,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.bodyMd },

  // BottomSheet content styles
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.cardSecondary,
  },
  sheetOptionIcon: {
    fontSize: 22,
    marginRight: 20,
    width: 30,
    textAlign: 'center',
  },
  sheetOptionText: { color: colors.text, fontSize: 17, fontWeight: '500' },
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
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moveChipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
})

export { ProgramsScreen as ProgramsContent }

const EnhancedProgramsScreen = withObservables([], () => ({
  programs: database.get<Program>('programs').query(Q.sortBy('position', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(ProgramsScreen)

export default EnhancedProgramsScreen
