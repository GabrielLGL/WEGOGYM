import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import User from '../model/models/User'
import { SessionExerciseItem } from '../components/SessionExerciseItem'
import { ExerciseTargetInputs } from '../components/ExerciseTargetInputs'
import { ExercisePickerModal } from '../components/ExercisePickerModal'
import { map } from 'rxjs/operators'
import { CustomModal } from '../components/CustomModal'
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
import { useSessionManager } from '../hooks/useSessionManager'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '../components/BottomSheet'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { fontSize, spacing, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  session: Session
  sessionExercises: SessionExercise[]
  exercises: Exercise[]
  user: User | null
  navigation: NativeStackNavigationProp<RootStackParamList>
}

export const SessionDetailContent: React.FC<Props> = ({ session, sessionExercises, exercises, navigation }) => {
  // --- HOOKS ---
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const { t } = useLanguage()
  const {
    // Target inputs states
    targetSets,
    setTargetSets,
    targetReps,
    setTargetReps,
    targetWeight,
    setTargetWeight,
    targetRestTime,
    setTargetRestTime,
    isFormValid,
    // Selected exercise
    selectedSessionExercise,
    setSelectedSessionExercise,
    // Operations
    addExercise,
    updateTargets,
    removeExercise,
    prepareEditTargets,
    resetTargets,
    reorderExercises,
    groupExercises,
    ungroupExercise,
  } = useSessionManager(session, haptics.onSuccess)

  // --- ÉTATS LOCAUX ---
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void | Promise<void>
  }>({ title: '', message: '', onConfirm: async () => {} })

  // --- SUPERSET SELECTION MODE ---
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isGroupTypeVisible, setIsGroupTypeVisible] = useState(false)

  const toggleSelection = (se: SessionExercise) => {
    if (!selectionMode) {
      setSelectionMode(true)
      setSelectedItems(new Set([se.id]))
      return
    }
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(se.id)) {
        next.delete(se.id)
      } else {
        next.add(se.id)
      }
      if (next.size === 0) setSelectionMode(false)
      return next
    })
  }

  const cancelSelection = () => {
    setSelectionMode(false)
    setSelectedItems(new Set())
  }

  const handleCreateGroup = async (type: 'superset' | 'circuit') => {
    const items = sessionExercises.filter(se => selectedItems.has(se.id))
    if (items.length < 2) return
    await groupExercises(items, type)
    setIsGroupTypeVisible(false)
    cancelSelection()
  }

  const handleUngroup = async (se: SessionExercise) => {
    haptics.onPress()
    await ungroupExercise(se, sessionExercises)
  }

  const getGroupInfo = (se: SessionExercise): { type: string; isFirst: boolean; isLast: boolean } | undefined => {
    if (!se.supersetId) return undefined
    const groupMembers = sessionExercises
      .filter(s => s.supersetId === se.supersetId)
      .sort((a, b) => (a.supersetPosition ?? 0) - (b.supersetPosition ?? 0))
    const idx = groupMembers.findIndex(s => s.id === se.id)
    return {
      type: se.supersetType ?? 'superset',
      isFirst: idx === 0,
      isLast: idx === groupMembers.length - 1,
    }
  }

  useLayoutEffect(() => { navigation.setOptions({ title: session.name, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }) }, [navigation, session.name, colors])

  // --- HANDLERS ---
  const handleAddExercise = async (exerciseId: string, sets: string, reps: string, weight: string) => {
    const exo = exercises.find(e => e.id === exerciseId)
    if (!exo) return

    try {
      const success = await addExercise(exerciseId, sets, reps, weight, exo)
      if (success) {
        setIsAddModalVisible(false)
      }
    } catch (e) {
      if (__DEV__) console.error('handleAddExercise error:', e)
    }
  }

  const handleUpdateTargets = async () => {
    try {
      const success = await updateTargets()
      if (success) {
        setIsEditModalVisible(false)
      }
    } catch (e) {
      if (__DEV__) console.error('handleUpdateTargets error:', e)
    }
  }

  const showRemoveAlert = useCallback((se: SessionExercise, exoName: string) => {
    setAlertConfig({
      title: `${t.sessionDetail.delete} ${exoName} ?`,
      message: t.sessionDetail.removeConfirmMessage,
      onConfirm: async () => {
        await removeExercise(se)
      }
    })
    setIsAlertVisible(true)
  }, [t, removeExercise])

  const handleEditTargets = useCallback((se: SessionExercise) => {
    haptics.onPress()
    prepareEditTargets(se)
    setIsEditModalVisible(true)
  }, [haptics, prepareEditTargets])

  const renderDraggableItem = useCallback(({ item, drag, isActive }: RenderItemParams<SessionExercise>) => (
    <SessionExerciseItem
      item={item}
      drag={drag}
      dragActive={isActive}
      selectionMode={selectionMode}
      isSelected={selectedItems.has(item.id)}
      onSelect={toggleSelection}
      groupInfo={getGroupInfo(item)}
      onUngroup={handleUngroup}
      onEditTargets={handleEditTargets}
      onRemove={showRemoveAlert}
    />
  ), [selectionMode, selectedItems, toggleSelection, getGroupInfo, handleUngroup, handleEditTargets, showRemoveAlert])

  return (
    <SafeAreaView style={styles.container}>
      {/* --- BARRE DE SÉLECTION SUPERSET --- */}
      {selectionMode && (
        <View style={styles.selectionBar}>
          <TouchableOpacity onPress={cancelSelection} style={styles.selectionBarBtn}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.selectionBarText}>
            {selectedItems.size} {t.sessionDetail.superset.selectExercises}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (selectedItems.size < 2) return
              setIsGroupTypeVisible(true)
            }}
            style={[styles.selectionBarCreateBtn, selectedItems.size < 2 && { opacity: 0.4 }]}
            disabled={selectedItems.size < 2}
          >
            <Ionicons name="link" size={18} color={colors.background} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listWrapper}>
        <DraggableFlatList
          data={sessionExercises}
          keyExtractor={item => item.id}
          renderItem={renderDraggableItem}
          onDragEnd={({ data }) => reorderExercises(data)}
          contentContainerStyle={{ paddingHorizontal: 0, paddingTop: FOOTER_PADDING_TOP, paddingBottom: LIST_PADDING_BOTTOM }}
          ListEmptyComponent={<Text style={styles.emptyText}>{t.sessionDetail.noExercises}</Text>}
        />
      </View>

      <View style={styles.footerContainer}>
        {!selectionMode && (
          <>
            <TouchableOpacity
              style={[styles.launchButton, sessionExercises.length === 0 && { opacity: 0.4 }]}
              onPress={() => {
                haptics.onPress()
                navigation.navigate('Workout', { sessionId: session.id })
              }}
              disabled={sessionExercises.length === 0}
            >
              <Text style={styles.launchButtonText}>{t.sessionDetail.startWorkout}</Text>
            </TouchableOpacity>
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[styles.addButton, { flex: 1 }]}
                onPress={() => {
                  haptics.onPress()
                  setIsAddModalVisible(true)
                }}
              >
                <Text style={styles.addButtonText}>{t.sessionDetail.addExercise}</Text>
              </TouchableOpacity>
              {sessionExercises.length >= 2 && (
                <TouchableOpacity
                  style={styles.supersetButton}
                  onPress={() => {
                    haptics.onPress()
                    setSelectionMode(true)
                  }}
                >
                  <Ionicons name="link" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* --- MODALE AJOUT EXERCICE --- */}
      <ExercisePickerModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        exercises={exercises}
        onAdd={handleAddExercise}
        onHapticSelect={haptics.onSelect}
      />

      {/* --- MODALE Alerte Suppression --- */}
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

      {/* --- MODALE Edition (CustomModal) --- */}
      <CustomModal
        visible={isEditModalVisible}
        title={t.sessionDetail.editTarget}
        onClose={() => setIsEditModalVisible(false)}
        buttons={
            <>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.cancelBtn}><Text style={styles.btnText}>{t.common.cancel}</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleUpdateTargets} style={[styles.confirmBtn, !isFormValid && { opacity: 0.3 }]} disabled={!isFormValid}><Text style={styles.btnText}>{t.common.save}</Text></TouchableOpacity>
            </>
        }
      >
        <ExerciseTargetInputs
          sets={targetSets}
          reps={targetReps}
          weight={targetWeight}
          onSetsChange={setTargetSets}
          onRepsChange={setTargetReps}
          onWeightChange={setTargetWeight}
          autoFocus
        />
        <View>
          <Text style={styles.restTimeLabel}>{t.sessionDetail.restTime}</Text>
          <TextInput
            style={styles.restTimeInput}
            keyboardType="numeric"
            value={targetRestTime}
            onChangeText={setTargetRestTime}
            placeholder={t.sessionDetail.restTimePlaceholder}
            placeholderTextColor={colors.placeholder}
          />
          <Text style={styles.restTimeHelper}>{t.sessionDetail.restTimeHelper}</Text>
        </View>
      </CustomModal>

      {/* --- BOTTOM SHEET TYPE DE GROUPE --- */}
      <BottomSheet
        visible={isGroupTypeVisible}
        onClose={() => setIsGroupTypeVisible(false)}
        title={t.sessionDetail.superset.groupTypeTitle}
      >
        <TouchableOpacity
          style={styles.sheetOption}
          onPress={() => handleCreateGroup('superset')}
        >
          <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
          <View style={styles.sheetOptionText}>
            <Text style={styles.sheetOptionTitle}>{t.sessionDetail.superset.supersetLabel}</Text>
            <Text style={styles.sheetOptionDesc}>{t.sessionDetail.superset.supersetDesc}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sheetOption}
          onPress={() => handleCreateGroup('circuit')}
        >
          <Ionicons name="repeat" size={22} color={colors.warning} />
          <View style={styles.sheetOptionText}>
            <Text style={styles.sheetOptionTitle}>{t.sessionDetail.superset.circuitLabel}</Text>
            <Text style={styles.sheetOptionDesc}>{t.sessionDetail.superset.circuitDesc}</Text>
          </View>
        </TouchableOpacity>
      </BottomSheet>

    </SafeAreaView>
  )
}

