import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import FriendSnapshot from '../../model/models/FriendSnapshot'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeNavigationGridProps {
  friends: FriendSnapshot[]
  navigationGridRef?: React.RefObject<View>
}

interface GridTile {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  route: keyof RootStackParamList
  subtitle?: string
}

function HomeNavigationGridInner({ friends, navigationGridRef }: HomeNavigationGridProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  const tiles: GridTile[] = useMemo(() => [
    { icon: 'library-outline', label: t.home.tiles.programs, route: 'Programs' },
    { icon: 'barbell-outline', label: t.home.tiles.exercises, route: 'Exercices' },
    { icon: 'barbell-outline', label: t.home.tiles.volume, route: 'StatsVolume' },
    { icon: 'time-outline', label: t.home.tiles.duration, route: 'StatsDuration' },
    { icon: 'calendar-outline', label: t.home.tiles.calendar, route: 'StatsCalendar' },
    { icon: 'resize-outline', label: t.home.tiles.measures, route: 'StatsMeasurements' },
    { icon: 'camera-outline', label: t.home.tiles.photos, route: 'ProgressPhotos' },
    { icon: 'git-network-outline', label: t.home.tiles.hexagon, route: 'StatsHexagon' },
    {
      icon: 'trophy-outline',
      label: t.leaderboard.title,
      route: 'Leaderboard',
      subtitle: friends.length > 0 ? t.leaderboard.friendCount(friends.length) : undefined,
    },
    { icon: 'shield-outline', label: t.home.tiles.challenges, route: 'PersonalChallenges' },
    { icon: 'git-branch-outline', label: t.home.tiles.skillTree, route: 'SkillTree' },
    { icon: 'newspaper-outline', label: t.home.tiles.activityFeed, route: 'ActivityFeed' },
  ], [t, friends.length])

  return (
    <View ref={navigationGridRef} style={styles.container}>
      <Text style={styles.sectionTitle}>{t.home.sections.stats} & {t.home.sections.tools}</Text>
      <View style={styles.grid}>
        {tiles.map(tile => (
          <TouchableOpacity
            key={tile.route + tile.label}
            style={styles.gridBtn}
            onPress={() => {
              haptics.onPress()
              // React Navigation overloads don't resolve union route types; all grid routes have no required params
              ;(navigation.navigate as (screen: string) => void)(tile.route)
            }}
            activeOpacity={0.7}
          >
            <Ionicons name={tile.icon} size={24} color={colors.primary} />
            <Text style={styles.btnLabel} numberOfLines={1}>{tile.label}</Text>
            {tile.subtitle && (
              <Text style={styles.btnSub}>{tile.subtitle}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export const HomeNavigationGrid = React.memo(HomeNavigationGridInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gridBtn: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    btnLabel: {
      fontSize: fontSize.xs,
      color: colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    btnSub: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
  }), [colors])
}
