import React, { memo, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import History from '../model/models/History'
import Session from '../model/models/Session'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { RootStackParamList } from '../navigation'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ActivityFeed'>

interface ActivityCard {
  historyId: string
  sessionName: string
  startTime: Date
  durationMin: number | null
  totalVolumeKg: number
  totalSets: number
  totalPrs: number
  topExercises: string[]
  topMuscles: string[]
  isAbandoned: boolean
}

function formatRelativeDate(date: Date, t: ReturnType<typeof useLanguage>['t'], language: string): string {
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return t.activityFeed.today
  if (diffDays === 1) return t.activityFeed.yesterday
  if (diffDays < 7) return t.activityFeed.daysAgo.replace('{n}', String(diffDays))
  return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    const val = Math.round(kg / 100) / 10
    return `${val.toLocaleString()}k`
  }
  return `${Math.round(kg).toLocaleString()}`
}

// ─── ActivityCardItem ─────────────────────────────────────────────────────────

interface ActivityCardItemProps {
  item: ActivityCard
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: ReturnType<typeof useLanguage>['t']
  language: string
  onPress: (card: ActivityCard) => void
}

const ActivityCardItem = memo<ActivityCardItemProps>(function ActivityCardItem({
  item, colors, styles, t, language, onPress,
}: ActivityCardItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      {/* Row 1: Icon + Name + Date */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="play-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.sessionName} numberOfLines={1}>{item.sessionName}</Text>
          {item.isAbandoned && (
            <View style={styles.abandonedBadge}>
              <Text style={styles.abandonedText}>{t.activityFeed.abandoned}</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>{formatRelativeDate(item.startTime, t, language)}</Text>
      </View>

      {/* Row 2: Stats */}
      <Text style={styles.statsLine}>
        {item.durationMin !== null ? formatDuration(item.durationMin) : '—'}
        {'  ·  '}
        {formatVolume(item.totalVolumeKg)} kg
        {'  ·  '}
        {item.totalSets} {t.activityFeed.sets}
      </Text>

      {/* Row 3: PRs */}
      {item.totalPrs > 0 && (
        <View style={styles.prRow}>
          <Ionicons name="trophy-outline" size={14} color={colors.primary} />
          <Text style={styles.prText}>{item.totalPrs} {t.activityFeed.prs}</Text>
        </View>
      )}

      {/* Row 4: Exercises */}
      {item.topExercises.length > 0 && (
        <Text style={styles.exercisesLine} numberOfLines={1}>
          {item.topExercises.join(' · ')}
        </Text>
      )}

      {/* Row 5: Muscle chips */}
      {item.topMuscles.length > 0 && (
        <View style={styles.muscleRow}>
          {item.topMuscles.map(muscle => (
            <View key={muscle} style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>
                {(t.muscleNames as Record<string, string>)[muscle] ?? muscle}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  )
})

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  histories: History[]
  sessions: Session[]
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function ActivityFeedScreenBase({ histories, sessions, sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<Navigation>()
  const haptics = useHaptics()
  const { t, language } = useLanguage()

  const cards = useMemo(() => {
    // Build lookup maps
    const sessionMap = new Map(sessions.map(s => [s.id, s.name]))
    const exerciseMap = new Map(exercises.map(e => [e.id, { name: e.name, muscles: e.muscles }]))

    // Group sets by history
    const setsByHistory = new Map<string, WorkoutSet[]>()
    for (const s of sets) {
      const hId = s.history.id
      const list = setsByHistory.get(hId)
      if (list) {
        list.push(s)
      } else {
        setsByHistory.set(hId, [s])
      }
    }

    const result: ActivityCard[] = []
    for (const history of histories) {
      const historySets = setsByHistory.get(history.id) ?? []
      const totalVolumeKg = historySets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      const totalPrs = historySets.filter(s => s.isPr).length

      // Top exercises (first 3 distinct)
      const seenExercises = new Set<string>()
      const topExercises: string[] = []
      for (const s of historySets) {
        const exInfo = exerciseMap.get(s.exercise.id)
        if (exInfo && !seenExercises.has(s.exercise.id)) {
          seenExercises.add(s.exercise.id)
          topExercises.push(exInfo.name)
          if (topExercises.length >= 3) break
        }
      }

      // Top muscles (first 3 distinct)
      const seenMuscles = new Set<string>()
      const topMuscles: string[] = []
      for (const s of historySets) {
        const exInfo = exerciseMap.get(s.exercise.id)
        if (exInfo) {
          for (const m of exInfo.muscles) {
            const trimmed = m.trim()
            if (trimmed && !seenMuscles.has(trimmed)) {
              seenMuscles.add(trimmed)
              topMuscles.push(trimmed)
              if (topMuscles.length >= 3) break
            }
          }
        }
        if (topMuscles.length >= 3) break
      }

      let durationMin: number | null = null
      if (history.endTime) {
        durationMin = Math.round((history.endTime.getTime() - history.startTime.getTime()) / 60000)
      }

      result.push({
        historyId: history.id,
        sessionName: sessionMap.get(history.session.id) ?? t.activityFeed.sessionFallback,
        startTime: history.startTime,
        durationMin,
        totalVolumeKg,
        totalSets: historySets.length,
        totalPrs,
        topExercises,
        topMuscles,
        isAbandoned: history.isAbandoned,
      })
    }

    return result
  }, [histories, sessions, sets, exercises, t.activityFeed.sessionFallback])

  const handlePress = useCallback((card: ActivityCard) => {
    haptics.onPress()
    navigation.navigate('HistoryDetail', { historyId: card.historyId })
  }, [haptics, navigation])

  const renderCard = useCallback(({ item }: { item: ActivityCard }) => (
    <ActivityCardItem
      item={item}
      colors={colors}
      styles={styles}
      t={t}
      language={language}
      onPress={handlePress}
    />
  ), [colors, styles, t, language, handlePress])

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t.activityFeed.empty}</Text>
      <Text style={styles.emptyHint}>{t.activityFeed.emptyHint}</Text>
    </View>
  )

  return (
    <FlatList
      data={cards}
      keyExtractor={item => item.historyId}
      renderItem={renderCard}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={cards.length === 0 ? styles.emptyContent : styles.listContent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      style={{ backgroundColor: colors.background }}
    />
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    emptyContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    sessionName: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    dateText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    statsLine: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    prRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    prText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    exercisesLine: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
    muscleRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    muscleChip: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    muscleChipText: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
    },
    abandonedBadge: {
      backgroundColor: colors.danger,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    abandonedText: {
      fontSize: fontSize.xs,
      color: colors.primaryText,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    emptyHint: {
      fontSize: fontSize.sm,
      color: colors.placeholder,
      textAlign: 'center',
    },
  }), [colors])
}

const enhance = withObservables([], () => ({
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.sortBy('start_time', Q.desc),
    Q.take(50),
  ).observe(),
  sessions: database.get<Session>('sessions').query().observe(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.where('deleted_at', null)),
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const EnhancedActivityFeed = enhance(ActivityFeedScreenBase)

const ActivityFeedScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <EnhancedActivityFeed />}
    </View>
  )
}

export default ActivityFeedScreen
