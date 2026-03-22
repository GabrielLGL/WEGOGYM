import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import User from '../../model/models/User'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import { computeMotivationalPhrase } from '../../model/utils/statsHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeHeaderCardProps {
  user: User | null
  histories: History[]
  sets: WorkoutSet[]
  headerCardRef: React.RefObject<View>
  settingsBtnRef: React.RefObject<View>
  /** Pre-computed motivational phrase (avoids duplicate computation) */
  motivationalPhrase?: string
}

function HomeHeaderCardInner({ user, histories, sets, headerCardRef, settingsBtnRef, motivationalPhrase: precomputed }: HomeHeaderCardProps) {
  const colors = useColors()
  const { t, language } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  const computedPhrase = useMemo(
    () => precomputed ?? computeMotivationalPhrase(histories, sets, language),
    [precomputed, histories, sets, language],
  )
  const motivationalPhrase = computedPhrase

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
          accessibilityRole="button"
          accessibilityLabel={t.accessibility.settings}
        >
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const HomeHeaderCard = React.memo(HomeHeaderCardInner)

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
  }), [colors])
}
