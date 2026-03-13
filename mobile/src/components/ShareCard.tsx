import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { spacing, borderRadius, fontSize } from '../theme'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkoutShareCardProps {
  variant: 'workout'
  durationSeconds: number
  totalVolume: number
  totalSets: number
  totalPrs: number
  xpGained: number
  level: number
  currentStreak: number
  newBadges: { title: string; icon: string }[]
}

export interface BadgeShareCardProps {
  variant: 'badge'
  title: string
  description: string
  icon: string
  category: string
}

export interface PRShareCardProps {
  variant: 'pr'
  exerciseName: string
  weight: number
  reps: number
  estimated1RM: number
}

export type ShareCardProps = WorkoutShareCardProps | BadgeShareCardProps | PRShareCardProps

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number, hLabel: string, minLabel: string): string {
  const totalMinutes = Math.round(seconds / 60)
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return mins > 0 ? `${hours}${hLabel} ${String(mins).padStart(2, '0')}${minLabel}` : `${hours}${hLabel}`
  }
  return `${totalMinutes}${minLabel}`
}

function formatVolume(kg: number): string {
  return Math.round(kg)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CardHeader({ colors, t }: { colors: ReturnType<typeof useColors>; t: ReturnType<typeof useLanguage>['t'] }) {
  return (
    <View style={[styles.header, { backgroundColor: colors.primary + '20' }]}>
      <Text style={[styles.headerText, { color: colors.primary }]}>
        {'\u{1F3CB}\u{FE0F}  '}{t.share.appName}
      </Text>
    </View>
  )
}

function CardFooter({ colors, t }: { colors: ReturnType<typeof useColors>; t: ReturnType<typeof useLanguage>['t'] }) {
  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        {t.share.branding}
      </Text>
    </View>
  )
}

// ─── Workout Variant ─────────────────────────────────────────────────────────

function WorkoutCard({ props, colors, t }: {
  props: WorkoutShareCardProps
  colors: ReturnType<typeof useColors>
  t: ReturnType<typeof useLanguage>['t']
}) {
  const durationFormatted = formatDuration(props.durationSeconds, t.share.hourShort, t.share.minShort)
  const volumeFormatted = `${formatVolume(props.totalVolume)} ${t.share.kg}`

  return (
    <>
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statEmoji}>{'\u23F1\u{FE0F}'}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{durationFormatted}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.share.duration}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statEmoji}>{'\u{1F4CA}'}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{volumeFormatted}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.share.volume}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statEmoji}>{'\u{1F522}'}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{props.totalSets}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.share.sets}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statEmoji}>{'\u{1F947}'}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{props.totalPrs}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.share.prs}</Text>
        </View>
      </View>

      <View style={[styles.gamificationBar, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        <Text style={[styles.gamificationItem, { color: colors.primary }]}>
          +{props.xpGained} {t.share.xp}
        </Text>
        <View style={[styles.gamificationSeparator, { backgroundColor: colors.border }]} />
        <Text style={[styles.gamificationItem, { color: colors.text }]}>
          {t.share.level} {props.level}
        </Text>
        <View style={[styles.gamificationSeparator, { backgroundColor: colors.border }]} />
        <Text style={[styles.gamificationItem, { color: colors.text }]}>
          {'\u{1F525}'}{props.currentStreak}
        </Text>
      </View>

      {props.newBadges.length > 0 && (
        <View style={[styles.badgesRow, { borderBottomColor: colors.border }]}>
          {props.newBadges.map((badge, index) => (
            <View key={index} style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeTitle, { color: colors.text }]}>{badge.title}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  )
}

// ─── Badge Variant ───────────────────────────────────────────────────────────

function BadgeCard({ props, colors, t }: {
  props: BadgeShareCardProps
  colors: ReturnType<typeof useColors>
  t: ReturnType<typeof useLanguage>['t']
}) {
  return (
    <View style={styles.badgeContent}>
      <Text style={[styles.badgeUnlockedLabel, { color: colors.primary }]}>
        {t.share.badgeUnlocked}
      </Text>
      <Text style={styles.badgeLargeIcon}>{props.icon}</Text>
      <Text style={[styles.badgeName, { color: colors.text }]}>{props.title}</Text>
      <Text style={[styles.badgeDescription, { color: colors.textSecondary }]}>
        {props.description}
      </Text>
      <View style={[styles.badgeCategoryChip, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.badgeCategoryText, { color: colors.primary }]}>
          {props.category}
        </Text>
      </View>
    </View>
  )
}

// ─── PR Variant ──────────────────────────────────────────────────────────────

function PRCard({ props, colors, t }: {
  props: PRShareCardProps
  colors: ReturnType<typeof useColors>
  t: ReturnType<typeof useLanguage>['t']
}) {
  return (
    <View style={styles.prContent}>
      <Text style={[styles.prLabel, { color: colors.primary }]}>
        {'\u{1F947} '}{t.share.newRecord}
      </Text>
      <Text style={[styles.prExerciseName, { color: colors.text }]}>
        {props.exerciseName}
      </Text>
      <Text style={[styles.prMainStat, { color: colors.text }]}>
        {props.weight} {t.share.kg} \u00D7 {props.reps} {t.share.reps}
      </Text>
      <View style={[styles.prDivider, { backgroundColor: colors.border }]} />
      <Text style={[styles.prEstimate, { color: colors.textSecondary }]}>
        {'\u{1F4C8} '}{t.share.estimated1RM} : {props.estimated1RM} {t.share.kg}
      </Text>
    </View>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ShareCard(props: ShareCardProps) {
  const colors = useColors()
  const { t } = useLanguage()

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <CardHeader colors={colors} t={t} />

      {props.variant === 'workout' && (
        <WorkoutCard props={props} colors={colors} t={t} />
      )}
      {props.variant === 'badge' && (
        <BadgeCard props={props} colors={colors} t={t} />
      )}
      {props.variant === 'pr' && (
        <PRCard props={props} colors={colors} t={t} />
      )}

      <CardFooter colors={colors} t={t} />
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: 340,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Header
  header: {
    paddingVertical: spacing.ms,
    paddingHorizontal: spacing.lg,
  },
  headerText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.caption,
  },

  // Workout — Stats grid (2x2)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statCell: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statEmoji: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },

  // Workout — Gamification bar
  gamificationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  gamificationItem: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
  gamificationSeparator: {
    width: 1,
    height: 16,
  },

  // Workout — Badges row
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeIcon: {
    fontSize: fontSize.md,
  },
  badgeTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  // Badge variant
  badgeContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  badgeUnlockedLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  badgeLargeIcon: {
    fontSize: fontSize.jumbo,
    marginBottom: spacing.md,
  },
  badgeName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badgeDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  badgeCategoryChip: {
    paddingHorizontal: spacing.ms,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeCategoryText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  // PR variant
  prContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  prLabel: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  prExerciseName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  prMainStat: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  prDivider: {
    width: 60,
    height: 1,
    marginBottom: spacing.md,
  },
  prEstimate: {
    fontSize: fontSize.md,
  },
})
