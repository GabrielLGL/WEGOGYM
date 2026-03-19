import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import History from '../../model/models/History'
import { computeStreakHeatmap } from '../../model/utils/streakHeatmapHelpers'
import { computeStreakMilestones } from '../../model/utils/streakMilestonesHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

function getHeatmapColor(intensity: 0 | 1 | 2 | 3, colors: ThemeColors): string {
  switch (intensity) {
    case 0: return colors.card
    case 1: return colors.heatmap1
    case 2: return colors.heatmap2
    case 3: return colors.heatmap3
  }
}

interface HomeStreakSectionProps {
  histories: History[]
}

export function HomeStreakSection({ histories }: HomeStreakSectionProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const styles = useStyles(colors)
  const [expanded, setExpanded] = useState(false)

  const heatmapData = useMemo(
    () => computeStreakHeatmap(histories),
    [histories],
  )

  const milestonesData = useMemo(() => {
    const mapped = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeStreakMilestones(mapped, t.home.milestones.labels as unknown as Record<number, string>)
  }, [histories, t.home.milestones.labels])

  if (heatmapData.totalWorkouts === 0 && milestonesData.currentStreak === 0) return null

  const handleToggle = () => {
    haptics.onSelect()
    setExpanded(!expanded)
  }

  return (
    <View style={styles.container}>
      {/* Collapsed header (always visible) */}
      <TouchableOpacity
        style={styles.headerCard}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t.accessibility.streak}
        accessibilityHint={t.accessibility.toggleExpand}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t.home.heatmap.title}</Text>
          <View style={styles.headerRight}>
            {heatmapData.currentStreak > 0 && (
              <Text style={styles.streakBadge}>
                🔥 {heatmapData.currentStreak}j
              </Text>
            )}
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Heatmap */}
          {heatmapData.totalWorkouts > 0 && (
            <View style={styles.detailCard}>
              <View style={styles.heatmapStats}>
                <Text style={styles.heatmapSubtitle}>
                  {heatmapData.activeDays} {t.home.heatmap.activeDays}
                </Text>
                {heatmapData.currentStreak > 0 && (
                  <Text style={styles.heatmapSubtitle}>
                    {t.home.heatmap.streak} {heatmapData.currentStreak}j
                  </Text>
                )}
              </View>
              <View style={styles.heatmapGrid}>
                {Array.from({ length: 13 }, (_, wi) => (
                  <View key={wi} style={styles.heatmapColumn}>
                    {heatmapData.days.slice(wi * 7, wi * 7 + 7).map((day, di) => (
                      <View
                        key={di}
                        style={[
                          styles.heatmapCell,
                          { backgroundColor: getHeatmapColor(day.intensity, colors) },
                          day.isToday && styles.heatmapCellToday,
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.heatmapLegend}>
                <Text style={styles.heatmapLegendText}>{t.home.heatmap.less}</Text>
                {([0, 1, 2, 3] as const).map(i => (
                  <View
                    key={i}
                    style={[styles.heatmapLegendCell, { backgroundColor: getHeatmapColor(i, colors) }]}
                  />
                ))}
                <Text style={styles.heatmapLegendText}>{t.home.heatmap.more}</Text>
              </View>
            </View>
          )}

          {/* Milestones */}
          {milestonesData.currentStreak > 0 && (
            <View style={styles.detailCard}>
              <View style={styles.milestonesHeader}>
                <Text style={styles.milestonesTitle}>{t.home.milestones.title}</Text>
                <Text style={styles.milestonesStreak}>
                  {milestonesData.currentStreak}j {t.home.milestones.streak}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.milestonesScroll}>
                {milestonesData.milestones.map(m => (
                  <View key={m.days} style={[
                    styles.milestoneBadge,
                    { backgroundColor: m.reached ? colors.primary : colors.background, opacity: m.reached ? 1 : 0.4 },
                  ]}>
                    <Text style={styles.milestoneIcon}>{m.icon}</Text>
                    <Text style={[styles.milestoneDays, { color: m.reached ? colors.primaryText : colors.textSecondary }]}>
                      {m.days}j
                    </Text>
                  </View>
                ))}
              </ScrollView>
              {milestonesData.nextMilestone && (
                <View style={styles.nextMilestoneRow}>
                  <View style={styles.nextMilestoneBarTrack}>
                    <View style={[styles.nextMilestoneBarFill, { width: `${milestonesData.progressToNext}%` }]} />
                  </View>
                  <Text style={styles.nextMilestoneLabel}>
                    {milestonesData.daysToNext}j → {milestonesData.nextMilestone.label}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    streakBadge: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.primary,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    heatmapStats: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    heatmapSubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    heatmapGrid: {
      flexDirection: 'row',
      gap: 3,
      justifyContent: 'center',
    },
    heatmapColumn: {
      gap: 3,
    },
    heatmapCell: {
      width: 18,
      height: 18,
      borderRadius: 3,
    },
    heatmapCellToday: {
      borderWidth: 1.5,
      borderColor: colors.heatmap3,
    },
    heatmapLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
    heatmapLegendCell: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
    heatmapLegendText: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
    },
    milestonesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    milestonesTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    milestonesStreak: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    milestonesScroll: {
      marginBottom: spacing.sm,
    },
    milestoneBadge: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    milestoneIcon: {
      fontSize: fontSize.lg,
    },
    milestoneDays: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },
    nextMilestoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    nextMilestoneBarTrack: {
      flex: 1,
      height: 6,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xxs,
      overflow: 'hidden' as const,
    },
    nextMilestoneBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xxs,
    },
    nextMilestoneLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
  }), [colors])
}
