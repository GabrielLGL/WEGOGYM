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
import {
  computeVolumeRecords,
  type VolumeRecord,
  type VolumeRecordsResult,
} from '../model/utils/volumeRecordsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { ThemeColors } from '../theme'

// ─── Helpers ────────────────────────────────────────────────────────────────

const POSITIVE_COLOR = '#10B981'

function formatVolume(kg: number): string {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}M kg`
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)}t`
  return `${Math.round(kg)} kg`
}

function formatRecordDate(date: Date, language: string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type Translations = ReturnType<typeof useLanguage>['t']

function getRecordLabel(type: VolumeRecord['type'], t: Translations): string {
  const vr = t.volumeRecords
  switch (type) {
    case 'session': return vr.session
    case 'week': return vr.week
    case 'month': return vr.month
  }
}

function getRecordIcon(type: VolumeRecord['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'session': return 'barbell-outline'
    case 'week': return 'calendar-outline'
    case 'month': return 'calendar-number-outline'
  }
}

const TREND_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  up: { icon: 'trending-up', color: POSITIVE_COLOR },
  down: { icon: 'trending-down', color: '#EF4444' },
  stable: { icon: 'remove-outline', color: '#6B7280' },
}

// ─── RecordCard ─────────────────────────────────────────────────────────────

function RecordCard({
  record,
  colors,
  styles,
  t,
  language,
}: {
  record: VolumeRecord
  colors: ThemeColors
  styles: ReturnType<typeof useStyles>
  t: Translations
  language: string
}) {
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTypeRow}>
          <Ionicons name={getRecordIcon(record.type)} size={20} color={colors.primary} />
          <Text style={styles.recordType}>{getRecordLabel(record.type, t)}</Text>
        </View>
        {record.isNewRecord && (
          <View style={styles.newRecordBadge}>
            <Ionicons name="flash" size={12} color="#FFF" />
            <Text style={styles.newRecordText}>{t.volumeRecords.newRecord}</Text>
          </View>
        )}
      </View>
      <Text style={styles.recordVolume}>
        {formatVolume(record.recordVolume)}
      </Text>
      <Text style={styles.recordDate}>
        {formatRecordDate(record.recordDate, language)}
      </Text>
      <View style={styles.recordBarTrack}>
        <View style={[styles.recordBarFill, {
          width: `${Math.min(record.percentOfRecord, 100)}%`,
          backgroundColor: record.percentOfRecord >= 100 ? POSITIVE_COLOR : colors.primary,
        }]} />
      </View>
      <Text style={styles.recordCurrent}>
        {t.volumeRecords.current}: {formatVolume(record.currentVolume)} ({record.percentOfRecord}%)
      </Text>
    </View>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  histories: History[]
  sets: WorkoutSet[]
}

function StatsVolumeRecordsContent({ histories, sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()
  const vr = t.volumeRecords

  const result: VolumeRecordsResult = useMemo(
    () => computeVolumeRecords(histories, sets),
    [histories, sets],
  )

  const hasData = result.totalLifetimeVolume > 0

  if (!hasData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{vr.noData}</Text>
      </View>
    )
  }

  const trendInfo = TREND_ICONS[result.recentTrend]
  const trendTexts = vr.trend

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Lifetime Header ── */}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>{vr.lifetime}</Text>
        <Text style={styles.headerValue}>{formatVolume(result.totalLifetimeVolume)}</Text>
        <View style={styles.headerRow}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>{vr.avgSession}</Text>
            <Text style={styles.headerStatValue}>{formatVolume(result.avgSessionVolume)}</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>{vr.avgWeek}</Text>
            <Text style={styles.headerStatValue}>{formatVolume(result.avgWeeklyVolume)}</Text>
          </View>
        </View>
      </View>

      {/* ── Trend ── */}
      <View style={styles.trendCard}>
        <Ionicons name={trendInfo.icon} size={28} color={trendInfo.color} />
        <Text style={[styles.trendText, { color: trendInfo.color }]}>
          {trendTexts[result.recentTrend]}
        </Text>
      </View>

      {/* ── Record Cards ── */}
      {result.records.map(record => (
        <RecordCard
          key={record.type}
          record={record}
          colors={colors}
          styles={styles}
          t={t}
          language={language}
        />
      ))}
    </ScrollView>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
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
    // Header
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    headerLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    headerValue: {
      fontSize: fontSize.xxxl,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.xs,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      width: '100%',
    },
    headerStat: {
      flex: 1,
      alignItems: 'center',
    },
    headerStatLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    headerStatValue: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    headerDivider: {
      width: 1,
      height: spacing.xl,
      backgroundColor: colors.separator,
    },
    // Trend
    trendCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    trendText: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    // Record Card
    recordCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    recordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    recordTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    recordType: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
    },
    newRecordBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: POSITIVE_COLOR,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      gap: 4,
    },
    newRecordText: {
      fontSize: fontSize.caption,
      fontWeight: '700',
      color: '#FFF',
    },
    recordVolume: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
    },
    recordDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: spacing.sm,
    },
    recordBarTrack: {
      height: 8,
      backgroundColor: colors.cardSecondary,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    recordBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    recordCurrent: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
  }), [colors])
}

// ─── withObservables ────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
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

const ObservableContent = enhance(StatsVolumeRecordsContent)

const StatsVolumeRecordsScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default StatsVolumeRecordsScreen
