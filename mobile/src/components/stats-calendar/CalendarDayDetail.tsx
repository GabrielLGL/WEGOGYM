import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { DayDetail, SessionBlock } from '../../hooks/useCalendarDayDetail'
import { formatDuration } from '../../model/utils/statsHelpers'

interface CalendarDayDetailProps {
  detail: DayDetail
  expandedBlocks: Set<string>
  onToggleBlock: (historyId: string) => void
  onDeletePress: (historyId: string) => void
}

function CalendarDayDetailInner({
  detail,
  expandedBlocks,
  onToggleBlock,
  onDeletePress,
}: CalendarDayDetailProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailDate}>{detail.label}</Text>

      {detail.count === 0 ? (
        <Text style={styles.detailRest}>{t.statsCalendar.rest}</Text>
      ) : (
        detail.sessions.map((block: SessionBlock, blockIndex: number) => {
          const isExpanded = expandedBlocks.has(block.historyId)
          return (
            <React.Fragment key={block.historyId}>
              {blockIndex > 0 && <View style={styles.sessionDivider} />}

              <View style={styles.sessionBlockHeader}>
                <TouchableOpacity
                  style={[styles.detailHeader, { flex: 1 }]}
                  onPress={() => onToggleBlock(block.historyId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.detailProgramName} numberOfLines={1}>
                    {block.programName || block.sessionName || t.statsCalendar.sessionFallback}
                  </Text>
                  <View style={styles.detailHeaderRight}>
                    {block.durationMin != null && (
                      <Text style={styles.detailDuration}>
                        {formatDuration(block.durationMin)}
                      </Text>
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                      style={styles.detailChevron}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteSessionBtn}
                  onPress={() => onDeletePress(block.historyId)}
                  accessibilityLabel={t.statsCalendar.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {block.sessionName && block.sessionName !== block.programName && (
                <Text style={styles.detailSessionName}>{block.sessionName}</Text>
              )}

              {isExpanded && (
                <>
                  {block.exercises.map((ex, ei) => (
                    <View key={ei} style={styles.detailExercise}>
                      <Text style={styles.detailExerciseName}>{ex.exerciseName}</Text>
                      <View style={styles.detailSetsRow}>
                        {ex.sets.map((s, si) => (
                          <View key={si} style={[styles.detailSetChip, { flexDirection: 'row', alignItems: 'center', gap: spacing.xs }]}>
                            <Text
                              style={[styles.detailSetText, s.isPr && styles.detailSetPr]}
                            >
                              {s.weight > 0 ? `${s.weight} ${t.statsMeasurements.weightUnit}` : t.historyDetail.bodyweight} × {s.reps}
                            </Text>
                            {s.isPr && <Ionicons name="ribbon" size={12} color={colors.primary} />}
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </React.Fragment>
          )
        })
      )}
    </View>
  )
}

export const CalendarDayDetail = React.memo(CalendarDayDetailInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    detailDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'capitalize',
      marginBottom: spacing.xs,
    },
    detailRest: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    detailProgramName: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    detailHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailChevron: {
      marginLeft: spacing.xs,
    },
    detailDuration: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    detailSessionName: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    detailExercise: {
      marginTop: spacing.sm,
    },
    detailExerciseName: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    detailSetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    detailSetChip: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    detailSetText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    detailSetPr: {
      color: colors.warning,
    },
    sessionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    sessionBlockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deleteSessionBtn: {
      padding: spacing.sm,
    },
  }), [colors])
}
