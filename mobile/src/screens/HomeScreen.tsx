import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Animated, ScrollView, BackHandler } from 'react-native'
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
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useMultiModalSync } from '../hooks/useModalState'
import { useProgramManager } from '../hooks/useProgramManager'
import { importPresetProgram, markOnboardingCompleted } from '../model/utils/databaseHelpers'
import type { PresetProgram } from '../model/onboardingPrograms'
import { colors } from '../theme'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface Props {
  programs: Program[]
  user: User | null
  navigation: NavigationProp
}

const HomeScreen: React.FC<Props> = ({ programs, user, navigation }) => {
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
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: async () => {} })

  // --- SYNCHRONISATION TAB BAR ---
  useMultiModalSync([
    isOnboardingVisible,
    isProgramModalVisible,
    isSessionModalVisible,
    isOptionsVisible,
    isSessionOptionsVisible,
    isAlertVisible,
  ])

  // --- GESTION BOUTON RETOUR ANDROID ---
  useEffect(() => {
    const backAction = () => {
      // Si un BottomSheet est ouvert, le fermer au lieu de naviguer
      if (isOptionsVisible) {
        setIsOptionsVisible(false)
        return true // Consomme l'événement
      }
      if (isSessionOptionsVisible) {
        setIsSessionOptionsVisible(false)
        return true
      }
      return false // Laisse le comportement par défaut
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [isOptionsVisible, isSessionOptionsVisible])

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
      console.error('[HomeScreen] Erreur import programme :', error)
      // Ne pas appeler markOnboardingCompleted en cas d'erreur (AC8)
    }
  }

  const handleSkipOnboarding = async () => {
    await markOnboardingCompleted()
    setIsOnboardingVisible(false)
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

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Program>) => (
    <ScaleDecorator>
      <View style={{ opacity: isActive ? 0.8 : 1 }}>
        <ProgramSection
          program={item}
          sessions={[]}
          onOpenSession={(s: Session) => navigation.navigate('SessionDetail', { sessionId: s.id })}
          onLongPressProgram={drag}
          onAddSession={() => {
            setTargetProgram(item)
            setIsSessionModalVisible(true)
          }}
          onOptionsPress={() => {
            haptics.onSelect()
            setSelectedProgram(item)
            setIsOptionsVisible(true)
          }}
          onSessionOptionsPress={(session: Session) => {
            haptics.onSelect()
            setSelectedSession(session)
            setSelectedSessionProgramId(item.id)
            setIsSessionOptionsVisible(true)
          }}
        />
      </View>
    </ScaleDecorator>
  ), [navigation, haptics])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
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
                console.error('[HomeScreen] Drag-and-drop batch update failed:', error)
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
              setIsProgramModalVisible(true)
            }}
          >
            <Text style={styles.btnText}>📂 Créer un Programme</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* --- MODALES --- */}

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
          <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsOptionsVisible(false); if (selectedProgram) prepareRenameProgram(selectedProgram); setIsProgramModalVisible(true) }}>
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
          <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsSessionOptionsVisible(false); if (selectedSession) prepareRenameSession(selectedSession); setIsSessionModalVisible(true) }}>
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  btnText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },

  // Modal styles
  input: {
    backgroundColor: colors.cardSecondary,
    color: colors.text,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  modalButton: {
    flex: 0.47,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontWeight: 'bold', fontSize: 15 },

  // BottomSheet content styles
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
    fontSize: 12,
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
  moveChipText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
})

export default withObservables([], () => ({
  programs: database.get<Program>('programs').query(Q.sortBy('position', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(HomeScreen)