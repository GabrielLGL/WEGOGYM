import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import User from '../../model/models/User'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import { computeMotivationalPhrase } from '../../model/utils/statsHelpers'
import { formatTonnage } from '../../model/utils/gamificationHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

const DEFAULT_STATUS_BAR_HEIGHT = 44

interface HomeHeaderCardProps {
  user: User | null
  historiesCount: number
  histories: History[]
  sets: WorkoutSet[]
  headerCardRef: React.RefObject<View>
  settingsBtnRef: React.RefObject<View>
}

function KpiItem({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  const styles = useKpiStyles(colors)
  return (
    <View style={styles.kpiItem}>
      <Text style={styles.kpiValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  )
}

export function HomeHeaderCard({ user, historiesCount, histories, sets, headerCardRef, settingsBtnRef }: HomeHeaderCardProps) {
  const colors = useColors()
  const { t, language } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  const motivationalPhrase = useMemo(
    () => computeMotivationalPhrase(histories, sets, language),
    [histories, sets, language],
  )

  return (
    <View ref={headerCardRef} style={styles.headerCard}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.greeting}>
            {t.home.greeting.replace('{name}', user?.name || t.stats.defaultName)}
          </Text>
          <Text style={styles.motivation}>{motivationalPhrase}</Text>
        </View>
        <TouchableOpacity
          ref={settingsBtnRef}
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
        <KpiItem label={t.home.tiles.sessions} value={String(historiesCount)} colors={colors} />
        <View style={styles.kpiSeparator} />
        <KpiItem label={t.home.tiles.tonnage} value={formatTonnage(user?.totalTonnage ?? 0)} colors={colors} />
        <View style={styles.kpiSeparator} />
        <KpiItem label={t.home.tiles.records} value={String(user?.totalPrs ?? 0)} colors={colors} />
      </View>
    </View>
  )
}

function useKpiStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
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
  }), [colors])
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
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
    kpiSeparator: {
      width: 1,
      height: spacing.xl,
      backgroundColor: colors.separator,
    },
  }), [colors])
}
