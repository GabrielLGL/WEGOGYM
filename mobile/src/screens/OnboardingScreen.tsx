import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ToastAndroid, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { database } from '../model'
import User from '../model/models/User'
import { OnboardingCard } from '../components/OnboardingCard'
import { Button } from '../components/Button'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, fontSize } from '../theme'
import {
  USER_LEVELS,
  USER_GOALS,
  USER_LEVEL_LABELS,
  USER_LEVEL_DESCRIPTIONS,
  USER_GOAL_LABELS,
  USER_GOAL_DESCRIPTIONS,
  type UserLevel,
  type UserGoal,
} from '../model/constants'
import type { RootStackParamList } from '../navigation'

type OnboardingNavigation = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigation>()
  const haptics = useHaptics()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedLevel, setSelectedLevel] = useState<UserLevel | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleNext = () => {
    haptics.onPress()
    setStep(2)
  }

  const handleBack = () => {
    haptics.onSelect()
    setStep(1)
  }

  const handleConfirm = async () => {
    if (!selectedLevel || !selectedGoal || isSaving) return

    setIsSaving(true)
    try {
      const users = await database.get<User>('users').query().fetch()
      const user = users[0]
      if (user) {
        await database.write(async () => {
          await user.update(u => {
            u.userLevel = selectedLevel
            u.userGoal = selectedGoal
            u.onboardingCompleted = true
          })
        })
      }

      haptics.onSuccess()

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Pour modifier vos préférences, rendez-vous dans Paramètres',
          ToastAndroid.LONG
        )
      }

      navigation.replace('Home')
    } catch (error) {
      if (__DEV__) console.error('Onboarding save failed:', error)
      setIsSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
          <View style={[styles.dot, step === 2 && styles.dotActive]} />
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.title}>Quel est ton niveau ?</Text>
            <Text style={styles.subtitle}>
              Influence la difficulté des exercices suggérés et les poids de départ
            </Text>

            <View style={styles.cardsContainer}>
              {USER_LEVELS.map(level => (
                <OnboardingCard
                  key={level}
                  label={USER_LEVEL_LABELS[level]}
                  description={USER_LEVEL_DESCRIPTIONS[level]}
                  selected={selectedLevel === level}
                  onPress={() => setSelectedLevel(level)}
                />
              ))}
            </View>

            <View style={styles.footer}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleNext}
                disabled={selectedLevel === null}
              >
                Suivant
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Quel est ton objectif ?</Text>
            <Text style={styles.subtitle}>
              Influence les plages de répétitions et le type de programmes recommandés
            </Text>

            <View style={styles.cardsContainer}>
              {USER_GOALS.map(goal => (
                <OnboardingCard
                  key={goal}
                  label={USER_GOAL_LABELS[goal]}
                  description={USER_GOAL_DESCRIPTIONS[goal]}
                  selected={selectedGoal === goal}
                  onPress={() => setSelectedGoal(goal)}
                />
              ))}
            </View>

            <View style={styles.footerRow}>
              <Button
                variant="secondary"
                size="lg"
                onPress={handleBack}
                style={styles.backButton}
              >
                Retour
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={handleConfirm}
                disabled={selectedGoal === null || isSaving}
                style={styles.confirmButton}
              >
                Confirmer
              </Button>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: (StatusBar.currentHeight ?? 44) + spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondaryButton,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  cardsContainer: {
    flex: 1,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
})
