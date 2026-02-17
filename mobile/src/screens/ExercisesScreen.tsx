import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, SafeAreaView, ScrollView, Animated, Platform, UIManager, BackHandler, Keyboard } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Exercise from '../model/models/Exercise'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { useNavigation } from '@react-navigation/native'
import { CustomModal } from '../components/CustomModal'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { ChipSelector } from '../components/ChipSelector'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useMultiModalSync } from '../hooks/useModalState'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useExerciseManager } from '../hooks/useExerciseManager'
import { colors } from '../theme'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface Props { exercises: Exercise[] }

const ExercisesContent: React.FC<Props> = ({ exercises }) => {
  const navigation = useNavigation()
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

  // Synchronisation tab bar
  useMultiModalSync([isAddModalVisible, isOptionsVisible, isEditModalVisible, isAlertVisible])

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
                <Text style={styles.searchFakeText}>🔍 Rechercher un exercice...</Text>
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
              style={[styles.filterRow, { marginTop: 10 }]}
            />
          </View>
        </View>

          <View style={styles.listWrapper}>
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.exoItem}>
                  <View style={styles.exoInfo}>
                    <Text style={styles.exoTitle}>{item.name}</Text>
                    <Text style={styles.exoSubtitle}>{item.muscles?.join(', ')} • {item.equipment}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={() => {
                      haptics.onPress()
                      setSelectedExercise(item)
                      setIsOptionsVisible(true)
                    }}
                  >
                    <Text style={styles.moreIcon}>•••</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.list}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
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
              <Text style={styles.sheetIcon}>✏️</Text><Text style={styles.sheetText}>Modifier l'exercice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={() => { setIsOptionsVisible(false); setIsAlertVisible(true); }}>
              <Text style={styles.sheetIcon}>🗑️</Text><Text style={[styles.sheetText, { color: colors.danger }]}>Supprimer l'exercice</Text>
            </TouchableOpacity>
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

const styles = StyleSheet.create({
  baseContainer: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, height: 45 },
  searchFakeInput: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 15, height: 45, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  searchFakeText: { color: colors.textSecondary, fontSize: 15 },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 15, height: 45, borderWidth: 1, borderColor: colors.primary },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  closeSearchText: { color: colors.primary, marginLeft: 10, fontWeight: '600' },
  searchFilters: { marginBottom: 5 },
  filterRow: { flexDirection: 'row' },
  listWrapper: { flex: 1 },
  list: { flex: 1 },
  exoItem: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exoInfo: { flex: 1 },
  exoTitle: { color: colors.text, fontSize: 17, fontWeight: '600' },
  exoSubtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  moreBtn: { padding: 10 },
  moreIcon: { color: colors.placeholder, fontSize: 18, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: colors.card },
  emptyList: { color: colors.textSecondary, textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
  footerFloating: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 70, backgroundColor: colors.background},
  addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 8 },
  addButtonText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },

  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 10, fontWeight: '600', textTransform: 'uppercase' },
  input: { backgroundColor: colors.cardSecondary, color: colors.text, padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.cardSecondary, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  chipTextActive: { color: colors.text, fontWeight: 'bold' },
  equipRow: { flexDirection: 'row', marginBottom: 30 },
  equipBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: colors.cardSecondary, marginRight: 10 },
  equipBtnActive: { backgroundColor: colors.secondaryButton, borderWidth: 1, borderColor: colors.primary },
  equipText: { color: colors.textSecondary, fontSize: 13 },
  equipTextActive: { color: colors.text, fontWeight: 'bold' },
  modalButton: { flex: 0.47, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { flex: 0.47, backgroundColor: colors.secondaryButton, padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmBtn: { flex: 0.47, backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: colors.text, fontWeight: 'bold' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  sheetIcon: { fontSize: 20, marginRight: 15 },
  sheetText: { color: colors.text, fontSize: 16 },
})

const ObservableContent = withObservables([], () => ({
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe()
}))(ExercisesContent)

const ExercisesScreen = () => (<View style={styles.baseContainer}><ObservableContent /></View>)

export default ExercisesScreen