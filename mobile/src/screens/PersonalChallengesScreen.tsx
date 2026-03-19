import React, { useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import History from '../model/models/History'
import User from '../model/models/User'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { computePersonalChallenges } from '../model/utils/personalChallengesHelpers'
import type { PersonalChallenge } from '../model/utils/personalChallengesHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Difficulty colors ───────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<PersonalChallenge['difficulty'], string> = {
  easy: '',      // filled at render with colors.primary
  medium: '#F59E0B',
  hard: '',      // filled at render with colors.danger
  legendary: '#8B5CF6',
}

function getDifficultyColor(difficulty: PersonalChallenge['difficulty'], colors: ThemeColors): string {
  if (difficulty === 'easy') return colors.primary
  if (difficulty === 'hard') return colors.danger
  return DIFFICULTY_COLORS[difficulty]
}

// ─── Challenge Card ──────────────────────────────────────────────────────────

interface CardProps {
  challenge: PersonalChallenge
  colors: ThemeColors
  challengeTitles: Record<string, string>
  challengeDesc: Record<string, string>
  difficulties: Record<string, string>
  completedBadge: string
}

function ChallengeCard({ challenge, colors, challengeTitles, challengeDesc, difficulties, completedBadge }: CardProps) {
  const styles = useCardStyles(colors)
  const diffColor = getDifficultyColor(challenge.difficulty, colors)

  const descText = (challengeDesc[challenge.id] ?? '')
    .replace('{n}', formatNumber(challenge.targetValue))

  return (
    <View style={[styles.card, challenge.completed && styles.cardCompleted]}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Ionicons
            name={challenge.icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={challenge.completed ? colors.primary : diffColor}
          />
          <Text style={styles.title} numberOfLines={1}>
            {challengeTitles[challenge.id] ?? challenge.id}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: diffColor + '22' }]}>
          <Text style={[styles.badgeText, { color: diffColor }]}>
            {difficulties[challenge.difficulty] ?? challenge.difficulty}
          </Text>
          {challenge.completed && (
            <Ionicons name="checkmark" size={12} color={diffColor} style={{ marginLeft: 2 }} />
          )}
        </View>
      </View>

      <Text style={styles.description}>{descText}</Text>

      <View style={styles.progressRow}>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill,
            {
              width: `${Math.round(challenge.progress * 100)}%` as unknown as number,
              backgroundColor: challenge.completed ? colors.primary : diffColor,
            },
          ]} />
        </View>
        <Text style={styles.progressLabel}>
          {formatNumber(challenge.currentValue)}/{formatNumber(challenge.targetValue)}
        </Text>
      </View>

      {challenge.completed && (
        <Text style={[styles.completedLabel, { color: colors.primary }]}>
          {completedBadge}
        </Text>
      )}
    </View>
  )
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.0', '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '')}k`
  return String(n)
}

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardCompleted: {
      backgroundColor: colors.cardSecondary,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.sm,
    },
    title: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
      marginLeft: spacing.sm,
    },
    badgeText: {
      fontSize: fontSize.caption,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    description: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    progressBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xs,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      borderRadius: borderRadius.xs,
    },
    progressLabel: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
      minWidth: 60,
      textAlign: 'right',
    },
    completedLabel: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      marginTop: spacing.xs,
      textAlign: 'right',
    },
  }), [colors])
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface Props {
  user: User | null
  histories: History[]
}

export function PersonalChallengesBase({ user, histories }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const challenges = useMemo(() => {
    if (!user) return []
    return computePersonalChallenges(user, histories.length)
  }, [user, histories])

  const completedCount = useMemo(() => challenges.filter(c => c.completed).length, [challenges])
  const progressRatio = challenges.length > 0 ? completedCount / challenges.length : 0

  const challengeTitles = (t.challenges?.challengeTitles ?? {}) as Record<string, string>
  const challengeDesc = (t.challenges?.challengeDesc ?? {}) as Record<string, string>
  const difficulties = (t.challenges?.difficulties ?? {}) as Record<string, string>

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={challenges}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.progressText}>
            <Text style={styles.progressCount}>{completedCount}</Text>
            {' / '}{challenges.length}{' '}{t.challenges?.completed ?? 'défis complétés'}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.round(progressRatio * 100)}%` as unknown as number }]} />
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <ChallengeCard
          challenge={item}
          colors={colors}
          challengeTitles={challengeTitles}
          challengeDesc={challengeDesc}
          difficulties={difficulties}
          completedBadge={t.challenges?.completedBadge ?? 'COMPLÉTÉ'}
        />
      )}
    />
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    progressText: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    progressCount: {
      fontSize: fontSize.xxxl,
      fontWeight: '700',
      color: colors.primary,
    },
    progressBarBg: {
      width: '100%',
      height: 8,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xs,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xs,
    },
  }), [colors])
}

// ─── withObservables ─────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  user: observeCurrentUser(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
}))

const ObservableContent = enhance(PersonalChallengesBase)

const PersonalChallengesScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default PersonalChallengesScreen
