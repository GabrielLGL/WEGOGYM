import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'
import Exercise from '../model/models/Exercise'
import PerformanceLog from '../model/models/PerformanceLog'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { AlertDialog } from '../components/AlertDialog'
import { ChipSelector } from '../components/ChipSelector'
import { useHaptics } from '../hooks/useHaptics'
import { useMultiModalSync } from '../hooks/useModalState'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { colors } from '../theme'

const screenWidth = Dimensions.get('window').width

const ChartHeaderComponent = ({ exercise }: { exercise: Exercise }) => (
  <Text style={styles.chartTitle}>{exercise.name}</Text>
)
const ObservedChartHeader = withObservables(['exercise'], ({ exercise }) => ({
  exercise: exercise.observe()
}))(ChartHeaderComponent)

interface Props {
  exercises: Exercise[]
  allLogs: PerformanceLog[]
}

const ChartsContent: React.FC<Props> = ({ exercises, allLogs }) => {
  const haptics = useHaptics()
  const { filterMuscle, setFilterMuscle, filterEquipment, setFilterEquipment, filteredExercises } = useExerciseFilters(exercises)

  const [selectedExoId, setSelectedExoId] = useState<string | null>(null)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [selectedLog, setSelectedLog] = useState<PerformanceLog | null>(null)

  useMultiModalSync([isAlertVisible])

  const selectedExercise = useMemo(() => exercises.find(e => e.id === selectedExoId), [exercises, selectedExoId])

  const logsForSelectedExo = useMemo(() => {
    return allLogs
      .filter(log => log.exercise.id === selectedExoId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [allLogs, selectedExoId])

  const chartData = useMemo(() => {
    if (logsForSelectedExo.length < 2) return null
    const chartLogs = [...logsForSelectedExo].reverse().slice(-15)
    return {
      labels: chartLogs.map((log) => new Date(log.createdAt).toLocaleDateString([], {day:'2-digit', month:'2-digit'})),
      datasets: [{ data: chartLogs.map(l => l.weight) }]
    }
  }, [logsForSelectedExo])

  const availableExercises = useMemo(() => {
    const loggedExoIds = new Set(allLogs.map(l => l.exercise.id))
    return filteredExercises.filter(exo => loggedExoIds.has(exo.id))
  }, [filteredExercises, allLogs])

  const handleDeleteLog = async () => {
    if (!selectedLog) return
    await database.write(async () => {
      await selectedLog.destroyPermanently()
    })
    setIsAlertVisible(false)
    setSelectedLog(null)
  }

  const renderLogItem = ({ item }: { item: PerformanceLog }) => (
    <View style={styles.logRow}>
      <View style={styles.logInfo}>
        <Text style={styles.logMainText}>
          {item.sets || 0} <Text style={styles.logLabel}>séries</Text> x {item.reps} <Text style={styles.logLabel}>reps</Text> x {item.weight} <Text style={styles.logLabel}>kg</Text>
        </Text>
        <Text style={styles.logDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          haptics.onPress()
          setSelectedLog(item)
          setIsAlertVisible(true)
        }}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filtersWrapper}>
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
          style={[styles.filterRow, { marginTop: 8 }]}
        />
      </View>

        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exoScroll}>
            {availableExercises.map(exo => (
              <TouchableOpacity
                key={exo.id}
                style={[styles.exoChip, selectedExoId === exo.id && styles.exoChipActive]}
                onPress={() => {
                  haptics.onSelect()
                  setSelectedExoId(exo.id)
                }}
              >
                <Text style={[styles.exoChipText, selectedExoId === exo.id && styles.exoChipTextActive]}>
                  {exo.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={logsForSelectedExo.length > 1 ? logsForSelectedExo : []}
          keyExtractor={item => item.id}
          renderItem={renderLogItem}
          ListHeaderComponent={
            <View style={styles.chartWrapper}>
              {chartData && selectedExercise ? (
                <>
                  <ObservedChartHeader exercise={selectedExercise} />
                  <LineChart data={chartData} width={screenWidth - 40} height={200} chartConfig={chartConfig} style={styles.chart} fromZero={true} formatXLabel={(val) => chartData.labels.length > 6 ? '' : val} />
                  <Text style={styles.historyTitle}>Historique complet</Text>
                </>
              ) : selectedExoId ? (
                <View style={styles.emptyState}><Text style={styles.emptyText}>Enregistrez au moins une autre session pour voir votre progression.</Text></View>
              ) : (
                <View style={styles.emptyState}><Text style={styles.emptyText}>Sélectionnez un exercice pour commencer.</Text></View>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        <AlertDialog
          visible={isAlertVisible}
          title="Supprimer ce point ?"
          message={
            selectedLog
              ? `${selectedLog.sets}x${selectedLog.reps}x${selectedLog.weight}kg - ${new Date(selectedLog.createdAt).toLocaleDateString()}`
              : ''
          }
          onConfirm={handleDeleteLog}
          onCancel={() => setIsAlertVisible(false)}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </SafeAreaView>
  )
}

const chartConfig = {
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtersWrapper: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.card },
  filterRow: { paddingHorizontal: 20 },
  selectorContainer: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.card, backgroundColor: colors.background },
  exoScroll: { paddingHorizontal: 20 },
  exoChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.cardSecondary, marginRight: 10 },
  exoChipActive: { backgroundColor: colors.primary },
  exoChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  exoChipTextActive: { color: colors.text },
  listContent: { padding: 20, paddingBottom: 100 },
  chartWrapper: { marginBottom: 20 },
  chartTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  chart: { borderRadius: 16, marginVertical: 8 },
  historyTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 15, borderRadius: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: colors.primary },
  logInfo: { flex: 1 },
  logMainText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  logLabel: { color: colors.textSecondary, fontWeight: 'normal', fontSize: 12 },
  logDate: { color: colors.placeholder, fontSize: 11, marginTop: 4 },
  deleteBtn: { padding: 10 },
  deleteIcon: { fontSize: 18 },
  emptyState: { marginTop: 50, paddingHorizontal: 40 },
  emptyText: { color: colors.placeholder, textAlign: 'center', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },
})

const ObservableContent = withObservables([], () => ({
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe(),
  allLogs: database.get<PerformanceLog>('performance_logs').query().observe()
}))(ChartsContent)

const ChartsScreen = () => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ObservableContent />
  </View>
)

export default ChartsScreen