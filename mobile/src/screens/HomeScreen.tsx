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

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>

// ─── Sections & Tuiles ───────────────────────────────────────────────────────

interface Tile {
  icon: string
  label: string
  route: string
}

interface Section {
  title: string
  tiles: Tile[]
}

const SECTIONS: Section[] = [
  {
    title: 'Entra\u00eenement',
    tiles: [
      { icon: '\uD83D\uDCDA', label: 'Programmes', route: 'Programs' },
      { icon: '\uD83C\uDFCB\uFE0F', label: 'Exercices', route: 'Exercices' },
    ],
  },
  {
    title: 'Statistiques',
    tiles: [
      { icon: '\u23F1', label: 'Dur\u00e9e', route: 'StatsDuration' },
      { icon: '\uD83C\uDFD7\uFE0F', label: 'Volume', route: 'StatsVolume' },
      { icon: '\uD83D\uDCC5', label: 'Agenda', route: 'StatsCalendar' },
      { icon: '\uD83D\uDCAA', label: 'Muscles', route: 'StatsRepartition' },
      { icon: '\uD83C\uDFC6', label: 'Exercices & Records', route: 'StatsExercises' },
      { icon: '\uD83D\uDCCF', label: 'Mesures', route: 'StatsMeasurements' },
      { icon: '\uD83D\uDCCA', label: 'Historique', route: 'StatsHistory' },
    ],
  },
  {
    title: 'Outils',
    tiles: [
      { icon: '\u2728', label: 'Assistant', route: 'Assistant' },
      { icon: '\u2699\uFE0F', label: 'R\u00e9glages', route: 'Settings' },
    ],
  },
]

/** All navigable routes from the dashboard */

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

function HomeScreenBase({ users, histories, sets }: Props) {
  const navigation = useNavigation<HomeNavigation>()
  const haptics = useHaptics()

  const user = users[0] ?? null
  const kpis = useMemo(() => computeGlobalKPIs(histories, sets), [histories, sets])
  const motivationalPhrase = useMemo(
    () => computeMotivationalPhrase(histories, sets),
    [histories, sets],
  )

  const handleTilePress = (tile: Tile) => {
    haptics.onPress()
    try {
      navigation.navigate(tile.route as never)
    } catch {
      if (__DEV__) console.warn(`[HomeScreen] Route "${tile.route}" non disponible`)
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Card ── */}
      <View style={styles.headerCard}>
        <Text style={styles.greeting}>
          Salut, {user?.name || 'Toi'} !
        </Text>
        <Text style={styles.motivation}>{motivationalPhrase}</Text>
        <View style={styles.separator} />
        <View style={styles.kpisRow}>
          <KpiItem label="S\u00e9ances" value={String(kpis.totalSessions)} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Volume" value={formatVolume(kpis.totalVolumeKg)} />
          <View style={styles.kpiSeparator} />
          <KpiItem label="Records" value={String(kpis.totalPRs)} />
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
                <Text style={styles.btnIcon}>{tile.icon}</Text>
                <Text style={styles.btnLabel}>{tile.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
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
    paddingBottom: spacing.xl + 60,
  },
  // Header Card
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    height: 32,
    backgroundColor: colors.separator,
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

// ─── Export pour les tests ────────────────────────────────────────────────────

export { HomeScreenBase as HomeContent }

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  users: database.get<User>('users').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
  sets: database.get<WorkoutSet>('sets').query().observe(),
}))

export default enhance(HomeScreenBase)