const SCREEN_PADDING_H = 20
const FOOTER_PADDING_BOTTOM = 30
const FOOTER_PADDING_TOP = 10
const BTN_PADDING = 18
const BTN_MARGIN_BOTTOM = 10
const LIST_PADDING_BOTTOM = 20

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listWrapper: { flex: 1 },
    emptyText: { color: colors.placeholder, textAlign: 'center', marginTop: 50, fontSize: fontSize.md, fontStyle: 'italic' },

    footerContainer: { paddingHorizontal: SCREEN_PADDING_H, paddingBottom: FOOTER_PADDING_BOTTOM, paddingTop: FOOTER_PADDING_TOP, borderTopWidth: 1, borderTopColor: colors.card },
    launchButton: { backgroundColor: colors.primary, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: BTN_MARGIN_BOTTOM },
    launchButtonText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.sm },
    addButton: { backgroundColor: colors.cardSecondary, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    addButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: fontSize.sm },

    // Selection bar
    selectionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectionBarBtn: { padding: spacing.sm },
    selectionBarText: { flex: 1, color: colors.text, fontSize: fontSize.sm, marginLeft: spacing.sm },
    selectionBarCreateBtn: {
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Footer row
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    supersetButton: {
      backgroundColor: colors.cardSecondary,
      width: 50,
      height: 50,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Group type sheet
    sheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    sheetOptionText: { flex: 1 },
    sheetOptionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
    sheetOptionDesc: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },

    // Rest time input
    restTimeLabel: { color: colors.textSecondary, marginBottom: spacing.xs, fontSize: fontSize.xs },
    restTimeInput: { backgroundColor: colors.cardSecondary, color: colors.text, padding: spacing.ms, borderRadius: borderRadius.sm, fontSize: fontSize.md, marginBottom: spacing.xs },
    restTimeHelper: { color: colors.placeholder, fontSize: fontSize.caption, marginBottom: spacing.md },

    // Modal Edit Styles
    confirmBtn: { flex: 0.48, backgroundColor: colors.primary, padding: spacing.ms, borderRadius: borderRadius.sm, alignItems: 'center' },
    cancelBtn: { flex: 0.48, backgroundColor: colors.secondaryButton, padding: spacing.ms, borderRadius: borderRadius.sm, alignItems: 'center' },
    btnText: { color: colors.text, fontWeight: 'bold' },
  }), [colors])
}

const ObservableSessionDetailContent = withObservables(['route'], ({ route }: { route: RouteProp<RootStackParamList, 'SessionDetail'> }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database.get<SessionExercise>('session_exercises').query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc)).observe(),
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null))
}))(SessionDetailContent)

const SessionDetailScreen = ({ route, navigation }: {
  route: RouteProp<RootStackParamList, 'SessionDetail'>
  navigation: NativeStackNavigationProp<RootStackParamList>
}) => {
  const colors = useColors()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableSessionDetailContent route={route} navigation={navigation} />}
    </View>
  )
}

export default SessionDetailScreen
