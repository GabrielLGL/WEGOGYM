import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Animated, LayoutAnimation, UIManager, Platform } from 'react-native'
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
import { CustomModal } from '../components/CustomModal'
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useSessionManager } from '../hooks/useSessionManager'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '../components/BottomSheet'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { fontSize, spacing, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import History from '../model/models/History'
import { predictSessionDuration, DurationPrediction } from '../model/utils/durationPredictorHelpers'

const TOAST_FADE_IN = 200
const TOAST_FADE_OUT = 300
const TOAST_DURATION = 2000
const SELECTION_BADGE_SIZE = 28

interface Props {
  session: Session
  sessionExercises: SessionExercise[]
  exercises: Exercise[]
  user: User | null
  navigation: NativeStackNavigationProp<RootStackParamList>
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const SessionDetailContent: React.FC<Props> = ({ session, sessionExercises, exercises, navigation }) => {
  // --- HOOKS ---
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const { t } = useLanguage()
  const { showToast } = useToast()
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
    // Operations
    addExercise,
    updateTargets,
    removeExercise,
    prepareEditTargets,
    reorderExercises,
    groupExercises,
    ungroupExercise,
  } = useSessionManager(session, haptics.onSuccess)

  // --- ÉTATS LOCAUX ---
  const addModal = useModalState()
  const editModal = useModalState()
  const alertModal = useModalState()
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string }>({ title: '', message: '' })
  const alertConfirmRef = useRef<() => void | Promise<unknown>>(() => {})

  // --- DURATION PREDICTION ---
  const [histories, setHistories] = useState<History[]>([])
  useEffect(() => {
    let cancelled = false
    database.get<History>('histories')
      .query(Q.where('session_id', session.id))
      .fetch()
      .then(results => { if (!cancelled) setHistories(results) })
    return () => { cancelled = true }
  }, [session.id])

  const prediction: DurationPrediction | null = useMemo(() => {
    if (sessionExercises.length === 0) return null
    return predictSessionDuration(sessionExercises.length, histories, session.id)
  }, [sessionExercises.length, histories, session.id])

  // --- SUPERSET SELECTION MODE ---
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const groupTypeModal = useModalState()

  // --- TOAST FEEDBACK ---
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!toastMessage) return
    const fadeIn = Animated.timing(toastOpacity, { toValue: 1, duration: TOAST_FADE_IN, useNativeDriver: true })
    let fadeOut: Animated.CompositeAnimation | null = null
    fadeIn.start()
    const timer = setTimeout(() => {
      fadeOut = Animated.timing(toastOpacity, { toValue: 0, duration: TOAST_FADE_OUT, useNativeDriver: true })
      fadeOut.start(() => {
        setToastMessage(null)
      })
    }, TOAST_DURATION)
    return () => {
      clearTimeout(timer)
      fadeIn.stop()
      fadeOut?.stop()
    }
  }, [toastMessage, toastOpacity])

  const toggleSelection = useCallback((se: SessionExercise) => {
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
  }, [selectionMode])

  const cancelSelection = useCallback(() => {
    haptics.onPress()
    setSelectionMode(false)
    setSelectedItems(new Set())
  }, [haptics])

  const handleCreateGroup = useCallback(async (type: 'superset' | 'circuit') => {
    try {
      const items = sessionExercises.filter(se => selectedItems.has(se.id))
      if (items.length < 2) return
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      await groupExercises(items, type)
      groupTypeModal.close()
      cancelSelection()
      setToastMessage(t.sessionDetail.superset.groupCreated)
    } catch (e) {
      if (__DEV__) console.warn('handleCreateGroup error:', e)
      setToastMessage(t.common.error)
    }
  }, [sessionExercises, selectedItems, groupExercises, groupTypeModal, cancelSelection, t])

  const handleUngroup = useCallback(async (se: SessionExercise) => {
    try {
      haptics.onPress()
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      await ungroupExercise(se, sessionExercises)
      setToastMessage(t.sessionDetail.superset.groupRemoved)
    } catch (e) {
      if (__DEV__) console.warn('handleUngroup error:', e)
      setToastMessage(t.common.error)
    }
  }, [haptics, ungroupExercise, sessionExercises, t])

  const getGroupInfo = useCallback((se: SessionExercise): { type: string; isFirst: boolean; isLast: boolean } | undefined => {
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
  }, [sessionExercises])

  useLayoutEffect(() => { navigation.setOptions({ title: session.name, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }) }, [navigation, session.name, colors])

  // --- HANDLERS ---
  const handleAddExercise = useCallback(async (exerciseId: string, sets: string, reps: string, weight: string) => {
    const exo = exercises.find(e => e.id === exerciseId)
    if (!exo) return

    try {
      const success = await addExercise(exerciseId, sets, reps, weight, exo)
      if (success) {
        addModal.close()
        showToast({ message: t.toasts.exerciseAdded })
      }
    } catch (e) {
      if (__DEV__) console.error('handleAddExercise error:', e)
    }
  }, [exercises, addExercise, addModal, showToast, t])

  const handleUpdateTargets = useCallback(async () => {
    try {
      const success = await updateTargets()
      if (success) {
        editModal.close()
      }
    } catch (e) {
      if (__DEV__) console.error('handleUpdateTargets error:', e)
    }
  }, [updateTargets, editModal])

  const showRemoveAlert = useCallback((se: SessionExercise, exoName: string) => {
    alertConfirmRef.current = async () => {
      await removeExercise(se)
      showToast({ message: t.toasts.exerciseRemoved })
    }
    setAlertConfig({
      title: `${t.sessionDetail.delete} ${exoName} ?`,
      message: t.sessionDetail.removeConfirmMessage,
    })
    alertModal.open()
  }, [t, removeExercise, alertModal, showToast])

  const handleEditTargets = useCallback((se: SessionExercise) => {
    haptics.onPress()
    prepareEditTargets(se)
    editModal.open()
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
            {t.sessionDetail.superset.selectInstruction}
          </Text>
          <View style={styles.selectionBarBadge}>
            <Text style={styles.selectionBarBadgeText}>{selectedItems.size}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (selectedItems.size < 2) return
              groupTypeModal.open()
            }}
            style={[styles.selectionBarCreateBtn, selectedItems.size < 2 && { opacity: 0.4 }]}
            disabled={selectedItems.size < 2}
          >
            <Ionicons name="checkmark" size={18} color={colors.primaryText} />
            <Text style={styles.selectionBarCreateText}>{t.common.confirm}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listWrapper}>
        <DraggableFlatList
          data={sessionExercises}
          keyExtractor={item => item.id}
          renderItem={renderDraggableItem}
          onDragEnd={({ data }) => reorderExercises(data)}
          extraData={sessionExercises.map(se => `${se.id}:${se.supersetId ?? ''}`).join(',')}
          contentContainerStyle={{ paddingHorizontal: 0, paddingTop: spacing.sm, paddingBottom: spacing.lg }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={48} color={colors.placeholder} />
              <Text style={styles.emptyText}>{t.sessionDetail.noExercises}</Text>
            </View>
          }
          ListFooterComponent={
            sessionExercises.length >= 2 && !sessionExercises.some(se => se.supersetId) ? (
              <Text style={styles.hintText}>{t.sessionDetail.superset.hint}</Text>
            ) : null
          }
        />
      </View>

      <View style={styles.footerContainer}>
        {!selectionMode && (
          <>
            {prediction && (
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.durationText}>
                  {t.sessionDetail.duration.estimate} : ~{prediction.estimatedMinutes} min
                </Text>
                <View style={[
                  styles.durationBadge,
                  prediction.confidence === 'high' && { backgroundColor: colors.primary + '22' },
                  prediction.confidence === 'medium' && { backgroundColor: colors.warning + '22' },
                  prediction.confidence === 'low' && { backgroundColor: colors.textSecondary + '22' },
                ]}>
                  <Text style={[
                    styles.durationBadgeText,
                    prediction.confidence === 'high' && { color: colors.primary },
                    prediction.confidence === 'medium' && { color: colors.warning },
                    prediction.confidence === 'low' && { color: colors.textSecondary },
                  ]}>
                    {t.sessionDetail.duration.confidence[prediction.confidence]}
                  </Text>
                </View>
              </View>
            )}
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
                  addModal.open()
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
                  <Ionicons name="link" size={16} color={colors.primary} />
                  <Text style={styles.supersetButtonText}>{t.sessionDetail.superset.groupButton}</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* --- MODALE AJOUT EXERCICE --- */}
      <ExercisePickerModal
        visible={addModal.isOpen}
        onClose={addModal.close}
        exercises={exercises}
        onAdd={handleAddExercise}
        onHapticSelect={haptics.onSelect}
      />

      {/* --- MODALE Alerte Suppression --- */}
      <AlertDialog
        visible={alertModal.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={async () => {
          try {
            await alertConfirmRef.current()
          } finally {
            alertModal.close()
          }
        }}
        onCancel={alertModal.close}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
      />

      {/* --- MODALE Edition (CustomModal) --- */}
      <CustomModal
        visible={editModal.isOpen}
        title={t.sessionDetail.editTarget}
        onClose={editModal.close}
        buttons={
            <>
            <TouchableOpacity onPress={editModal.close} style={styles.cancelBtn}><Text style={styles.btnText}>{t.common.cancel}</Text></TouchableOpacity>
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
        visible={groupTypeModal.isOpen}
        onClose={groupTypeModal.close}
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

      {/* --- TOAST FEEDBACK --- */}
      {toastMessage && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

    </SafeAreaView>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listWrapper: { flex: 1 },
    emptyContainer: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.ms },
    emptyText: { color: colors.placeholder, textAlign: 'center', fontSize: fontSize.md, fontStyle: 'italic' },

    footerContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.card },
    launchButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.sm },
    launchButtonText: { color: colors.primaryText, fontWeight: 'bold', fontSize: fontSize.sm },
    addButton: { backgroundColor: colors.cardSecondary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
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
    selectionBarBadge: {
      backgroundColor: colors.primary,
      width: SELECTION_BADGE_SIZE,
      height: SELECTION_BADGE_SIZE,
      borderRadius: SELECTION_BADGE_SIZE / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    selectionBarBadgeText: { color: colors.primaryText, fontSize: fontSize.xs, fontWeight: 'bold' },
    selectionBarCreateBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      height: 44,
      borderRadius: borderRadius.xl,
      gap: spacing.xs,
    },
    selectionBarCreateText: { color: colors.primaryText, fontSize: fontSize.sm, fontWeight: '600' },

    // Footer row
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    supersetButton: {
      backgroundColor: colors.cardSecondary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      height: 50,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    supersetButtonText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },

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
    sheetOptionDesc: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: borderRadius.xxs },

    // Rest time input
    restTimeLabel: { color: colors.textSecondary, marginBottom: spacing.xs, fontSize: fontSize.xs },
    restTimeInput: { backgroundColor: colors.cardSecondary, color: colors.text, padding: spacing.ms, borderRadius: borderRadius.sm, fontSize: fontSize.md, marginBottom: spacing.xs },
    restTimeHelper: { color: colors.placeholder, fontSize: fontSize.caption, marginBottom: spacing.md },

    // Modal Edit Styles
    confirmBtn: { flex: 0.48, backgroundColor: colors.primary, padding: spacing.ms, borderRadius: borderRadius.sm, alignItems: 'center' },
    cancelBtn: { flex: 0.48, backgroundColor: colors.secondaryButton, padding: spacing.ms, borderRadius: borderRadius.sm, alignItems: 'center' },
    btnText: { color: colors.text, fontWeight: 'bold' },

    // Toast
    toast: {
      position: 'absolute',
      bottom: spacing.xxl,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.primary,
      paddingVertical: spacing.ms,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    toastText: { color: colors.primaryText, fontSize: fontSize.sm, fontWeight: '600' },

    // Duration predictor
    durationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      paddingVertical: spacing.xs,
    },
    durationText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    durationBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.xs,
    },
    durationBadgeText: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },

    // Hint
    hintText: {
      color: colors.placeholder,
      fontSize: fontSize.xs,
      textAlign: 'center',
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
  }), [colors])
}

const ObservableSessionDetailContent = withObservables(['route'], ({ route }: { route: RouteProp<RootStackParamList, 'SessionDetail'> }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database.get<SessionExercise>('session_exercises').query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc)).observe(),
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe(),
  user: observeCurrentUser()
}))(SessionDetailContent)

const SessionDetailScreen = ({ route, navigation }: {
  route: RouteProp<RootStackParamList, 'SessionDetail'>
  navigation: NativeStackNavigationProp<RootStackParamList>
}) => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableSessionDetailContent route={route} navigation={navigation} />}
    </View>
  )
}

export default SessionDetailScreen
