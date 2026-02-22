import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
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
} from '../model/utils/statsHelpers'
import { formatRelativeDate } from '../model/utils/databaseHelpers'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

function StatsExercisesScreenBase({ sets, exercises, histories }: Props) {
  const prs = useMemo(
    () => computePRsByExercise(sets, exercises, histories),
    [sets, exercises, histories]
  )

  const topFrequency = useMemo(
    () => computeTopExercisesByFrequency(sets, exercises, histories, 5),
    [sets, exercises, histories]
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Records personnels */}
      <Text style={styles.sectionTitle}>Records personnels</Text>
      {prs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucun record enregistré pour l'instant.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {prs.map((pr, i) => (
            <View
              key={pr.exerciseId}
              style={[styles.prRow, i < prs.length - 1 && styles.rowBorder]}
            >
              <View style={styles.prLeft}>
                <Text style={styles.prName} numberOfLines={1}>{pr.exerciseName}</Text>
                <Text style={styles.prDate}>{formatRelativeDate(new Date(pr.date))}</Text>
              </View>
              <View style={styles.prRight}>
                <Text style={styles.prValue}>
                  {pr.weight} kg × {pr.reps}
                </Text>
                <Text style={styles.prOrm}>→ 1RM ~{pr.orm1} kg</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Top exercices par fréquence */}
      <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
        Exercices les plus pratiqués
      </Text>
      {topFrequency.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucune séance enregistrée pour l'instant.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {topFrequency.map((ex, i) => (
            <View
              key={ex.exerciseId}
              style={[styles.freqRow, i < topFrequency.length - 1 && styles.rowBorder]}
            >
              <Text style={styles.freqRank}>{i + 1}</Text>
              <Text style={styles.freqName} numberOfLines={1}>{ex.exerciseName}</Text>
              <Text style={styles.freqCount}>{ex.count} fois</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
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

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
}))

export default enhance(StatsExercisesScreenBase)
