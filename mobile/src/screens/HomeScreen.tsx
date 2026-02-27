import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Session from '../model/models/Session'
import User from '../model/models/User'
import UserBadge from '../model/models/UserBadge'
import { BADGES_LIST } from '../model/utils/badgeConstants'
import { computeGlobalKPIs, computeMotivationalPhrase, formatVolume, buildWeeklyActivity } from '../model/utils/statsHelpers'
import { xpToNextLevel, formatTonnage } from '../model/utils/gamificationHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { LevelBadge } from '../components/LevelBadge'
import { XPProgressBar } from '../components/XPProgressBar'
import { StreakIndicator } from '../components/StreakIndicator'
import type { RootStackParamList } from '../navigation'

// ─── Navigation ───────────────────────────────────────────────────────────────

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>

// ─── Sections & Tuiles ───────────────────────────────────────────────────────

interface Tile {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  route: string
}

interface Section {
  title: string
  tiles: Tile[]
}

const SECTIONS: Section[] = [
  {
    title: 'Entraînement',
    tiles: [
      { icon: 'library-outline', label: 'Programmes', route: 'Programs' },
      { icon: 'barbell-outline', label: 'Exercices', route: 'Exercices' },
    ],
  },
  {
    title: 'Statistiques',
    tiles: [
      { icon: 'time-outline',          label: 'Durée',               route: 'StatsDuration' },
      { icon: 'barbell-outline',       label: 'Volume',              route: 'StatsVolume' },
      { icon: 'calendar-outline',      label: 'Agenda',              route: 'StatsCalendar' },
      { icon: 'trophy-outline',        label: 'Exercices & Records', route: 'StatsExercises' },
      { icon: 'resize-outline',        label: 'Mesures',             route: 'StatsMeasurements' },
      { icon: 'list-outline',          label: 'Historique',          route: 'StatsHistory' },
    ],
  },
]

/** All navigable routes from the dashboard */

// ─── KPI Item ─────────────────────────────────────────────────────────────────

