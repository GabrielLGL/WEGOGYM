import React, { useState, useEffect, useLayoutEffect, useCallback, memo, useRef, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SectionList, TextInput, SafeAreaView, ScrollView, Animated, Platform, BackHandler, Keyboard } from 'react-native'
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Exercise from '../model/models/Exercise'
import SetModel from '../model/models/Set'
import { computeExerciseMastery } from '../model/utils/exerciseMasteryHelpers'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation'
import { CustomModal } from '../components/CustomModal'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { ChipSelector } from '../components/ChipSelector'
import { ExerciseInfoSheet } from '../components/ExerciseInfoSheet'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useExerciseManager } from '../hooks/useExerciseManager'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { fontSize, spacing, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'

type ExercisesNavigation = NativeStackNavigationProp<RootStackParamList>

interface Props { exercises: Exercise[]; sets: SetModel[] }

interface ExerciseItemProps {
  item: Exercise
  onOptionsPress: (item: Exercise) => void
  onPress: (item: Exercise) => void
  onFavoriteToggle: (item: Exercise) => void
  colors: ThemeColors
  masteryLevel?: number
}

function getMasteryColor(level: number, colors: ThemeColors): string {
  if (level <= 2) return colors.textSecondary
  if (level === 3) return colors.gold
  if (level === 4) return colors.primary
  return colors.purple
}

const ExerciseItem = memo<ExerciseItemProps>(
  function ExerciseItem({ item, onOptionsPress, onPress, onFavoriteToggle, colors, masteryLevel }) {
    const styles = useExerciseItemStyles(colors)
    const { t } = useLanguage()
    const muscleNames = item.muscles?.map(m => t.muscleNames[m as keyof typeof t.muscleNames] ?? m) ?? []
    const equipmentLabel = t.equipmentNames[item.equipment as keyof typeof t.equipmentNames] ?? item.equipment
    return (
      <TouchableOpacity style={styles.exoItem} onPress={() => onPress(item)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={item.name} accessibilityHint={muscleNames.join(', ')}>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => onFavoriteToggle(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={item.isFavorite ? colors.danger : colors.border}
          />
        </TouchableOpacity>
        <View style={styles.exoInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.exoTitle}>{item.name}</Text>
            {masteryLevel != null && masteryLevel > 0 && (
              <View style={styles.masteryBadge}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons
                    key={i}
                    name={i < masteryLevel ? 'star' : 'star-outline'}
                    size={10}
                    color={i < masteryLevel ? getMasteryColor(masteryLevel, colors) : colors.border}
                  />
                ))}
              </View>
            )}
          </View>
          <Text style={styles.exoSubtitle}>{muscleNames.join(', ')} • {equipmentLabel}</Text>
        </View>
        {item.isCustom && (
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => onOptionsPress(item)}
          >
            <Text style={styles.moreIcon}>•••</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.item.name === next.item.name &&
    prev.item.equipment === next.item.equipment &&
    prev.item.isFavorite === next.item.isFavorite &&
    JSON.stringify(prev.item.muscles) === JSON.stringify(next.item.muscles) &&
    prev.onOptionsPress === next.onOptionsPress &&
    prev.onPress === next.onPress &&
    prev.onFavoriteToggle === next.onFavoriteToggle &&
    prev.colors === next.colors &&
    prev.masteryLevel === next.masteryLevel,
)

const ExercisesContent: React.FC<Props> = ({ exercises, sets }) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<ExercisesNavigation>()
  const haptics = useHaptics()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const slideAnim = useKeyboardAnimation(-200)

  const masteryMap = useMemo(() => computeExerciseMastery(exercises, sets), [exercises, sets])
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const { searchQuery, setSearchQuery, filterMuscle, setFilterMuscle, filterEquipment, setFilterEquipment, filterFavorites, setFilterFavorites, filteredExercises } = useExerciseFilters(exercises)
  const {
    selectedExercise,
    setSelectedExercise,
    editExerciseData,
    updateEditExerciseName,
    updateEditExerciseMuscles,
    updateEditExerciseEquipment,
    updateExercise,
    deleteExercise,
    loadExerciseForEdit
  } = useExerciseManager(haptics.onSuccess, haptics.onDelete)

  const infoSheet = useModalState()
  const [infoSheetExercise, setInfoSheetExercise] = useState<Exercise | null>(null)

  const optionsModal = useModalState()
  const editModal = useModalState()
  const alertModal = useModalState()
  const searchModal = useModalState()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      optionsModal.close()
      editModal.close()
      alertModal.close()
      searchModal.close()
      setSearchQuery('')
    })
    return unsubscribe
  }, [navigation])

  // --- GESTION BOUTON RETOUR ANDROID ---
  const isOptionsVisibleRef = useRef(optionsModal.isOpen)
  useEffect(() => {
    isOptionsVisibleRef.current = optionsModal.isOpen
  }, [optionsModal.isOpen])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOptionsVisibleRef.current) {
        optionsModal.close()
        return true // Consomme l'événement
      }
      return false // Laisse le comportement par défaut
    })
    return () => backHandler.remove()
  }, [])

  // --- GESTION VISIBILITÉ CLAVIER ---
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true))
    const hideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false))

    return () => {
      showListener.remove()
      hideListener.remove()
    }
  }, [])

  const handleUpdateExercise = useCallback(async () => {
    try {
      const success = await updateExercise()
      if (success) {
        editModal.close()
        optionsModal.close()
        showToast({ message: t.toasts.exerciseUpdated })
      }
    } catch (e) {
      if (__DEV__) console.error('[ExercisesScreen] handleUpdateExercise:', e)
      showToast({ message: t.toasts.error, variant: 'error' })
    }
  }, [updateExercise, editModal, optionsModal, showToast, t])

  const handleDeleteExercise = useCallback(async () => {
    try {
      const success = await deleteExercise()
      if (success) {
        alertModal.close()
        optionsModal.close()
        showToast({ message: t.toasts.exerciseDeleted })
      }
    } catch (e) {
      if (__DEV__) console.error('[ExercisesScreen] handleDeleteExercise:', e)
      showToast({ message: t.toasts.error, variant: 'error' })
    }
  }, [deleteExercise, alertModal, optionsModal, showToast, t])

  const handleFavoriteToggle = useCallback(async (item: Exercise) => {
    haptics.onSelect()
    try {
      await database.write(async () => {
        await item.update(e => {
          e.isFavorite = !e.isFavorite
        })
      })
    } catch (e) {
      if (__DEV__) console.error('[ExercisesScreen] handleFavoriteToggle:', e)
    }
  }, [haptics])

  const handleOptionsPress = useCallback((item: Exercise) => {
    haptics.onPress()
    setSelectedExercise(item)
    optionsModal.open()
  }, [haptics, setSelectedExercise, optionsModal])

  const handleRowPress = useCallback((item: Exercise) => {
    haptics.onSelect()
    setInfoSheetExercise(item)
    infoSheet.open()
  }, [haptics, infoSheet])

  const handleViewHistory = useCallback(() => {
    if (!infoSheetExercise) return
    infoSheet.close()
    navigation.navigate('ExerciseHistory', { exerciseId: infoSheetExercise.id })
  }, [infoSheetExercise, infoSheet, navigation])

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <ExerciseItem item={item} onOptionsPress={handleOptionsPress} onPress={handleRowPress} onFavoriteToggle={handleFavoriteToggle} colors={colors} masteryLevel={masteryMap.get(item.id)?.level} />
  ), [handleOptionsPress, handleRowPress, handleFavoriteToggle, colors, masteryMap])

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [styles])

  const sections = useMemo(() => {
    const groups = new Map<string, Exercise[]>()
    for (const ex of filteredExercises) {
      const muscle = ex.muscles?.[0] ?? t.exercises.otherSection
      const label = t.muscleNames[muscle as keyof typeof t.muscleNames] ?? muscle
      if (!groups.has(label)) groups.set(label, [])
      groups.get(label)!.push(ex)
    }
    return Array.from(groups, ([title, data]) => ({ title, data }))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [filteredExercises, t])

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  ), [styles])

  return (
    <View style={styles.baseContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            {!searchModal.isOpen ? (
              <TouchableOpacity
                onPress={() => {
                  haptics.onSelect()
                  searchModal.open()
                }}
                style={styles.searchFakeInput}
                accessibilityRole="button"
                accessibilityLabel={t.accessibility.searchExercises}
              >
                <View style={styles.searchFakeRow}>
                  <Ionicons name="search-outline" size={16} color={colors.placeholder} />
                  <Text style={styles.searchFakeText}>{t.exercises.search}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t.exercises.typeName}
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => {
                    searchModal.close()
                    setSearchQuery('')
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t.accessibility.closeSearch}
                >
                  <Text style={styles.closeSearchText}>{t.common.close}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.searchFilters}>
            <View style={styles.favFilterRow}>
              <TouchableOpacity
                style={[styles.favChip, filterFavorites && styles.favChipActive]}
                onPress={() => {
                  haptics.onSelect()
                  setFilterFavorites(!filterFavorites)
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={filterFavorites ? 'heart' : 'heart-outline'} size={14} color={filterFavorites ? colors.danger : colors.textSecondary} />
                <Text style={[styles.favChipText, filterFavorites && styles.favChipTextActive]}>{t.exercises.favorites}</Text>
              </TouchableOpacity>
            </View>
            <ChipSelector
              items={MUSCLES_LIST}
              selectedValue={filterMuscle}
              onChange={setFilterMuscle}
              noneLabel={t.exercises.allMuscles}
              labelMap={t.muscleNames}
              style={styles.filterRow}
            />
            <ChipSelector
              items={EQUIPMENT_LIST}
              selectedValue={filterEquipment}
              onChange={setFilterEquipment}
              noneLabel={t.exercises.allEquipment}
              labelMap={t.equipmentNames}
              style={[styles.filterRow, styles.filterRowSecond]}
            />
          </View>
        </View>

          {exercises.length < 10 && (
            <TouchableOpacity
              style={styles.catalogBanner}
              onPress={() => {
                haptics.onPress()
                navigation.navigate('ExerciseCatalog')
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="globe-outline" size={22} color={colors.primary} />
              <View style={styles.catalogBannerText}>
                <Text style={styles.catalogBannerTitle}>{t.exercises.catalogBannerTitle}</Text>
                <Text style={styles.catalogBannerSubtitle}>{t.exercises.catalogBannerSubtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <View style={styles.listWrapper}>
            <SectionList
              sections={sections}
              keyExtractor={item => item.id}
              renderItem={renderExerciseItem}
              renderSectionHeader={renderSectionHeader}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={renderSeparator}
              ListEmptyComponent={<Text style={styles.emptyList}>{t.exercises.noExercises}</Text>}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              stickySectionHeadersEnabled={false}
            />
          </View>

          {!keyboardVisible && (
            <Animated.View style={[styles.footerFloating, { transform: [{ translateY: slideAnim }] }]}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  haptics.onPress()
                  navigation.navigate('CreateExercise')
                }}
                accessibilityRole="button"
                accessibilityLabel={t.accessibility.addExercise}
              >
                <Text style={styles.addButtonText}>{t.exercises.createExercise}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* --- SURCOUCHES (PORTALISÉES) --- */}

          <BottomSheet visible={optionsModal.isOpen} onClose={optionsModal.close} title={selectedExercise?.name}>
            {selectedExercise?.isCustom && (
              <TouchableOpacity style={styles.sheetOption} onPress={() => { optionsModal.close(); if (selectedExercise) loadExerciseForEdit(selectedExercise); editModal.open(); }}>
                <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: spacing.ms }} /><Text style={styles.sheetText}>{t.exercises.editTitle}</Text>
              </TouchableOpacity>
            )}
            {selectedExercise?.isCustom && (
              <TouchableOpacity style={styles.sheetOption} onPress={() => { optionsModal.close(); alertModal.open(); }}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: spacing.ms }} /><Text style={[styles.sheetText, { color: colors.danger }]}>{t.exercises.deleteTitle}</Text>
              </TouchableOpacity>
            )}
          </BottomSheet>

          <CustomModal visible={editModal.isOpen} title={t.exercises.editTitle} onClose={editModal.close}
            buttons={
                <>
                <TouchableOpacity style={styles.cancelBtn} onPress={editModal.close}><Text style={styles.btnText}>{t.common.cancel}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateExercise}><Text style={styles.btnText}>{t.common.save}</Text></TouchableOpacity>
                </>
            }
          >
            <TextInput style={styles.input} value={editExerciseData.name} onChangeText={updateEditExerciseName} placeholder={t.exercises.namePlaceholder} />
            <Text style={styles.label}>{t.exercises.muscles}</Text>
            <View style={styles.chipsContainer}>
                {MUSCLES_LIST.map(m => ( <TouchableOpacity key={m} style={[styles.chip, editExerciseData.muscles.includes(m) && styles.chipActive]} onPress={() => updateEditExerciseMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}><Text style={[styles.chipText, editExerciseData.muscles.includes(m) && styles.chipTextActive]}>{m}</Text></TouchableOpacity> ))}
            </View>
            <Text style={styles.label}>{t.exercises.equipment}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipRow}>
                {EQUIPMENT_LIST.map(e => ( <TouchableOpacity key={e} style={[styles.equipBtn, editExerciseData.equipment === e && styles.equipBtnActive]} onPress={() => updateEditExerciseEquipment(e)}><Text style={[styles.equipText, editExerciseData.equipment === e && styles.equipTextActive]}>{e}</Text></TouchableOpacity> ))}
            </ScrollView>
          </CustomModal>

          <AlertDialog
            visible={alertModal.isOpen}
            title={`${t.common.delete} ${selectedExercise?.name} ?`}
            message={t.exercises.deleteMessage}
            onConfirm={handleDeleteExercise}
            onCancel={alertModal.close}
            confirmText={t.common.delete}
            cancelText={t.common.cancel}
          />

          {infoSheetExercise && (
            <ExerciseInfoSheet
              exercise={infoSheetExercise}
              visible={infoSheet.isOpen}
              onClose={infoSheet.close}
              onViewHistory={handleViewHistory}
            />
          )}

        </SafeAreaView>
      </View>
  )
}

