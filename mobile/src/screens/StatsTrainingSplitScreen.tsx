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
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import History from '../model/models/History'
import { analyzeTrainingSplit } from '../model/utils/trainingSplitHelpers'
import type { SplitType } from '../model/utils/trainingSplitHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Couleurs par type de split ───────────────────────────────────────────────

function getSplitColor(type: SplitType, primary: string, danger: string, textMuted: string): string {
  switch (type) {
    case 'push':     return primary
    case 'pull':     return '#8B5CF6'
    case 'legs':     return '#F59E0B'
    case 'upper':    return primary
    case 'lower':    return '#F59E0B'
    case 'fullBody': return '#10B981'
    case 'cardio':   return danger
    case 'arms':     return '#EC4899'
    case 'other':    return textMuted
  }
}

// ─── Composants UI ────────────────────────────────────────────────────────────

interface BarRowProps {
  label: string
  count: number
  total: number
  color: string
  sessionLabel: string
  colors: ThemeColors
}

function BarRow({ label, count, total, color, sessionLabel, colors }: BarRowProps) {
  if (count === 0) return null
  const ratio = total > 0 ? count / total : 0
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.text, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
          {count} {sessionLabel}
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.cardSecondary, borderRadius: borderRadius.xxs, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${Math.round(ratio * 100)}%`, backgroundColor: color, borderRadius: borderRadius.xxs }} />
      </View>
    </View>
  )
}

// ─── Écran principal ──────────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
}

function StatsTrainingSplitBase({ sets, exercises, histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const analysis = useMemo(() => {
    const setsData = sets.map(s => ({ exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const exercisesData = exercises.map(e => ({ id: e.id, muscles: e.muscles ?? [] }))
    const historiesData = histories.map(h => ({
      createdAt: h.createdAt,
      deletedAt: h.deletedAt,
      isAbandoned: h.isAbandoned ?? false,
    }))
    return analyzeTrainingSplit(setsData, exercisesData, historiesData, 30)
  }, [sets, exercises, histories])

  const ts = t.trainingSplit
  const splitTypes: SplitType[] = ['push', 'pull', 'legs', 'upper', 'lower', 'fullBody', 'cardio', 'arms', 'other']
  const total = analysis.sessions.length

  const patternLabel = ts.patterns[analysis.dominantPattern as keyof typeof ts.patterns] ?? analysis.dominantPattern

  // Timeline : 30 derniers jours
  const today = new Date()
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })

  const sessionByDay = new Map<string, SplitType>()
  for (const s of analysis.sessions) {
    const day = new Date(s.date).toISOString().slice(0, 10)
    sessionByDay.set(day, s.splitType)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {total === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{ts.noData}</Text>
        </View>
      ) : (
        <>
          {/* ── Pattern détecté ── */}
          <View style={styles.patternCard}>
            <Text style={styles.sectionLabel}>{ts.detectedPattern}</Text>
            <Text style={styles.patternName}>{patternLabel}</Text>
            <Text style={styles.consistencyText}>
              {ts.consistency} : {analysis.consistency}%
            </Text>
          </View>

          {/* ── Distribution ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{ts.distribution}</Text>
            {splitTypes.map(type => (
              <BarRow
                key={type}
                label={ts.types[type]}
                count={analysis.distribution[type]}
                total={total}
                color={getSplitColor(type, colors.primary, colors.danger, colors.placeholder)}
                sessionLabel={ts.sessions}
                colors={colors}
              />
            ))}
          </View>

          {/* ── Timeline ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>30 jours</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.timelineRow}>
                {days30.map(day => {
                  const splitType = sessionByDay.get(day)
                  const color = splitType
                    ? getSplitColor(splitType, colors.primary, colors.danger, colors.placeholder)
                    : colors.cardSecondary
                  const dayNum = parseInt(day.slice(8, 10), 10)
                  return (
                    <View key={day} style={styles.dayCell}>
                      <View style={[styles.dayDot, { backgroundColor: color }]} />
                      <Text style={styles.dayNum}>{dayNum}</Text>
                    </View>
                  )
                })}
              </View>
            </ScrollView>
            {/* Légende */}
            <View style={styles.legendRow}>
              {splitTypes
                .filter(type => analysis.distribution[type] > 0)
                .map(type => (
                  <View key={type} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: getSplitColor(type, colors.primary, colors.danger, colors.placeholder) }]} />
                    <Text style={styles.legendLabel}>{ts.types[type]}</Text>
                  </View>
                ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
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
      padding: spacing.md,
      paddingBottom: spacing.xl + 60,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    patternCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    sectionLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    patternName: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    consistencyText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: spacing.xs,
    },
    dayCell: {
      alignItems: 'center',
      gap: 4,
    },
    dayDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    dayNum: {
      fontSize: 9,
      color: colors.placeholder,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
}))

const ObservableContent = enhance(StatsTrainingSplitBase)

const StatsTrainingSplitScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsTrainingSplitScreen
