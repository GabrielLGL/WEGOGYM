import React, { useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import User from '../model/models/User'
import WorkoutSet from '../model/models/Set'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { computeSkillTree } from '../model/utils/skillTreeHelpers'
import { SkillTreeBranch } from '../components/SkillTreeBranch'
import { spacing, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  user: User | null
  sets: WorkoutSet[]
}

export function SkillTreeScreenBase({ user, sets }: Props) {
  const colors = useColors()
  const { t } = useLanguage()

  const distinctExerciseCount = useMemo(() => {
    const ids = new Set(sets.map(s => s.exercise.id))
    return ids.size
  }, [sets])

  const branches = useMemo(() => {
    if (!user) return []
    return computeSkillTree(user, distinctExerciseCount, colors)
  }, [user, distinctExerciseCount, colors])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t.skillTree.title}
      </Text>

      {/* Grille 2×2 */}
      <View style={styles.grid}>
        {branches.map(branch => (
          <View key={branch.id} style={styles.cell}>
            <SkillTreeBranch branch={branch} />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '48%',
  },
})

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  user: observeCurrentUser(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    ))
  ).observe(),
}))

const ObservableSkillTreeContent = enhance(SkillTreeScreenBase)

const SkillTreeScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableSkillTreeContent />}
    </View>
  )
}

export default SkillTreeScreen
