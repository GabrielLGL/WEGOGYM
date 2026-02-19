import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'
import Exercise from '../model/models/Exercise'
import WorkoutSet from '../model/models/Set'
import History from '../model/models/History'
import Session from '../model/models/Session'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { AlertDialog } from '../components/AlertDialog'
import { ChipSelector } from '../components/ChipSelector'
import { useHaptics } from '../hooks/useHaptics'
import { useMultiModalSync } from '../hooks/useModalState'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { colors } from '../theme'
import { buildExerciseStatsFromData } from '../model/utils/databaseHelpers'
import type { ExerciseSessionStat } from '../model/utils/databaseHelpers'

const screenWidth = Dimensions.get('window').width

// --- Sous-composant : ExerciseStatsContent ---

interface ExerciseStatsContentProps {
  exerciseId: string
  histories: History[]
  setsForExercise: WorkoutSet[]
  sessions: Session[]
}

const ExerciseStatsContent: React.FC<ExerciseStatsContentProps> = ({
  exerciseId,
  histories,
  setsForExercise,
  sessions,
}) => {
  const haptics = useHaptics()
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [selectedStat, setSelectedStat] = useState<ExerciseSessionStat | null>(null)

  useMultiModalSync([isAlertVisible])

  const statsForSelectedExo = useMemo(
    () => buildExerciseStatsFromData(setsForExercise, histories, sessions),
    [setsForExercise, histories, sessions]
  )

  const chartStats = useMemo(() => statsForSelectedExo.slice(-15), [statsForSelectedExo])

  const chartData = useMemo(() => {
    if (chartStats.length < 2) return null
    return {
      labels: chartStats.map(s =>
        s.startTime.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      ),
      datasets: [{ data: chartStats.map(s => s.maxWeight) }],
    }
  }, [chartStats])

  const reversedStats = useMemo(
    () => [...statsForSelectedExo].reverse(),
    [statsForSelectedExo]
  )

  const handleDeleteStat = async () => {
    if (!selectedStat) return
    try {
      await database.write(async () => {
        const setsToDelete = await database
          .get<WorkoutSet>('sets')
          .query(
            Q.where('exercise_id', exerciseId),
            Q.where('history_id', selectedStat.historyId)
          )
          .fetch()
        await database.batch(...setsToDelete.map(s => s.prepareDestroyPermanently()))
      })
      haptics.onDelete()
    } catch {
      // Erreur DB : on ne bloque pas l'UI
    } finally {
      setIsAlertVisible(false)
      setSelectedStat(null)
    }
  }

  const renderSessionItem = ({ item }: { item: ExerciseSessionStat }) => (
    <View style={styles.logRow}>
      <View style={styles.logInfo}>
        <Text style={styles.logMainText}>{item.sessionName}</Text>
        <Text style={styles.logDate}>{item.startTime.toLocaleDateString()}</Text>
        {item.sets.map((s, idx) => (
          <Text key={idx} style={styles.setDetailText}>
            Série {s.setOrder} : {s.weight} kg × {s.reps} reps
          </Text>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => {
          haptics.onPress()
          setSelectedStat(item)
          setIsAlertVisible(true)
        }}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.statsContainer}>
      <FlatList
        data={reversedStats}
        keyExtractor={item => item.historyId}
        renderItem={renderSessionItem}
        ListHeaderComponent={
          <View style={styles.chartWrapper}>
            {chartData ? (
              <>
                <LineChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero={true}
                  formatXLabel={val => (chartData.labels.length > 6 ? '' : val)}
                />
                <Text style={styles.historyTitle}>Historique complet</Text>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Enregistrez au moins une autre session pour voir votre progression.
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <AlertDialog
        visible={isAlertVisible}
        title="Supprimer cette séance ?"
        message={
          selectedStat
            ? `${selectedStat.sessionName} — ${selectedStat.startTime.toLocaleDateString()}`
            : ''
        }
        onConfirm={handleDeleteStat}
        onCancel={() => {
          setIsAlertVisible(false)
          setSelectedStat(null)
        }}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor={colors.danger}
      />
    </View>
  )
}

const ObservableExerciseStats = withObservables(
  ['exerciseId'],
  ({ exerciseId }: { exerciseId: string }) => ({
    setsForExercise: database
      .get<WorkoutSet>('sets')
      .query(Q.where('exercise_id', exerciseId))
      .observe(),
    histories: database
      .get<History>('histories')
      .query(
        Q.experimentalJoinTables(['sets']),
        Q.where('deleted_at', null),
        Q.on('sets', Q.where('exercise_id', exerciseId))
      )
      .observe(),
    sessions: database
      .get<Session>('sessions')
      .query(
        Q.experimentalJoinTables(['histories']),
        Q.experimentalNestedJoin('histories', 'sets'),
        Q.on('histories', [
          Q.where('deleted_at', null),
          Q.on('sets', Q.where('exercise_id', exerciseId)),
        ])
      )
      .observe(),
  })
)(ExerciseStatsContent)

// --- Composant principal ChartsContent ---

interface Props {
  exercises: Exercise[]
}

const ChartsContent: React.FC<Props> = ({ exercises }) => {
  const haptics = useHaptics()
  const { filterMuscle, setFilterMuscle, filterEquipment, setFilterEquipment, filteredExercises } =
    useExerciseFilters(exercises)

  const [selectedExoId, setSelectedExoId] = useState<string | null>(null)

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
          {filteredExercises.map(exo => (
            <TouchableOpacity
              key={exo.id}
              style={[styles.exoChip, selectedExoId === exo.id && styles.exoChipActive]}
              onPress={() => {
                haptics.onSelect()
                setSelectedExoId(exo.id)
              }}
            >
              <Text
                style={[
                  styles.exoChipText,
                  selectedExoId === exo.id && styles.exoChipTextActive,
                ]}
              >
                {exo.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.contentArea}>
        {selectedExoId ? (
          <ObservableExerciseStats exerciseId={selectedExoId} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sélectionnez un exercice pour commencer.</Text>
          </View>
        )}
      </View>
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
  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtersWrapper: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.card },
  filterRow: { paddingHorizontal: 20 },
  selectorContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
    backgroundColor: colors.background,
  },
  exoScroll: { paddingHorizontal: 20 },
  exoChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.cardSecondary,
    marginRight: 10,
  },
  exoChipActive: { backgroundColor: colors.primary },
  exoChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  exoChipTextActive: { color: colors.text },
  contentArea: { flex: 1 },
  statsContainer: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 100 },
  chartWrapper: { marginBottom: 20 },
  chart: { borderRadius: 16, marginVertical: 8 },
  historyTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  logInfo: { flex: 1 },
  logMainText: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
  logDate: { color: colors.placeholder, fontSize: 11, marginTop: 2, marginBottom: 6 },
  setDetailText: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 10 },
  deleteIcon: { fontSize: 18 },
  emptyState: { marginTop: 50, paddingHorizontal: 40 },
  emptyText: {
    color: colors.placeholder,
    textAlign: 'center',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
})

const ObservableContent = withObservables([], () => ({
  exercises: database
    .get<Exercise>('exercises')
    .query(
      Q.sortBy('name', Q.asc),
      Q.on('sets', Q.where('id', Q.notEq(null)))
    )
    .observe(),
}))(ChartsContent)

const ChartsScreen = () => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ObservableContent />
  </View>
)

export default ChartsScreen
