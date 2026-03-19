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
import Exercise from '../model/models/Exercise'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'
import {
  computeMonthlyBulletin,
  type MonthlyGrade,
  type GradePlus,
} from '../model/utils/monthlyBulletinHelpers'
import { formatVolume } from '../model/utils/statsHelpers'

// ─── Helpers visuels ─────────────────────────────────────────────────────────

function getGradeColor(grade: GradePlus, colors: ThemeColors): string {
  if (grade === 'A+' || grade === 'A') return colors.primary
  if (grade === 'B+' || grade === 'B') return colors.success
  if (grade === 'C+' || grade === 'C') return colors.warning
  return colors.danger
}

const CATEGORY_ICONS: Record<MonthlyGrade['category'], keyof typeof Ionicons.glyphMap> = {
  regularite: 'calendar-outline',
  force: 'flash-outline',
  volume: 'stats-chart-outline',
  equilibre: 'scale-outline',
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function MonthlyBulletinScreenBase({ histories, sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()

  const bulletin = useMemo(
    () => computeMonthlyBulletin(histories, sets, exercises, language),
    [histories, sets, exercises, language],
  )

  function formatGradeValue(grade: MonthlyGrade): string {
    switch (grade.category) {
      case 'regularite': return `${Math.round(grade.value)} ${t.bulletin.sessions}`
      case 'force': return `${Math.round(grade.value)} ${t.bulletin.prs}`
      case 'volume': return formatVolume(grade.value, language === 'fr' ? 'fr-FR' : 'en-US')
      case 'equilibre': return `${Math.round(grade.value)} ${t.bulletin.muscleGroups}`
    }
  }

  function formatAvgValue(grade: MonthlyGrade): string {
    const avg = grade.avg
    switch (grade.category) {
      case 'regularite': return `${t.bulletin.average} ${avg.toFixed(1)}`
      case 'force': return `${t.bulletin.average} ${avg.toFixed(1)}`
      case 'volume': return `${t.bulletin.average} ${formatVolume(avg, language === 'fr' ? 'fr-FR' : 'en-US')}`
      case 'equilibre': return `${t.bulletin.average} ${avg.toFixed(1)}`
    }
  }

  if (!bulletin) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="school-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>{t.bulletin.emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{t.bulletin.emptyMessage}</Text>
      </View>
    )
  }

  const overallColor = getGradeColor(bulletin.overallGrade, colors)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{bulletin.month}</Text>
        <Text style={styles.overallLabel}>{t.bulletin.overallGrade}</Text>
        <Text style={[styles.overallGrade, { color: overallColor }]}>
          {bulletin.overallGrade}
        </Text>
      </View>

      {/* ── Grille 2×2 ── */}
      <View style={styles.grid}>
        {bulletin.grades.map(grade => {
          const gradeColor = getGradeColor(grade.grade, colors)
          return (
            <View key={grade.category} style={styles.gradeCard}>
              <View style={styles.gradeCardHeader}>
                <Ionicons name={CATEGORY_ICONS[grade.category]} size={18} color={colors.primary} />
                <Text style={styles.categoryLabel}>
                  {t.bulletin.categories[grade.category]}
                </Text>
              </View>
              <Text style={[styles.gradeLetter, { color: gradeColor }]}>
                {grade.grade}
              </Text>
              <Text style={styles.gradeValue}>{formatGradeValue(grade)}</Text>
              <Text style={styles.gradeAvg}>{formatAvgValue(grade)}</Text>
            </View>
          )
        })}
      </View>

      {/* ── Commentaire ── */}
      <View style={styles.commentCard}>
        <Text style={styles.commentText}>{bulletin.comment}</Text>
      </View>
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
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl + 60,
    },
    // Header
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    overallLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    overallGrade: {
      fontSize: 64,
      fontWeight: '900',
      lineHeight: 72,
    },
    // Grille 2×2
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    gradeCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      width: '48.5%',
    },
    gradeCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    categoryLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    gradeLetter: {
      fontSize: fontSize.jumbo,
      fontWeight: '900',
      lineHeight: fontSize.jumbo + 8,
    },
    gradeValue: {
      fontSize: fontSize.sm,
      color: colors.text,
      marginTop: spacing.xs,
    },
    gradeAvg: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // Commentaire
    commentCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    commentText: {
      fontSize: fontSize.bodyMd,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
    // Empty state
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
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

const ObservableContent = enhance(MonthlyBulletinScreenBase)

const MonthlyBulletinScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default MonthlyBulletinScreen