const SEARCH_HEIGHT = 45
const LIST_PADDING_BOTTOM = 150
const ITEM_HEIGHT = 74
const SEPARATOR_HEIGHT = 1

function useExerciseItemStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    exoItem: { paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    favoriteBtn: { marginRight: spacing.sm, padding: spacing.xs },
    exoInfo: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    exoTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
    masteryBadge: { flexDirection: 'row', gap: 1, marginLeft: spacing.xs },
    exoSubtitle: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs },
    moreBtn: { padding: spacing.sm },
    moreIcon: { color: colors.placeholder, fontSize: fontSize.lg, fontWeight: 'bold' },
  }), [colors])
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    baseContainer: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, height: SEARCH_HEIGHT },
    searchFakeInput: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: SEARCH_HEIGHT, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    searchFakeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    searchFakeText: { color: colors.textSecondary, fontSize: fontSize.bodyMd },
    searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: SEARCH_HEIGHT, borderWidth: 1, borderColor: colors.primary },
    searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md },
    closeSearchText: { color: colors.primary, marginLeft: spacing.sm, fontWeight: '600' },
    searchFilters: { marginBottom: spacing.xs },
    favFilterRow: { flexDirection: 'row', marginBottom: spacing.sm },
    favChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs, paddingHorizontal: spacing.ms, borderRadius: borderRadius.lg, backgroundColor: colors.cardSecondary, borderWidth: 1, borderColor: colors.border },
    favChipActive: { backgroundColor: colors.danger + '26', borderColor: colors.danger },
    favChipText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
    favChipTextActive: { color: colors.danger },
    catalogBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.primaryBg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.primary, gap: spacing.ms },
    catalogBannerText: { flex: 1 },
    catalogBannerTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
    catalogBannerSubtitle: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
    sectionHeader: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.background },
    sectionHeaderText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    filterRow: { flexDirection: 'row' },
    filterRowSecond: { marginTop: spacing.sm },
    listWrapper: { flex: 1 },
    list: { flex: 1 },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: LIST_PADDING_BOTTOM },
    separator: { height: 1, backgroundColor: colors.card },
    emptyList: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl, fontStyle: 'italic' },
    footerFloating: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, backgroundColor: colors.background },
    addButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', elevation: 8 },
    addButtonText: { color: colors.primaryText, fontWeight: 'bold', fontSize: fontSize.md },

    label: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.sm, fontWeight: '600', textTransform: 'uppercase' },
    input: { backgroundColor: colors.cardSecondary, color: colors.text, padding: spacing.md, borderRadius: borderRadius.md, fontSize: fontSize.md, marginBottom: spacing.lg },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
    chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.ms, borderRadius: borderRadius.lg, backgroundColor: colors.cardSecondary, marginRight: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary, fontSize: fontSize.xs },
    chipTextActive: { color: colors.text, fontWeight: 'bold' },
    equipRow: { flexDirection: 'row', marginBottom: spacing.xl },
    equipBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm, backgroundColor: colors.cardSecondary, marginRight: spacing.sm },
    equipBtnActive: { backgroundColor: colors.secondaryButton, borderWidth: 1, borderColor: colors.primary },
    equipText: { color: colors.textSecondary, fontSize: fontSize.sm },
    equipTextActive: { color: colors.text, fontWeight: 'bold' },
    cancelBtn: { flex: 0.47, backgroundColor: colors.secondaryButton, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
    confirmBtn: { flex: 0.47, backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
    btnText: { color: colors.text, fontWeight: 'bold' },
    sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
    sheetText: { color: colors.text, fontSize: fontSize.md },
  }), [colors])
}

const ObservableContent = withObservables([], () => ({
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe(),
  sets: database.get<SetModel>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
}))(ExercisesContent)

const ExercisesScreen = () => {
  const colors = useColors()
  const navigation = useNavigation<ExercisesNavigation>()
  const haptics = useHaptics()
  const mounted = useDeferredMount()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <GHTouchableOpacity
          testID="globe-catalog-button"
          onPress={() => {
            haptics.onPress()
            navigation.navigate('ExerciseCatalog')
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          style={{ marginRight: spacing.md }}
        >
          <Ionicons name="globe-outline" size={24} color={colors.primary} />
        </GHTouchableOpacity>
      ),
    })
  }, [navigation, colors.primary, haptics])

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export { ExercisesContent }
export default ExercisesScreen