function KpiItem({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  const styles = useStyles(colors)
  return (
    <View style={styles.kpiItem}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  users: User[]
  histories: History[]
  sets: WorkoutSet[]
  sessions: Session[]
  userBadges: UserBadge[]
}

function HomeScreenBase({ users, histories, sets, sessions, userBadges }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<HomeNavigation>()
  const haptics = useHaptics()

  const user = users[0] ?? null
  const kpis = useMemo(() => computeGlobalKPIs(histories, sets), [histories, sets])
  const xpProgress = useMemo(
    () => xpToNextLevel(user?.totalXp ?? 0, user?.level ?? 1),
    [user?.totalXp, user?.level],
  )
  const motivationalPhrase = useMemo(
    () => computeMotivationalPhrase(histories, sets),
    [histories, sets],
  )
  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(histories, sets, sessions),
    [histories, sets, sessions],
  )

  const handleTilePress = (tile: Tile) => {
    haptics.onPress()
    try {
      navigation.navigate(tile.route as keyof RootStackParamList as never)
    } catch {
      if (__DEV__) console.warn(`[HomeScreen] Route "${tile.route}" non disponible`)
    }
  }

  return (
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ flex: 1 }}
    >
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Card ── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting}>
              Salut, {user?.name || 'Toi'} !
            </Text>
            <Text style={styles.motivation}>{motivationalPhrase}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.6}
            onPress={() => {
              haptics.onPress()
              navigation.navigate('Settings')
            }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={styles.kpisRow}>
          <KpiItem label="Séances" value={String(kpis.totalSessions)} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Volume" value={formatVolume(kpis.totalVolumeKg)} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Tonnage" value={formatTonnage(user?.totalTonnage ?? 0)} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Records" value={String(kpis.totalPRs)} colors={colors} />
        </View>
      </View>

      {/* ── Card Gamification ── */}
      <View style={styles.gamificationCard}>
        <LevelBadge level={user?.level ?? 1} />
        <XPProgressBar
          currentXP={xpProgress.current}
          requiredXP={xpProgress.required}
          percentage={xpProgress.percentage}
        />
        <StreakIndicator
          currentStreak={user?.currentStreak ?? 0}
          streakTarget={user?.streakTarget ?? 3}
        />
        <View style={styles.badgesSeparator} />
        <TouchableOpacity
          style={styles.badgesRow}
          activeOpacity={0.7}
          onPress={() => {
            haptics.onPress()
            navigation.navigate('Badges')
          }}
        >
          <View style={styles.badgesLabelRow}>
            <Ionicons name="medal-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.badgesLabel}>Mes Badges</Text>
          </View>
          <Text style={styles.badgesCount}>
            {userBadges.length}/{BADGES_LIST.length} {'\u203A'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Card Activité Semaine ── */}
      <View style={styles.weeklyCard}>
        <View style={styles.weeklyHeader}>
          <Text style={styles.sectionTitle}>Cette semaine</Text>
          <Text style={styles.weeklySubtitle}>
            {(() => {
              const totalSessions = weeklyActivity.reduce((acc, d) => acc + d.sessions.length, 0)
              if (totalSessions === 0) return 'Aucune séance'
              const totalVolume = weeklyActivity.reduce(
                (acc, d) => acc + d.sessions.reduce((a, s) => a + s.volumeKg, 0), 0
              )
              return `${totalSessions} séance${totalSessions > 1 ? 's' : ''} · ${Math.round(totalVolume)} kg`
            })()}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {weeklyActivity.map((day) => (
            <View
              key={day.dateKey}
              style={[
                styles.dayChip,
                day.isToday && styles.dayChipToday,
                !day.isToday && day.isPast && day.sessions.length === 0 && styles.dayChipRestPast,
              ]}
            >
              <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                {day.dayLabel}
              </Text>
              <Text style={[styles.dayNumber, day.isToday && styles.dayNumberToday]}>
                {day.dayNumber}
              </Text>
              {day.sessions.length > 0 ? (
                day.sessions.map((s, idx) => (
                  <View key={idx} style={styles.sessionTag}>
                    <Text style={styles.sessionName} numberOfLines={1}>{s.sessionName}</Text>
                    <Text style={styles.sessionMeta}>
                      {s.setCount} sér{s.durationMin !== null ? ` · ${s.durationMin}m` : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>{day.isPast ? 'Repos' : '—'}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ── Sections de tuiles ── */}
      {SECTIONS.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.grid}>
            {section.tiles.map(tile => (
              <TouchableOpacity
                key={tile.route}
                style={styles.gridBtn}
                onPress={() => handleTilePress(tile)}
                activeOpacity={0.7}
              >
                <Ionicons name={tile.icon} size={28} color={colors.primary} />
                <Text style={styles.btnLabel}>{tile.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
    </LinearGradient>
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
      paddingTop: (StatusBar.currentHeight ?? 44) + spacing.sm,
      paddingBottom: spacing.xl,
    },
    // Header Card
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerTextBlock: {
      flex: 1,
      marginRight: spacing.sm,
    },
    settingsBtn: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardSecondary,
    },
    greeting: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
    },
    motivation: {
      fontSize: fontSize.sm,
      fontStyle: 'italic',
      color: colors.primary,
      marginTop: spacing.xs,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },
    kpisRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    kpiItem: {
      flex: 1,
      alignItems: 'center',
    },
    kpiValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    kpiLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    kpiSeparator: {
      width: 1,
      height: spacing.xl,
      backgroundColor: colors.separator,
    },
    // Gamification Card
    gamificationCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    badgesSeparator: {
      height: 1,
      backgroundColor: colors.separator,
    },
    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badgesLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    badgesLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    badgesCount: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.primary,
    },
    // Weekly Activity Card
    weeklyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    weeklyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    weeklySubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
    },
    dayChip: {
      flex: 1,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.xs,
      alignItems: 'center',
      minHeight: 84,
    },
    dayChipToday: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    dayChipRestPast: {
      opacity: 0.45,
    },
    dayLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.placeholder,
      letterSpacing: 0.3,
    },
    dayLabelToday: {
      color: colors.primary,
    },
    dayNumber: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    dayNumberToday: {
      color: colors.primary,
    },
    sessionTag: {
      backgroundColor: colors.primaryBg,
      borderRadius: 4,
      paddingHorizontal: 3,
      paddingVertical: 2,
      marginTop: 2,
      width: '100%',
    },
    sessionName: {
      fontSize: 8,
      fontWeight: '700',
      color: colors.text,
    },
    sessionMeta: {
      fontSize: 7,
      color: colors.textSecondary,
      marginTop: 1,
    },
    emptyDay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyDayText: {
      fontSize: 9,
      color: colors.placeholder,
    },
    // Sections
    section: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    // Grille boutons
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gridBtn: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      width: '31%',
    },
    btnLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  })
}

// ─── Export pour les tests ────────────────────────────────────────────────────

export { HomeScreenBase as HomeContent }

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  users: database.get<User>('users').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
  sets: database.get<WorkoutSet>('sets').query().observe(),
  sessions: database.get<Session>('sessions').query().observe(),
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
}))

export default enhance(HomeScreenBase)
