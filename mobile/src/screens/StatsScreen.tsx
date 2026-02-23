import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import User from '../model/models/User'
import { computeGlobalKPIs, computeMotivationalPhrase, formatVolume } from '../model/utils/statsHelpers'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import type { RootStackParamList } from '../navigation'

// ─── Navigation ───────────────────────────────────────────────────────────────

type StatsNavigation = NativeStackNavigationProp<RootStackParamList, 'Stats'>

// ─── Boutons de la grille ─────────────────────────────────────────────────────

type StatRoute = keyof RootStackParamList

interface StatButton {
  icon: string
  label: string
  route: StatRoute
}

const STAT_BUTTONS: StatButton[] = [
  { icon: '⏱', label: 'Durée', route: 'StatsDuration' },
  { icon: '🏋️', label: 'Volume', route: 'StatsVolume' },
  { icon: '🗓', label: 'Agenda', route: 'StatsCalendar' },
  { icon: '💪', label: 'Muscles', route: 'StatsRepartition' },
  { icon: '📊', label: 'Exercices', route: 'StatsExercises' },
  { icon: '📏', label: 'Mesures', route: 'StatsMeasurements' },
  { icon: '📋', label: 'Historique', route: 'StatsHistory' },
]

// ─── KPI Item ─────────────────────────────────────────────────────────────────

function KpiItem({ label, value }: { label: string; value: string }) {
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
  const navigation = useNavigation<StatsNavigation>()
  const haptics = useHaptics()

  const user = users[0] ?? null
  const kpis = useMemo(() => computeGlobalKPIs(histories, sets), [histories, sets])
  const motivationalPhrase = useMemo(() => computeMotivationalPhrase(histories, sets), [histories, sets])

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
        <Text style={styles.userName}>{user?.name || 'Toi'}</Text>
        <Text style={styles.motivation}>{motivationalPhrase}</Text>
        <View style={styles.separator} />
        <View style={styles.kpisRow}>
          <KpiItem label="Séances" value={String(kpis.totalSessions)} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Volume" value={formatVolume(kpis.totalVolumeKg)} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Records" value={String(kpis.totalPRs)} />
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
            <Text style={styles.btnIcon}>{btn.icon}</Text>
            <Text style={styles.btnLabel}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    height: 32,
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
  btnIcon: {
    fontSize: 28,
  },
  btnLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
})

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  users: database.get<User>('users').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
  sets: database.get<WorkoutSet>('sets').query().observe(),
}))

export default enhance(StatsScreenBase)
