import React, { useMemo, useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import {
  computePRsByExercise,
  computeTopExercisesByFrequency,
  prepareStatsContext,
} from '../model/utils/statsHelpers'
import { formatRelativeDate } from '../model/utils/databaseHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { ChipSelector } from '../components/ChipSelector'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

export function StatsExercisesScreenBase({ sets, exercises, histories }: Props) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const {
    searchQuery,
    setSearchQuery,
    filterMuscle,
    setFilterMuscle,
    filterEquipment,
    setFilterEquipment,
    filteredExercises,
  } = useExerciseFilters(exercises)

  const ctx = useMemo(
    () => prepareStatsContext(histories, exercises),
    [histories, exercises]
  )

  const prs = useMemo(
    () => computePRsByExercise(sets, exercises, histories, ctx),
    [sets, exercises, histories, ctx]
  )

  const topFrequency = useMemo(
    () => computeTopExercisesByFrequency(sets, exercises, histories, 5, ctx),
    [sets, exercises, histories, ctx]
  )

  const hasActiveFilter = searchQuery !== '' || filterMuscle !== null || filterEquipment !== null

  const filteredIds = useMemo(() => {
    if (!hasActiveFilter) return null
    return new Set(filteredExercises.map(e => e.id))
  }, [filteredExercises, hasActiveFilter])

  const filteredPrs = useMemo(() => {
    if (!filteredIds) return prs
    return prs.filter(pr => filteredIds.has(pr.exerciseId))
  }, [prs, filteredIds])

  const filteredTopFrequency = useMemo(() => {
    if (!filteredIds) return topFrequency
    return topFrequency.filter(ex => filteredIds.has(ex.exerciseId))
  }, [topFrequency, filteredIds])

  const noResults = hasActiveFilter && filteredPrs.length === 0 && filteredTopFrequency.length === 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Filtres */}
      <TextInput
        style={styles.searchInput}
        placeholder={t.exercises.search}
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        returnKeyType="search"
      />
      <ChipSelector
        items={MUSCLES_LIST}
        selectedValue={filterMuscle}
        onChange={setFilterMuscle}
        noneLabel={t.exercises.allMuscles}
        style={styles.chipRow}
      />
      <ChipSelector
        items={EQUIPMENT_LIST}
        selectedValue={filterEquipment}
        onChange={setFilterEquipment}
        noneLabel={t.exercises.allEquipment}
        style={styles.chipRow}
      />

      {noResults ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t.statsExercises.noResults}</Text>
        </View>
      ) : (
        <>
          {/* Records personnels */}
          <Text style={styles.sectionTitle}>{t.statsExercises.personalRecords}</Text>
          {filteredPrs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t.statsExercises.noRecords}</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {filteredPrs.map((pr, i) => (
                <View
                  key={pr.exerciseId}
                  style={[styles.prRow, i < filteredPrs.length - 1 && styles.rowBorder]}
                >
                  <View style={styles.prLeft}>
                    <Text style={styles.prName} numberOfLines={1}>{pr.exerciseName}</Text>
                    <Text style={styles.prDate}>{formatRelativeDate(new Date(pr.date))}</Text>
                  </View>
                  <View style={styles.prRight}>
                    <Text style={styles.prValue}>
                      {t.statsExercises.prValue.replace('{weight}', String(pr.weight)).replace('{reps}', String(pr.reps))}
                    </Text>
                    <Text style={styles.prOrm}>{t.statsExercises.prOrm.replace('{orm}', String(pr.orm1))}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Top exercices par fréquence */}
          <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
            {t.statsExercises.mostPracticed}
          </Text>
          {filteredTopFrequency.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t.statsExercises.noSessions}</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {filteredTopFrequency.map((ex, i) => (
                <View
                  key={ex.exerciseId}
                  style={[styles.freqRow, i < filteredTopFrequency.length - 1 && styles.rowBorder]}
                >
                  <Text style={styles.freqRank}>{i + 1}</Text>
                  <Text style={styles.freqName} numberOfLines={1}>{ex.exerciseName}</Text>
                  <Text style={styles.freqCount}>{t.statsExercises.freqCount.replace('{count}', String(ex.count))}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    searchInput: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      height: 45,
      color: colors.text,
      fontSize: fontSize.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    chipRow: {
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    sectionTitleMargin: {
      marginTop: spacing.lg,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    prRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    },
    prLeft: {
      flex: 1,
      marginRight: spacing.sm,
    },
    prName: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    prDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    prRight: {
      alignItems: 'flex-end',
    },
    prValue: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.primary,
    },
    prOrm: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    freqRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    },
    freqRank: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
      width: 28,
    },
    freqName: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
      marginHorizontal: spacing.sm,
    },
    freqCount: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  })
}

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
}))

const ObservableStatsExercisesContent = enhance(StatsExercisesScreenBase)

const StatsExercisesScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsExercisesContent />}
    </View>
  )
}

export default StatsExercisesScreen
