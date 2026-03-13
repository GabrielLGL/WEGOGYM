import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import User from '../model/models/User'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { computeTitles } from '../model/utils/titlesHelpers'
import type { TitleDefinition } from '../model/utils/titlesHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Title Card ───────────────────────────────────────────────────────────────

interface TitleCardProps {
  title: TitleDefinition
  colors: ThemeColors
  name: string
  description: string
}

function TitleCard({ title, colors, name, description }: TitleCardProps) {
  const styles = useCardStyles(colors)
  const isUnlocked = title.unlocked

  return (
    <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
      <View style={styles.iconContainer}>
        {isUnlocked ? (
          <Ionicons
            name={title.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={colors.primary}
          />
        ) : (
          <Ionicons name="lock-closed-outline" size={24} color={colors.placeholder} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.titleName, !isUnlocked && styles.titleNameLocked]}>
          {name}
        </Text>
        <Text style={[styles.titleDesc, !isUnlocked && styles.titleDescLocked]}>
          {description}
        </Text>
      </View>
    </View>
  )
}

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardLocked: {
      opacity: 0.6,
    },
    iconContainer: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.ms,
    },
    textContainer: {
      flex: 1,
    },
    titleName: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    titleNameLocked: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    titleDesc: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    titleDescLocked: {
      color: colors.placeholder,
    },
  }), [colors])
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, colors }: { label: string; colors: ThemeColors }) {
  return (
    <Text style={{
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginTop: spacing.ms,
    }}>
      {label}
    </Text>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  user: User | null
  histories: History[]
  sets: WorkoutSet[]
}

function TitlesScreenBase({ user, histories, sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const distinctExercises = useMemo(() => {
    const ids = new Set(sets.map(s => s.exerciseId).filter(Boolean))
    return ids.size
  }, [sets])

  const titles = useMemo(() => {
    if (!user) return []
    return computeTitles(user, histories.length, distinctExercises)
  }, [user, histories, distinctExercises])

  const unlockedTitles = useMemo(() => titles.filter(title => title.unlocked), [titles])
  const lockedTitles   = useMemo(() => titles.filter(title => !title.unlocked), [titles])

  const unlockedCount = unlockedTitles.length
  const totalCount    = titles.length
  const progressRatio = totalCount > 0 ? unlockedCount / totalCount : 0

  const titleNames        = t.titles.names as Record<string, string>
  const titleDescriptions = t.titles.descriptions as Record<string, string>

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Card ── */}
      <View style={styles.headerCard}>
        <Text style={styles.progressText}>
          <Text style={styles.progressCount}>{unlockedCount}</Text>
          {' '}{t.titles.progress}{' '}
          <Text style={styles.progressTotal}>{totalCount}</Text>
        </Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${Math.round(progressRatio * 100)}%` as unknown as number }]} />
        </View>
      </View>

      {/* ── Section Débloqués ── */}
      {unlockedTitles.length > 0 && (
        <>
          <SectionHeader label={t.titles.unlockedSection} colors={colors} />
          {unlockedTitles.map(title => (
            <TitleCard
              key={title.id}
              title={title}
              colors={colors}
              name={titleNames[title.id] ?? title.id}
              description={titleDescriptions[title.id] ?? ''}
            />
          ))}
        </>
      )}

      {/* ── Section Verrouillés ── */}
      {lockedTitles.length > 0 && (
        <>
          <SectionHeader label={t.titles.lockedSection} colors={colors} />
          {lockedTitles.map(title => (
            <TitleCard
              key={title.id}
              title={title}
              colors={colors}
              name={titleNames[title.id] ?? title.id}
              description={titleDescriptions[title.id] ?? ''}
            />
          ))}
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
    progressTotal: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    progressBarBackground: {
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

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  user: observeCurrentUser(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observe(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
  ).observe(),
}))

const ObservableContent = enhance(TitlesScreenBase)

const TitlesScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default TitlesScreen
