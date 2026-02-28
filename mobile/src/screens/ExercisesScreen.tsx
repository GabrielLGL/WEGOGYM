import React, { useState, useEffect, useCallback, memo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, SafeAreaView, ScrollView, Animated, Platform, UIManager, BackHandler, Keyboard } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Exercise from '../model/models/Exercise'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation'

type ExercisesNavigation = NativeStackNavigationProp<RootStackParamList>
import { CustomModal } from '../components/CustomModal'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { ChipSelector } from '../components/ChipSelector'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useExerciseManager } from '../hooks/useExerciseManager'
import { fontSize, spacing, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface Props { exercises: Exercise[] }

interface ExerciseItemProps {
  item: Exercise
  onOptionsPress: (item: Exercise) => void
  onPress: (item: Exercise) => void
  colors: ThemeColors
}

const ExerciseItem = memo<ExerciseItemProps>(
  ({ item, onOptionsPress, onPress, colors }) => {
    const styles = useExerciseItemStyles(colors)
    return (
      <TouchableOpacity style={styles.exoItem} onPress={() => onPress(item)} activeOpacity={0.7}>
        <View style={styles.exoInfo}>
          <Text style={styles.exoTitle}>{item.name}</Text>
          <Text style={styles.exoSubtitle}>{item.muscles?.join(', ')} • {item.equipment}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => onOptionsPress(item)}
        >
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  },
  // Comparateur custom : WatermelonDB mute les instances en place — on vérifie aussi les champs
  (prev, next) =>
    prev.item === next.item &&
    prev.item.name === next.item.name &&
    prev.item.equipment === next.item.equipment &&
    JSON.stringify(prev.item.muscles) === JSON.stringify(next.item.muscles) &&
    prev.onOptionsPress === next.onOptionsPress &&
    prev.onPress === next.onPress &&
    prev.colors === next.colors,
)

const ExercisesContent: React.FC<Props> = ({ exercises }) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<ExercisesNavigation>()
  const haptics = useHaptics()
  const slideAnim = useKeyboardAnimation(-200)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const { searchQuery, setSearchQuery, filterMuscle, setFilterMuscle, filterEquipment, setFilterEquipment, filteredExercises } = useExerciseFilters(exercises)
  const {
    selectedExercise,
    setSelectedExercise,
    newExerciseData,
    updateNewExerciseName,
    updateNewExerciseMuscles,
    updateNewExerciseEquipment,
    editExerciseData,
    updateEditExerciseName,
    updateEditExerciseMuscles,
    updateEditExerciseEquipment,
    createExercise,
    updateExercise,
    deleteExercise,
    loadExerciseForEdit
  } = useExerciseManager(haptics.onSuccess, haptics.onDelete)

  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isOptionsVisible, setIsOptionsVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsAddModalVisible(false)
      setIsOptionsVisible(false)
      setIsEditModalVisible(false)
      setIsAlertVisible(false)
      setIsSearchVisible(false)
      setSearchQuery('')
    })
    return unsubscribe
  }, [navigation])

  // --- GESTION BOUTON RETOUR ANDROID ---
  useEffect(() => {
    const backAction = () => {
      // Si le BottomSheet Options est ouvert, le fermer au lieu de naviguer
      if (isOptionsVisible) {
        setIsOptionsVisible(false)
        return true // Consomme l'événement
      }
      return false // Laisse le comportement par défaut
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [isOptionsVisible])

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

  const handleCreateExercise = async () => {
    const success = await createExercise()
    if (success) {
      setIsAddModalVisible(false)
    }
  }

  const handleUpdateExercise = async () => {
    const success = await updateExercise()
    if (success) {
      setIsEditModalVisible(false)
      setIsOptionsVisible(false)
    }
  }

  const handleDeleteExercise = async () => {
    const success = await deleteExercise()
    if (success) {
      setIsAlertVisible(false)
      setIsOptionsVisible(false)
    }
  }

  const handleOptionsPress = useCallback((item: Exercise) => {
    haptics.onPress()
    setSelectedExercise(item)
    setIsOptionsVisible(true)
  }, [haptics, setSelectedExercise, setIsOptionsVisible])

  const handleRowPress = useCallback((item: Exercise) => {
    haptics.onSelect()
    navigation.navigate('ExerciseHistory', { exerciseId: item.id })
  }, [haptics, navigation])

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <ExerciseItem item={item} onOptionsPress={handleOptionsPress} onPress={handleRowPress} colors={colors} />
  ), [handleOptionsPress, handleRowPress, colors])

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [styles])

  return (
    <View style={styles.baseContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            {!isSearchVisible ? (
              <TouchableOpacity
                onPress={() => {
                  haptics.onSelect()
                  setIsSearchVisible(true)
                }}
                style={styles.searchFakeInput}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="search-outline" size={16} color={colors.placeholder} />
                  <Text style={styles.searchFakeText}>Rechercher un exercice...</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tapez le nom..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => {
                    setIsSearchVisible(false)
                    setSearchQuery('')
                  }}
                >
                  <Text style={styles.closeSearchText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.searchFilters}>
            <ChipSelector
              items={MUSCLES_LIST}
              selectedValue={filterMuscle}
              onChange={setFilterMuscle}
              noneLabel="Tous muscles"
              style={styles.filterRow}
            />
            <ChipSelector
              items={EQUIPMENT_LIST}
              selectedValue={filterEquipment}
              onChange={setFilterEquipment}
              noneLabel="Tout équipement"
              style={[styles.filterRow, { marginTop: HEADER_PADDING_V }]}
            />
          </View>
        </View>

          <View style={styles.listWrapper}>
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              renderItem={renderExerciseItem}
              style={styles.list}
              contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING_H, paddingBottom: LIST_PADDING_BOTTOM }}
              ItemSeparatorComponent={renderSeparator}
              ListEmptyComponent={<Text style={styles.emptyList}>Aucun exercice trouvé.</Text>}
            />
          </View>

          {!keyboardVisible && (
            <Animated.View style={[styles.footerFloating, { transform: [{ translateY: slideAnim }] }]}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  haptics.onPress()
                  setIsAddModalVisible(true)
                }}
              >
                <Text style={styles.addButtonText}>+ Créer un exercice</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* --- SURCOUCHES (PORTALISÉES) --- */}

          <BottomSheet visible={isOptionsVisible} onClose={() => setIsOptionsVisible(false)} title={selectedExercise?.name}>
            <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsOptionsVisible(false); if (selectedExercise) loadExerciseForEdit(selectedExercise); setIsEditModalVisible(true); }}>
              <Ionicons name="pencil-outline" size={20} color={colors.text} style={{ marginRight: spacing.ms }} /><Text style={styles.sheetText}>Modifier l'exercice</Text>
            </TouchableOpacity>
            {selectedExercise?.isCustom && (
              <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsOptionsVisible(false); setIsAlertVisible(true); }}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} style={{ marginRight: spacing.ms }} /><Text style={[styles.sheetText, { color: colors.danger }]}>Supprimer l'exercice</Text>
              </TouchableOpacity>
            )}
          </BottomSheet>

          <CustomModal visible={isEditModalVisible} title="Renommer l'exercice" onClose={() => setIsEditModalVisible(false)}
            buttons={
                <>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditModalVisible(false)}><Text style={styles.btnText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateExercise}><Text style={styles.btnText}>Enregistrer</Text></TouchableOpacity>
                </>
            }
          >
            <TextInput style={styles.input} value={editExerciseData.name} onChangeText={updateEditExerciseName} placeholder="Nom..." />
            <Text style={styles.label}>Muscles</Text>
            <View style={styles.chipsContainer}>
                {MUSCLES_LIST.map(m => ( <TouchableOpacity key={m} style={[styles.chip, editExerciseData.muscles.includes(m) && styles.chipActive]} onPress={() => updateEditExerciseMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}><Text style={[styles.chipText, editExerciseData.muscles.includes(m) && styles.chipTextActive]}>{m}</Text></TouchableOpacity> ))}
            </View>
            <Text style={styles.label}>Équipement</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipRow}>
                {EQUIPMENT_LIST.map(e => ( <TouchableOpacity key={e} style={[styles.equipBtn, editExerciseData.equipment === e && styles.equipBtnActive]} onPress={() => updateEditExerciseEquipment(e)}><Text style={[styles.equipText, editExerciseData.equipment === e && styles.equipTextActive]}>{e}</Text></TouchableOpacity> ))}
            </ScrollView>
          </CustomModal>

          <AlertDialog
            visible={isAlertVisible}
            title={`Supprimer ${selectedExercise?.name} ?`}
            message="Cette action supprimera l'exercice de vos séances et statistiques."
            onConfirm={handleDeleteExercise}
            onCancel={() => setIsAlertVisible(false)}
            confirmText="Supprimer"
            cancelText="Annuler"
          />

          <CustomModal visible={isAddModalVisible} title="Nouvel Exercice" onClose={() => setIsAddModalVisible(false)}
            buttons={
                <>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddModalVisible(false)}><Text style={styles.btnText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateExercise}><Text style={styles.btnText}>Créer</Text></TouchableOpacity>
                </>
            }
          >
             <TextInput style={styles.input} value={newExerciseData.name} onChangeText={updateNewExerciseName} placeholder="Nom..." placeholderTextColor={colors.textSecondary} />
                <View style={styles.chipsContainer}>
                  {MUSCLES_LIST.map(m => (<TouchableOpacity key={m} style={[styles.chip, newExerciseData.muscles.includes(m) && styles.chipActive]} onPress={() => updateNewExerciseMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}><Text style={[styles.chipText, newExerciseData.muscles.includes(m) && styles.chipTextActive]}>{m}</Text></TouchableOpacity>))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipRow}>
                  {EQUIPMENT_LIST.map(e => (<TouchableOpacity key={e} style={[styles.equipBtn, newExerciseData.equipment === e && styles.equipBtnActive]} onPress={() => updateNewExerciseEquipment(e)}><Text style={[styles.equipText, newExerciseData.equipment === e && styles.equipTextActive]}>{e}</Text></TouchableOpacity>))}
                </ScrollView>
          </CustomModal>

        </SafeAreaView>
      </View>
  )
}

