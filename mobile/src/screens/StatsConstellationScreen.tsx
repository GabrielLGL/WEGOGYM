import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Svg, Circle } from 'react-native-svg'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import { EPLEY_FORMULA_DIVISOR } from '../model/constants'
import WorkoutSet from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useDeferredMount } from '../hooks/useDeferredMount'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConstellationStar {
  x: number
  y: number
  size: number
  orm: number
  exerciseName: string
  date: Date
  opacity: number
}

// ─── Constantes SVG ───────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width
const SVG_WIDTH = SCREEN_WIDTH - spacing.md * 2
const SVG_HEIGHT = 300
const MAX_STARS = 200
const TOP_COUNT = 5

// ─── Formatage de date ────────────────────────────────────────────────────────

function formatDate(date: Date, language: string): string {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  if (language === 'fr') return `${day}/${month < 10 ? '0' + month : month}/${year}`
  return `${month < 10 ? '0' + month : month}/${day}/${year}`
}

// ─── Composant Base ───────────────────────────────────────────────────────────

interface Props {
  sets: WorkoutSet[]
  exercises: Exercise[]
}

export function StatsConstellationScreenBase({ sets, exercises }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t, language } = useLanguage()

  // Map exerciseId → name pour lookup rapide
  const exerciseMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const ex of exercises) {
      map.set(ex.id, ex.name)
    }
    return map
  }, [exercises])

  // Étoiles de fond déterministes (50 points fixes)
  const backgroundStars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: (i * 137.5) % SVG_WIDTH,
      y: (i * 97.3) % SVG_HEIGHT,
    })), [])

  // Calcul des étoiles PRs
  const stars = useMemo((): ConstellationStar[] => {
    const prSets = sets.filter(s => s.isPr)
    if (prSets.length === 0) return []

    // Trier par date et garder les MAX_STARS plus récents
    const sorted = [...prSets].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )
    const limited = sorted.length > MAX_STARS ? sorted.slice(sorted.length - MAX_STARS) : sorted

    const orms = limited.map(s => Math.round(s.weight * (1 + s.reps / EPLEY_FORMULA_DIVISOR)))
    const dates = limited.map(s => s.createdAt.getTime())

    const minOrm = Math.min(...orms)
    const maxOrm = Math.max(...orms)
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)

    const ormRange = maxOrm - minOrm || 1
    const dateRange = maxDate - minDate || 1

    return limited.map((s, i) => {
      const orm = orms[i]
      const dateMs = dates[i]
      const xNorm = (dateMs - minDate) / dateRange
      const yNorm = 1 - (orm - minOrm) / ormRange  // inversé : haut = meilleur
      const size = 2 + ((orm - minOrm) / ormRange) * 6
      const opacity = 0.4 + ((dateMs - minDate) / dateRange) * 0.6

      return {
        x: Math.min(Math.max(xNorm, 0), 1),
        y: Math.min(Math.max(yNorm, 0), 1),
        size,
        orm,
        exerciseName: exerciseMap.get(s.exerciseId) ?? '—',
        date: s.createdAt,
        opacity,
      }
    })
  }, [sets, exerciseMap])

  // Top 5 par 1RM décroissant
  const topStars = useMemo(() =>
    [...stars].sort((a, b) => b.orm - a.orm).slice(0, TOP_COUNT),
    [stars]
  )

  // Empty state si < 3 PRs
  if (stars.length < 3) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✦</Text>
        <Text style={styles.emptyTitle}>{t.constellation.emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{t.constellation.emptyMessage}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Card ── */}
      <View style={styles.headerCard}>
        <Text style={styles.headerIcon}>✦</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t.constellation.title}</Text>
          <Text style={styles.headerCount}>{stars.length} {t.constellation.stars}</Text>
          <Text style={styles.headerSubtitle}>{t.constellation.subtitle}</Text>
        </View>
      </View>

      {/* ── SVG Constellation ── */}
      <View style={styles.svgContainer}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT} style={styles.svg}>
          {/* Fond étoilé décoratif */}
          {backgroundStars.map((s, i) => (
            <Circle
              key={`bg-${i}`}
              cx={s.x}
              cy={s.y}
              r={0.8}
              fill={colors.textSecondary}
              opacity={0.3}
            />
          ))}
          {/* Étoiles PRs */}
          {stars.map((star, i) => (
            <Circle
              key={`star-${i}`}
              cx={star.x * SVG_WIDTH}
              cy={star.y * SVG_HEIGHT}
              r={star.size}
              fill={colors.primary}
              opacity={star.opacity}
            />
          ))}
        </Svg>
      </View>

      {/* ── Top 5 ── */}
      <View style={styles.topSection}>
        <Text style={styles.topTitle}>{t.constellation.brightest}</Text>
        {topStars.map((star, i) => (
          <View key={i} style={styles.topRow}>
            <Text style={styles.topIcon}>✦</Text>
            <Text style={styles.topName} numberOfLines={1}>{star.exerciseName}</Text>
            <Text style={styles.topOrm}>{star.orm} kg 1RM</Text>
            <Text style={styles.topDate}>{formatDate(star.date, language)}</Text>
          </View>
        ))}
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
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      fontSize: fontSize.jumbo,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptyMessage: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    headerIcon: {
      fontSize: fontSize.xxxl,
      color: colors.primary,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    headerCount: {
      fontSize: fontSize.sm,
      color: colors.primary,
      marginTop: 2,
    },
    headerSubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    svgContainer: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    svg: {
      borderRadius: borderRadius.md,
    },
    topSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    topTitle: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    topIcon: {
      fontSize: fontSize.xs,
      color: colors.primary,
    },
    topName: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.text,
    },
    topOrm: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    topDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      minWidth: 52,
      textAlign: 'right',
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    ))
  ).observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
}))

const ObservableConstellationContent = enhance(StatsConstellationScreenBase)

// ─── Écran racine ─────────────────────────────────────────────────────────────

const StatsConstellationScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableConstellationContent />}
    </View>
  )
}

export default StatsConstellationScreen
