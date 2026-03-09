import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
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
import { useModalState } from '../hooks/useModalState'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { fontSize, borderRadius, spacing } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'
import { buildExerciseStatsFromData } from '../model/utils/databaseHelpers'
import type { ExerciseSessionStat } from '../model/utils/databaseHelpers'
import type { RootStackParamList } from '../navigation'

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
  const colors = useColors()
  const { t } = useLanguage()
  const { width: screenWidth } = useWindowDimensions()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const alertModal = useModalState()
  const [selectedStat, setSelectedStat] = useState<ExerciseSessionStat | null>(null)

  const chartConfig = createChartConfig({ decimalPlaces: 1, showDots: true, colors })

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
        await database.batch(setsToDelete.map(s => s.prepareDestroyPermanently()))
      })
      haptics.onDelete()
    } catch (e) {
      if (__DEV__) console.error('[ChartsScreen] handleDeleteStat error', e)
    } finally {
      alertModal.close()
      setSelectedStat(null)
    }
  }

  const renderSessionItem = useCallback(({ item }: { item: ExerciseSessionStat }) => (
    <View style={styles.logRow}>
      <View style={styles.logInfo}>
        <Text style={styles.logMainText}>{item.sessionName}</Text>
        <Text style={styles.logDate}>{item.startTime.toLocaleDateString()}</Text>
        {item.sets.map((s, idx) => (
          <Text key={idx} style={styles.setDetailText}>
            {t.charts.setDetail.replace('{order}', String(s.setOrder)).replace('{weight}', String(s.weight)).replace('{reps}', String(s.reps))}
          </Text>
        ))}
      </View>
      <View style={styles.actionBtns}>
        <TouchableOpacity
          onPress={() => {
            haptics.onSelect()
            navigation.navigate('HistoryDetail', { historyId: item.historyId })
          }}
          style={styles.actionBtn}
          testID="edit-btn"
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            haptics.onPress()
            setSelectedStat(item)
            alertModal.open()
          }}
          style={styles.actionBtn}
          testID="delete-btn"
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  ), [styles, colors, haptics, navigation])

  return (
    <View style={styles.statsContainer}>
      <FlatList
        data={reversedStats}
        keyExtractor={item => item.historyId}
        renderItem={renderSessionItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
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
                <Text style={styles.historyTitle}>{t.exerciseHistory.fullHistory}</Text>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {t.charts.emptyProgression}
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <AlertDialog
        visible={alertModal.isOpen}
        title={t.charts.deleteSessionTitle}
        message={
          selectedStat
            ? `${selectedStat.sessionName} — ${selectedStat.startTime.toLocaleDateString()}`
            : ''
        }
        onConfirm={handleDeleteStat}
        onCancel={() => {
          alertModal.close()
          setSelectedStat(null)
        }}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
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

export const ChartsContent: React.FC<Props> = ({ exercises }) => {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)
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
          noneLabel={t.exercises.allMuscles}
          style={styles.filterRow}
        />
        <ChipSelector
          items={EQUIPMENT_LIST}
          selectedValue={filterEquipment}
          onChange={setFilterEquipment}
          noneLabel={t.exercises.allEquipment}
          style={[styles.filterRow, { marginTop: spacing.sm }]}
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
            <Text style={styles.emptyText}>{t.charts.emptySelectExercise}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const SCREEN_PADDING_H = 20
const CHART_BORDER_RADIUS = 16
const FILTER_PADDING_V = 10
const SELECTOR_PADDING_V = 15
const CHIP_MARGIN_RIGHT = 10
const FONT_SIZE_CHIP = 13
const LIST_PADDING_BOTTOM = 100
const CHART_MARGIN_BOTTOM = 20
const HISTORY_TITLE_MARGIN_TOP = 25
const HISTORY_TITLE_MARGIN_BOTTOM = 15
const LOG_ROW_PADDING = 15

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filtersWrapper: { paddingVertical: FILTER_PADDING_V, borderBottomWidth: 1, borderBottomColor: colors.card },
    filterRow: { paddingHorizontal: SCREEN_PADDING_H },
    selectorContainer: {
      paddingVertical: SELECTOR_PADDING_V,
      borderBottomWidth: 1,
      borderBottomColor: colors.card,
      backgroundColor: colors.background,
    },
    exoScroll: { paddingHorizontal: SCREEN_PADDING_H },
    exoChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: FILTER_PADDING_V,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardSecondary,
      marginRight: CHIP_MARGIN_RIGHT,
    },
    exoChipActive: { backgroundColor: colors.primary },
    exoChipText: { color: colors.textSecondary, fontSize: FONT_SIZE_CHIP, fontWeight: '600' },
    exoChipTextActive: { color: colors.text },
    contentArea: { flex: 1 },
    statsContainer: { flex: 1 },
    listContent: { padding: SCREEN_PADDING_H, paddingBottom: LIST_PADDING_BOTTOM },
    chartWrapper: { marginBottom: CHART_MARGIN_BOTTOM },
    chart: { borderRadius: CHART_BORDER_RADIUS, marginVertical: spacing.sm },
    historyTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: 'bold', marginTop: HISTORY_TITLE_MARGIN_TOP, marginBottom: HISTORY_TITLE_MARGIN_BOTTOM },
    logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      padding: LOG_ROW_PADDING,
      borderRadius: borderRadius.md,
      marginBottom: CHIP_MARGIN_RIGHT,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    logInfo: { flex: 1 },
    logMainText: { color: colors.text, fontSize: fontSize.bodyMd, fontWeight: 'bold' },
    logDate: { color: colors.placeholder, fontSize: fontSize.caption, marginTop: 2, marginBottom: 6 },
    setDetailText: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
    actionBtns: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: { padding: CHIP_MARGIN_RIGHT },
    emptyState: { marginTop: 50, paddingHorizontal: spacing.xxl },
    emptyText: {
      color: colors.placeholder,
      textAlign: 'center',
      fontSize: fontSize.bodyMd,
      fontStyle: 'italic',
      lineHeight: 22,
    },
  }), [colors])
}

const ObservableContent = withObservables([], () => ({
  exercises: database
    .get<Exercise>('exercises')
    .query(
      Q.sortBy('name', Q.asc),
      Q.on('sets', Q.where('id', Q.notEq(null)))
    )
    .observe(),
}))(ChartsContent)

const ChartsScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default ChartsScreen