const SCREEN_PADDING_H = 20
const HEADER_PADDING_V = 10
const HEADER_PADDING_BOTTOM = 15
const SEARCH_HEIGHT = 45
const SEARCH_PADDING_H = 15
const LIST_ITEM_PADDING_V = 15
const FONT_SIZE_EXO_TITLE = 17
const FONT_SIZE_LABEL = 13
const ICON_PADDING = 10
const INPUT_MARGIN_BOTTOM = 20
const EQUIP_ROW_MARGIN_BOTTOM = 30
const EQUIP_BORDER_RADIUS = 10
const BTN_PADDING = 14
const LIST_PADDING_BOTTOM = 150

function useExerciseItemStyles(colors: ThemeColors) {
  return StyleSheet.create({
    exoItem: { paddingVertical: LIST_ITEM_PADDING_V, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    exoInfo: { flex: 1 },
    exoTitle: { color: colors.text, fontSize: FONT_SIZE_EXO_TITLE, fontWeight: '600' },
    exoSubtitle: { color: colors.textSecondary, fontSize: FONT_SIZE_LABEL, marginTop: 3 },
    moreBtn: { padding: ICON_PADDING },
    moreIcon: { color: colors.placeholder, fontSize: fontSize.lg, fontWeight: 'bold' },
  })
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    baseContainer: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    header: { paddingHorizontal: SCREEN_PADDING_H, paddingTop: HEADER_PADDING_V, paddingBottom: HEADER_PADDING_BOTTOM },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: HEADER_PADDING_BOTTOM, height: SEARCH_HEIGHT },
    searchFakeInput: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.md, paddingHorizontal: SEARCH_PADDING_H, height: SEARCH_HEIGHT, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    searchFakeText: { color: colors.textSecondary, fontSize: fontSize.bodyMd },
    searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.md, paddingHorizontal: SEARCH_PADDING_H, height: SEARCH_HEIGHT, borderWidth: 1, borderColor: colors.primary },
    searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md },
    closeSearchText: { color: colors.primary, marginLeft: spacing.sm, fontWeight: '600' },
    searchFilters: { marginBottom: 5 },
    filterRow: { flexDirection: 'row' },
    listWrapper: { flex: 1 },
    list: { flex: 1 },
    exoItem: { paddingVertical: LIST_ITEM_PADDING_V, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    exoInfo: { flex: 1 },
    exoTitle: { color: colors.text, fontSize: FONT_SIZE_EXO_TITLE, fontWeight: '600' },
    exoSubtitle: { color: colors.textSecondary, fontSize: FONT_SIZE_LABEL, marginTop: 3 },
    moreBtn: { padding: ICON_PADDING },
    moreIcon: { color: colors.placeholder, fontSize: fontSize.lg, fontWeight: 'bold' },
    separator: { height: 1, backgroundColor: colors.card },
    emptyList: { color: colors.textSecondary, textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
    footerFloating: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SCREEN_PADDING_H, paddingTop: HEADER_PADDING_V, paddingBottom: spacing.md, backgroundColor: colors.background },
    addButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', elevation: 8 },
    addButtonText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.md },

    label: { color: colors.textSecondary, fontSize: FONT_SIZE_LABEL, marginBottom: spacing.sm, fontWeight: '600', textTransform: 'uppercase' },
    input: { backgroundColor: colors.cardSecondary, color: colors.text, padding: LIST_ITEM_PADDING_V, borderRadius: borderRadius.md, fontSize: fontSize.md, marginBottom: INPUT_MARGIN_BOTTOM },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: INPUT_MARGIN_BOTTOM },
    chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.ms, borderRadius: borderRadius.lg, backgroundColor: colors.cardSecondary, marginRight: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary, fontSize: fontSize.xs },
    chipTextActive: { color: colors.text, fontWeight: 'bold' },
    equipRow: { flexDirection: 'row', marginBottom: EQUIP_ROW_MARGIN_BOTTOM },
    equipBtn: { paddingVertical: ICON_PADDING, paddingHorizontal: SEARCH_PADDING_H, borderRadius: EQUIP_BORDER_RADIUS, backgroundColor: colors.cardSecondary, marginRight: spacing.sm },
    equipBtnActive: { backgroundColor: colors.secondaryButton, borderWidth: 1, borderColor: colors.primary },
    equipText: { color: colors.textSecondary, fontSize: FONT_SIZE_LABEL },
    equipTextActive: { color: colors.text, fontWeight: 'bold' },
    cancelBtn: { flex: 0.47, backgroundColor: colors.secondaryButton, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center' },
    confirmBtn: { flex: 0.47, backgroundColor: colors.primary, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center' },
    btnText: { color: colors.text, fontWeight: 'bold' },
    sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: LIST_ITEM_PADDING_V },
    sheetText: { color: colors.text, fontSize: fontSize.md },
  })
}

const ObservableContent = withObservables([], () => ({
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe()
}))(ExercisesContent)

const ExercisesScreen = () => {
  const colors = useColors()
  return <View style={{ flex: 1, backgroundColor: colors.background }}><ObservableContent /></View>
}

export { ExercisesContent }
export default ExercisesScreen
