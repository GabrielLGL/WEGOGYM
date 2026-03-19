import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import User from '../../model/models/User'
import UserBadge from '../../model/models/UserBadge'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import { xpToNextLevel } from '../../model/utils/gamificationHelpers'
import { BADGES_LIST } from '../../model/utils/badgeConstants'
import { computeAthleteClass } from '../../model/utils/athleteClassHelpers'
import { LevelBadge } from '../LevelBadge'
import { XPProgressBar } from '../XPProgressBar'
import { StreakIndicator } from '../StreakIndicator'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeGamificationCardProps {
  user: User | null
  userBadges: UserBadge[]
  sets: WorkoutSet[]
  exercises: Exercise[]
  gamificationCardRef: React.RefObject<View>
}

export function HomeGamificationCard({ user, userBadges, sets, exercises, gamificationCardRef }: HomeGamificationCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  const xpProgress = useMemo(
    () => xpToNextLevel(user?.totalXp ?? 0, user?.level ?? 1),
    [user?.totalXp, user?.level],
  )

  const athleteClass = useMemo(
    () => computeAthleteClass(sets, exercises),
    [sets, exercises],
  )

  return (
    <View ref={gamificationCardRef} style={styles.gamificationCard}>
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
      {athleteClass && (
        <View style={styles.athleteClassRow}>
          <Text style={styles.athleteClassLabel}>
            {t.athleteClass[athleteClass.class]}
          </Text>
        </View>
      )}
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
          <Text style={styles.badgesLabel}>{t.home.tiles.badges}</Text>
        </View>
        <Text style={styles.badgesCount}>
          {userBadges.length}/{BADGES_LIST.length} {'\u203A'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    gamificationCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    athleteClassRow: {
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    athleteClassLabel: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
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
  }), [colors])
}
