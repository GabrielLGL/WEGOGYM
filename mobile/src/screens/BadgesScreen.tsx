import React, { type ComponentProps, useMemo, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ViewShot from 'react-native-view-shot'
import withObservables from '@nozbe/with-observables'
import { database } from '../model'
import UserBadge from '../model/models/UserBadge'
import {
  BADGES_LIST,
  type BadgeCategory,
  type BadgeDefinition,
} from '../model/utils/badgeConstants'
import { BadgeCard } from '../components/BadgeCard'
import { BottomSheet } from '../components/BottomSheet'
import { ShareBottomSheet } from '../components/ShareBottomSheet'
import ShareCard from '../components/ShareCard'
import { generateBadgeShareText, shareText, shareImage } from '../services/shareService'
import { useModalState } from '../hooks/useModalState'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
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

// ─── Helper condition text ────────────────────────────────────────────────────

interface BadgeConditions {
  sessions: string
  tonnage_kg: string
  tonnage_t: string
  streak: string
  level: string
  pr: string
  session_volume: string
  exercises: string
  obtained: string
  locked: string
}

function getBadgeConditionText(
  badge: BadgeDefinition,
  conditions: BadgeConditions,
): string {
  const n = badge.threshold

  if (badge.category === 'tonnage') {
    if (n >= 1000) {
      return conditions.tonnage_t.replace('{n}', String(n / 1000))
    }
    return conditions.tonnage_kg.replace('{n}', String(n))
  }

  const keyMap: Record<BadgeCategory, keyof BadgeConditions> = {
    sessions: 'sessions',
    tonnage: 'tonnage_kg',
    streak: 'streak',
    level: 'level',
    pr: 'pr',
    session_volume: 'session_volume',
    exercises: 'exercises',
  }

  return conditions[keyMap[badge.category]].replace('{n}', String(n))
}

// ─── BadgeDetailContent ───────────────────────────────────────────────────────

interface BadgeDetailContentProps {
  badge: BadgeDefinition
  isUnlocked: boolean
  conditionText: string
  description: string | undefined
  colors: ThemeColors
  obtained: string
  locked: string
}

function BadgeDetailContent({
  badge,
  isUnlocked,
  conditionText,
  description,
  colors,
  obtained,
  locked,
}: BadgeDetailContentProps) {
  return (
    <View style={{ padding: spacing.md, alignItems: 'center', gap: spacing.md }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons
          name={badge.icon as ComponentProps<typeof Ionicons>['name']}
          size={48}
          color={isUnlocked ? colors.primary : colors.textSecondary}
        />
      </View>
      {!!description && (
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
          {description}
        </Text>
      )}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.background,
        width: '100%',
      }}>
        <Text>🎯</Text>
        <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.text, flex: 1 }}>
          {conditionText}
        </Text>
      </View>
      <Text style={{
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: isUnlocked ? colors.primary : colors.textSecondary,
      }}>
        {isUnlocked ? obtained : locked}
      </Text>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  userBadges: UserBadge[]
}

function BadgesScreenBase({ userBadges }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const shareSheet = useModalState()
  const detailSheet = useModalState()
  const haptics = useHaptics()
  const viewShotRef = useRef<ViewShot>(null)
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null)
  const [detailBadge, setDetailBadge] = useState<BadgeDefinition | null>(null)

  const unlockedIds = useMemo(
    () => new Set(userBadges.map(b => b.badgeId)),
    [userBadges],
  )

  const handleBadgeLongPress = useCallback((badge: BadgeDefinition) => {
    haptics.onPress()
    setSelectedBadge(badge)
    shareSheet.open()
  }, [haptics, shareSheet])

  const handleBadgePress = useCallback((badge: BadgeDefinition) => {
    haptics.onPress()
    setDetailBadge(badge)
    detailSheet.open()
  }, [haptics, detailSheet])

  const selectedBadgeI18n = selectedBadge
    ? t.badges.list[selectedBadge.id as keyof typeof t.badges.list]
    : null

  const handleShareText = useCallback(async () => {
    shareSheet.close()
    if (!selectedBadge || !selectedBadgeI18n) return
    try {
      const text = generateBadgeShareText({
        title: selectedBadgeI18n.title,
        description: selectedBadgeI18n.description,
        icon: selectedBadge.icon,
        category: selectedBadge.category,
        unlockedAt: new Date(),
      }, t)
      await shareText(text)
    } catch (e) {
      if (__DEV__) console.warn('[BadgesScreen] shareText error:', e)
    }
  }, [shareSheet, selectedBadge, selectedBadgeI18n, t])

  const handleShareImage = useCallback(async () => {
    shareSheet.close()
    try {
      await shareImage(viewShotRef)
    } catch (e) {
      if (__DEV__) console.warn('[BadgesScreen] shareImage error:', e)
    }
  }, [shareSheet])

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
            {t.badges.categories[category]}
          </Text>
          <View style={styles.grid}>
            {badgesByCategory[category].map(badge => {
              const isUnlocked = unlockedIds.has(badge.id)
              return (
                <View key={badge.id} style={styles.gridItem}>
                  <BadgeCard
                    badge={badge}
                    unlocked={isUnlocked}
                    onPress={() => handleBadgePress(badge)}
                    onLongPress={isUnlocked ? () => handleBadgeLongPress(badge) : undefined}
                  />
                </View>
              )
            })}
          </View>
        </View>
      ))}

      {/* Off-screen ViewShot for image capture */}
      {selectedBadge && (
        <View style={{ position: 'absolute', left: -9999 }}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <ShareCard
              variant="badge"
              title={selectedBadgeI18n?.title ?? selectedBadge.id}
              description={selectedBadgeI18n?.description ?? selectedBadge.id}
              icon={selectedBadge.icon}
              category={selectedBadge.category}
            />
          </ViewShot>
        </View>
      )}

      <ShareBottomSheet
        visible={shareSheet.isOpen}
        onClose={shareSheet.close}
        onShareText={handleShareText}
        onShareImage={handleShareImage}
      />

      {detailBadge && (
        <BottomSheet
          visible={detailSheet.isOpen}
          onClose={detailSheet.close}
          title={t.badges.list[detailBadge.id as keyof typeof t.badges.list]?.title ?? detailBadge.id}
        >
          <BadgeDetailContent
            badge={detailBadge}
            isUnlocked={unlockedIds.has(detailBadge.id)}
            conditionText={getBadgeConditionText(detailBadge, t.badges.conditions)}
            description={t.badges.list[detailBadge.id as keyof typeof t.badges.list]?.description}
            colors={colors}
            obtained={t.badges.conditions.obtained}
            locked={t.badges.conditions.locked}
          />
        </BottomSheet>
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
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

export { BadgesScreenBase }

const ObservableBadgesContent = withObservables([], () => ({
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
}))(BadgesScreenBase)

const BadgesScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableBadgesContent />}
    </View>
  )
}

export default BadgesScreen
