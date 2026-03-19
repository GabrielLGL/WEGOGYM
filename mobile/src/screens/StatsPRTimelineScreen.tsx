import React, { useMemo } from 'react'
import {
  View,
  Text,
  SectionList,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { buildPRTimeline, type PRTimelineEntry, type PRTimelineMonth } from '../model/utils/prTimelineHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Couleur par dot ──────────────────────────────────────────────────────────

function getDotColor(entry: PRTimelineEntry, primaryColor: string): string {
  return entry.previousPR === null ? '#F59E0B' : primaryColor
}

// ─── Composant TimelineItem ───────────────────────────────────────────────────

interface TimelineItemProps {
  entry: PRTimelineEntry
  isLast: boolean
  colors: ThemeColors
}

function TimelineItem({ entry, isLast, colors }: TimelineItemProps) {
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const pt = t.prTimeline

  const dotColor = getDotColor(entry, colors.primary)
  const gainColor = entry.previousPR === null ? '#F59E0B' : colors.primary

  const date = new Date(entry.date)
  const dateLabel = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const gainLabel = entry.previousPR === null
    ? pt.newPR
    : entry.gain !== null && entry.gainPercent !== null
      ? `+${entry.gain.toFixed(1)} kg (+${entry.gainPercent.toFixed(1)}%) ${pt.gain}`
      : null

  return (
    <View style={styles.timelineItem}>
      {/* Ligne verticale + dot */}
      <View style={styles.timelineLine}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
        {!isLast && <View style={styles.timelineConnector} />}
      </View>

      {/* Contenu */}
      <View style={styles.timelineContent}>
        <Text style={styles.timelineDate}>{dateLabel}</Text>
        <Text style={styles.timelineExercise}>{entry.exerciseName}</Text>
        <Text style={styles.timelineWeight}>
          {entry.weight} kg × {entry.reps}
        </Text>
        {gainLabel !== null && (
          <Text style={[styles.timelineGain, { color: gainColor }]}>
            {gainLabel}
          </Text>
        )}
      </View>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsPRTimelineBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const pt = t.prTimeline

  const months = useMemo(() => buildPRTimeline(sets, exercises), [sets, exercises])

  // ── Stats rapides ────────────────────────────────────────────────────────────
  const totalPRs = useMemo(() => months.reduce((sum, m) => sum + m.totalPRs, 0), [months])

  const thisMonth = useMemo(() => {
    const now = new Date()
    const m = months.find(
      mo => mo.year === now.getFullYear() && mo.monthIndex === now.getMonth(),
    )
    return m?.totalPRs ?? 0
  }, [months])

  const avgGain = useMemo(() => {
    const allEntries = months.flatMap(m => m.entries)
    const gains = allEntries
      .filter(e => e.gainPercent !== null)
      .map(e => e.gainPercent as number)
    if (gains.length === 0) return null
    return gains.reduce((s, g) => s + g, 0) / gains.length
  }, [months])

  // ── Sections ─────────────────────────────────────────────────────────────────
  const sections = useMemo(
    () =>
      months.map(m => ({
        title: m.month,
        count: m.totalPRs,
        data: m.entries,
      })),
    [months],
  )

  if (months.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{pt.noPRs}</Text>
      </View>
    )
  }

  return (
    <SectionList<PRTimelineEntry, { title: string; count: number; data: PRTimelineEntry[] }>
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={item => item.setId}
      // ── Stats rapides ────────────────────────────────────────────────────────
      ListHeaderComponent={
        <View style={styles.prStatsRow}>
          <View style={styles.prStatItem}>
            <Text style={styles.prStatValue}>{totalPRs}</Text>
            <Text style={styles.prStatLabel}>{pt.totalPRs}</Text>
          </View>
          <View style={styles.prStatDivider} />
          <View style={styles.prStatItem}>
            <Text style={styles.prStatValue}>{thisMonth}</Text>
            <Text style={styles.prStatLabel}>{pt.thisMonth}</Text>
          </View>
          <View style={styles.prStatDivider} />
          <View style={styles.prStatItem}>
            <Text style={styles.prStatValue}>
              {avgGain !== null ? `+${avgGain.toFixed(1)}%` : '—'}
            </Text>
            <Text style={styles.prStatLabel}>{pt.avgGain}</Text>
          </View>
        </View>
      }
      // ── En-tête de section (mois) ────────────────────────────────────────────
      renderSectionHeader={({ section }) => (
        <View style={styles.monthHeader}>
          <Text style={styles.monthHeaderText}>{section.title}</Text>
          <Text style={styles.monthPRCount}>
            {section.count} {pt.prs}
          </Text>
        </View>
      )}
      // ── Chaque PR ───────────────────────────────────────────────────────────
      renderItem={({ item, index, section }) => (
        <TimelineItem
          entry={item}
          isLast={index === section.data.length - 1}
          colors={colors}
        />
      )}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: spacing.xxl,
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      textAlign: 'center',
    },
    // Stats rapides
    prStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      marginTop: spacing.md,
    },
    prStatItem: {
      alignItems: 'center',
    },
    prStatDivider: {
      width: 1,
      backgroundColor: colors.separator,
    },
    prStatValue: {
      fontSize: fontSize.xl,
      fontWeight: '900',
      color: colors.text,
    },
    prStatLabel: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      marginTop: 2,
    },
    // En-tête de mois
    monthHeader: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    monthHeaderText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    monthPRCount: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
    },
    // Timeline
    timelineItem: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    timelineLine: {
      width: 24,
      alignItems: 'center',
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
    },
    timelineConnector: {
      flex: 1,
      width: 2,
      backgroundColor: colors.cardSecondary,
      marginTop: 4,
    },
    timelineContent: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginLeft: spacing.sm,
    },
    timelineDate: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
    },
    timelineExercise: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    timelineWeight: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    timelineGain: {
      fontSize: fontSize.caption,
      fontWeight: '700',
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.where('is_pr', true),
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableStatsPRTimeline = enhance(StatsPRTimelineBase)

const StatsPRTimelineScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsPRTimeline />}
    </View>
  )
}

export default StatsPRTimelineScreen
