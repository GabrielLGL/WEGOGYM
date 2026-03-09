import React, { useMemo, useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import User from '../model/models/User'
import { computeGlobalKPIs, computeMotivationalPhrase, formatVolume } from '../model/utils/statsHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import type { RootStackParamList } from '../navigation'

// ─── Navigation ───────────────────────────────────────────────────────────────

type StatsNavigation = NativeStackNavigationProp<RootStackParamList, 'Stats'>

// ─── Boutons de la grille ─────────────────────────────────────────────────────

type StatRoute = keyof RootStackParamList

interface StatButton {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  route: StatRoute
}


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
}

export function StatsScreenBase({ users, histories, sets }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<StatsNavigation>()
  const haptics = useHaptics()
  const { t, language } = useLanguage()

  const STAT_BUTTONS: StatButton[] = useMemo(() => [
    { icon: 'time-outline',        label: t.stats.duration,  route: 'StatsDuration' },
    { icon: 'barbell-outline',     label: t.stats.volume,    route: 'StatsVolume' },
    { icon: 'calendar-outline',    label: t.stats.calendar,  route: 'StatsCalendar' },
    { icon: 'stats-chart-outline', label: t.stats.exercises, route: 'StatsExercises' },
    { icon: 'resize-outline',      label: t.stats.measures,  route: 'StatsMeasurements' },
    { icon: 'list-outline',        label: t.stats.history,   route: 'StatsHistory' },
  ], [t])

  const user = users[0] ?? null
  const kpis = useMemo(() => computeGlobalKPIs(histories, sets), [histories, sets])
  const motivationalPhrase = useMemo(() => computeMotivationalPhrase(histories, sets, language), [histories, sets, language])

  const handleNavigate = (route: StatRoute) => {
    haptics.onPress()
    navigation.navigate(route as never)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Card ── */}
      <View style={styles.headerCard}>
        <Text style={styles.userName}>{user?.name || t.stats.defaultName}</Text>
        <Text style={styles.motivation}>{motivationalPhrase}</Text>
        <View style={styles.separator} />
        <View style={styles.kpisRow}>
          <KpiItem label={t.stats.sessions} value={String(kpis.totalSessions)} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label={t.stats.volume} value={formatVolume(kpis.totalVolumeKg, language === 'fr' ? 'fr-FR' : 'en-US')} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label={t.stats.records} value={String(kpis.totalPRs)} colors={colors} />
        </View>
      </View>

      {/* ── Grille de boutons ── */}
      <View style={styles.grid}>
        {STAT_BUTTONS.map(btn => (
          <TouchableOpacity
            key={btn.route}
            style={styles.gridBtn}
            onPress={() => handleNavigate(btn.route)}
            activeOpacity={0.7}
          >
            <Ionicons name={btn.icon} size={28} color={colors.primary} />
            <Text style={styles.btnLabel}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
      paddingBottom: spacing.xl + 60, // espace tab bar
    },
    // Header Card
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    userName: {
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

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  users: database.get<User>('users').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
  sets: database.get<WorkoutSet>('sets').query().observe(),
}))

const ObservableStatsContent = enhance(StatsScreenBase)

const StatsScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableStatsContent />}
    </View>
  )
}

export default StatsScreen
