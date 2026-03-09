import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, FlatList, ScrollView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { database } from '../model/index'
import Program from '../model/models/Program'
import Session from '../model/models/Session'
import { SessionPreviewRow } from '../components/ProgramDetailBottomSheet'
import { BottomSheet } from '../components/BottomSheet'
import { CustomModal } from '../components/CustomModal'
import { AlertDialog } from '../components/AlertDialog'
import { useProgramManager } from '../hooks/useProgramManager'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { RootStackParamList } from '../navigation/index'
import { fontSize, spacing, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'

interface Props {
  program: Program
  sessions: Session[]
  programs: Program[]
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProgramDetail'>
  route: RouteProp<RootStackParamList, 'ProgramDetail'>
}

const ProgramDetailScreenInner: React.FC<Props> = ({ program, sessions, programs, navigation }) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const { t } = useLanguage()

  const {
    sessionNameInput,
    setSessionNameInput,
    isRenamingSession,
    setIsRenamingSession,
    selectedSession,
    setSelectedSession,
    setTargetProgram,
    saveSession,
    duplicateSession,
    deleteSession,
    moveSession,
    prepareRenameSession,
  } = useProgramManager(haptics.onSuccess)

  const sessionModal = useModalState()
  const sessionOptionsModal = useModalState()
  const addChoiceModal = useModalState()
  const alertModal = useModalState()
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: async () => {} })

  const renameSessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    navigation.setOptions({ title: program.name })
  }, [navigation, program.name])

  useEffect(() => {
    return () => {
      if (renameSessionTimerRef.current) clearTimeout(renameSessionTimerRef.current)
    }
  }, [])

  const handleAddSession = useCallback(() => {
    haptics.onPress()
    addChoiceModal.open()
  }, [haptics])

  const handleAddSessionManual = useCallback(() => {
    addChoiceModal.close()
    setTargetProgram(program)
    setIsRenamingSession(false)
    setSessionNameInput('')
    sessionModal.open()
  }, [program, setTargetProgram, setIsRenamingSession, setSessionNameInput])

  const handleAddSessionAI = useCallback(() => {
    haptics.onPress()
    addChoiceModal.close()
    navigation.navigate('Assistant', { sessionMode: { targetProgramId: program.id } })
  }, [haptics, navigation, program.id])

  const handleSaveSession = async () => {
    try {
      const success = await saveSession()
      if (success) {
        sessionModal.close()
      }
    } catch (e) {
      if (__DEV__) console.error('[ProgramDetail] handleSaveSession:', e)
    }
  }

  const handleSessionOptions = useCallback((session: Session) => {
    haptics.onSelect()
    setSelectedSession(session)
    sessionOptionsModal.open()
  }, [haptics, setSelectedSession])

  const handleDuplicateSession = async () => {
    try {
      sessionOptionsModal.close()
      await duplicateSession()
    } catch (e) {
      if (__DEV__) console.error('[ProgramDetail] handleDuplicateSession:', e)
    }
  }

  const handleMoveSession = async (targetProg: Program) => {
    try {
      await moveSession(targetProg)
      sessionOptionsModal.close()
    } catch (e) {
      if (__DEV__) console.error('[ProgramDetail] handleMoveSession:', e)
    }
  }

  const renderSession = useCallback(({ item }: { item: Session }) => (
    <SessionPreviewRow
      session={item}
      onPress={() => {
        haptics.onPress()
        navigation.navigate('SessionDetail', { sessionId: item.id })
      }}
      onOptionsPress={() => handleSessionOptions(item)}
    />
  ), [haptics, navigation, handleSessionOptions])

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t.programDetail.noSessions}</Text>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddSession}>
            <Text style={styles.addButtonText}>{t.programDetail.addSession}</Text>
          </TouchableOpacity>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      {/* Choix ajout séance : manuel ou IA */}
      <BottomSheet
        visible={addChoiceModal.isOpen}
        onClose={addChoiceModal.close}
        title={t.programDetail.addSessionTitle}
      >
        <TouchableOpacity style={styles.sheetOption} onPress={handleAddSessionManual}>
          <Ionicons name="pencil-outline" size={20} color={colors.text} style={styles.sheetIcon} />
          <View>
            <Text style={styles.sheetOptionText}>{t.programDetail.createManually}</Text>
            <Text style={styles.sheetOptionSub}>{t.programDetail.createManuallyDesc}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sheetOption} onPress={handleAddSessionAI}>
          <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} style={styles.sheetIcon} />
          <View>
            <Text style={styles.sheetOptionText}>{t.programDetail.generateWithAI}</Text>
            <Text style={styles.sheetOptionSub}>{t.programDetail.generateWithAIDesc}</Text>
          </View>
        </TouchableOpacity>
      </BottomSheet>

      {/* Options Séance BottomSheet */}
      <BottomSheet
        visible={sessionOptionsModal.isOpen}
        onClose={sessionOptionsModal.close}
        title={selectedSession?.name}
      >
        <TouchableOpacity
          style={styles.sheetOption}
          onPress={() => {
            if (selectedSession) prepareRenameSession(selectedSession)
            sessionOptionsModal.close()
            if (renameSessionTimerRef.current) clearTimeout(renameSessionTimerRef.current)
            renameSessionTimerRef.current = setTimeout(() => {
              sessionModal.open()
              renameSessionTimerRef.current = null
            }, 300)
          }}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: spacing.lg, width: 30 }} />
          <Text style={styles.sheetOptionText}>{t.programDetail.renameSession}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sheetOption} onPress={handleDuplicateSession}>
          <Ionicons name="copy-outline" size={20} color={colors.text} style={{ marginRight: spacing.lg, width: 30 }} />
          <Text style={styles.sheetOptionText}>{t.programDetail.duplicateSession}</Text>
        </TouchableOpacity>
        {programs.length > 1 && (
          <>
            <Text style={styles.sectionLabel}>{t.programDetail.moveTo}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moveRow}>
              {programs.filter(p => p.id !== program.id).map(p => (
                <TouchableOpacity key={p.id} style={styles.moveChip} onPress={() => handleMoveSession(p)}>
                  <Text style={styles.moveChipText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        <TouchableOpacity
          style={styles.sheetOption}
          onPress={() => {
            sessionOptionsModal.close()
            setAlertConfig({
              title: `${t.common.delete} ${selectedSession?.name} ?`,
              message: `${t.common.delete} ?`,
              onConfirm: async () => { await deleteSession() },
            })
            alertModal.open()
          }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: spacing.lg, width: 30 }} />
          <Text style={[styles.sheetOptionText, { color: colors.danger }]}>{t.programDetail.deleteSession}</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Session Modal (Création / Renommage) */}
      <CustomModal
        visible={sessionModal.isOpen}
        title={isRenamingSession ? t.programDetail.renameSessionTitle : t.programDetail.addSessionTitle}
        onClose={sessionModal.close}
        buttons={
          <>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.secondaryButton }]}
              onPress={sessionModal.close}
            >
              <Text style={styles.buttonText}>{t.common.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveSession}
            >
              <Text style={styles.buttonTextPrimary}>{t.common.validate}</Text>
            </TouchableOpacity>
          </>
        }
      >
        <TextInput
          style={styles.input}
          value={sessionNameInput}
          onChangeText={setSessionNameInput}
          autoFocus
          placeholderTextColor={colors.textSecondary}
          placeholder={t.programDetail.sessionNamePlaceholder}
        />
      </CustomModal>

      {/* AlertDialog Suppression */}
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
    </SafeAreaView>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: spacing.md, paddingBottom: 100 },
    emptyText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    addButton: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.cardSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: fontSize.sm,
    },
    sheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.cardSecondary,
    },
    sheetOptionText: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
    sheetOptionSub: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
    sheetIcon: { marginRight: spacing.ms, width: 28 },
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
  }), [colors])
}

export { ProgramDetailScreenInner }

const ObservableProgramDetailContent = withObservables(
  ['route'],
  ({ route }: { route: RouteProp<RootStackParamList, 'ProgramDetail'> }) => ({
    program: database.get<Program>('programs').findAndObserve(route.params.programId),
    sessions: database.get<Session>('sessions').query(
      Q.where('program_id', route.params.programId),
      Q.sortBy('position', Q.asc)
    ).observe(),
    programs: database.get<Program>('programs').query(Q.sortBy('position', Q.asc)).observe(),
  })
)(ProgramDetailScreenInner)

const ProgramDetailScreen = ({ route, navigation }: {
  route: RouteProp<RootStackParamList, 'ProgramDetail'>
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProgramDetail'>
}) => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableProgramDetailContent route={route} navigation={navigation} />}
    </View>
  )
}

export default ProgramDetailScreen
