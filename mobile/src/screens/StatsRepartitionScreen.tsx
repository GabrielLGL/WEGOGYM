import React, { useState, useMemo } from 'react'
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
  computeMuscleRepartition,
  formatVolume,
  type StatsPeriod,
} from '../model/utils/statsHelpers'
import { ChipSelector } from '../components/ChipSelector'
import { colors, spacing, borderRadius, fontSize } from '../theme'

const PERIOD_LABELS = ['1 mois', '3 mois', 'Tout']

function labelToPeriod(label: string | null): StatsPeriod {
  if (label === '3 mois') return '3m'
  if (label === 'Tout') return 'all'
  return '1m'
}

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

function StatsRepartitionScreenBase({ sets, exercises, histories }: Props) {
  const [periodLabel, setPeriodLabel] = useState<string>('1 mois')
  const period = labelToPeriod(periodLabel)

  const repartition = useMemo(
    () => computeMuscleRepartition(sets, exercises, histories, period),
    [sets, exercises, histories, period]
  )

  const totalVolume = useMemo(
    () => repartition.reduce((sum, r) => sum + r.volume, 0),
    [repartition]
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ChipSelector
        items={PERIOD_LABELS}
        selectedValue={periodLabel}
        onChange={label => { if (label) setPeriodLabel(label) }}
        allowNone={false}
        noneLabel=""
      />

      {repartition.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Aucune donnée pour cette période.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.barsList}>
            {repartition.map(item => (
              <View key={item.muscle} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.muscleName}>{item.muscle}</Text>
                  <Text style={styles.musclePct}>{item.pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${item.pct}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.totalText}>
            Volume analysé : {formatVolume(totalVolume)}
          </Text>
        </>
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
  barsList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  barRow: {
    gap: spacing.xs,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleName: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  musclePct: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.cardSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  totalText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
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

export default enhance(StatsRepartitionScreenBase)
