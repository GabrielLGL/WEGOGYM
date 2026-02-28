import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { database } from '../model'
import UserBadge from '../model/models/UserBadge'
import {
  BADGES_LIST,
  BADGE_CATEGORY_LABELS,
  type BadgeCategory,
  type BadgeDefinition,
} from '../model/utils/badgeConstants'
import { BadgeCard } from '../components/BadgeCard'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

// ─── Ordre d'affichage des catégories ─────────────────────────────────────────

const CATEGORY_ORDER: BadgeCategory[] = [
  'sessions',
  'tonnage',
  'streak',
  'level',
  'pr',
  'session_volume',
  'exercises',
]

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  userBadges: UserBadge[]
}

function BadgesScreenBase({ userBadges }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  const unlockedIds = useMemo(
    () => new Set(userBadges.map(b => b.badgeId)),
    [userBadges],
  )

  const unlockedAt = useMemo(() => {
    const map: Record<string, Date> = {}
    for (const ub of userBadges) {
      map[ub.badgeId] = ub.unlockedAt
    }
    return map
  }, [userBadges])

  const badgesByCategory = useMemo(() => {
    const map: Record<BadgeCategory, BadgeDefinition[]> = {
      sessions: [],
      tonnage: [],
      streak: [],
      level: [],
      pr: [],
      session_volume: [],
      exercises: [],
    }
    for (const badge of BADGES_LIST) {
      map[badge.category].push(badge)
    }
    return map
  }, [])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Compteur total */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {unlockedIds.size}/{BADGES_LIST.length} {t.badges.unlocked}
        </Text>
      </View>

      {/* Sections par catégorie */}
      {CATEGORY_ORDER.map(category => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t.badges.categories[category] ?? BADGE_CATEGORY_LABELS[category]}
          </Text>
          <View style={styles.grid}>
            {badgesByCategory[category].map(badge => (
              <View key={badge.id} style={styles.gridItem}>
                <BadgeCard
                  badge={badge}
                  unlocked={unlockedIds.has(badge.id)}
                  unlockedAt={unlockedAt[badge.id]}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    counterRow: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    counterText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.primary,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gridItem: {
      width: '31%',
    },
  })
}

// ─── withObservables ──────────────────────────────────────────────────────────

export default withObservables([], () => ({
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
}))(BadgesScreenBase)
