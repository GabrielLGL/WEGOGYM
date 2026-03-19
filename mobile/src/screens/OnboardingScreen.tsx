import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ToastAndroid, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'

import { database } from '../model'
import User from '../model/models/User'
import { OnboardingCard } from '../components/OnboardingCard'
import { Button } from '../components/Button'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { Language } from '../i18n'
import {
  USER_LEVELS,
  USER_GOALS,
  CGU_VERSION,
  type UserLevel,
  type UserGoal,
} from '../model/constants'
import type { RootStackParamList } from '../navigation'

type OnboardingNavigation = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>

export default function OnboardingScreen() {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<OnboardingNavigation>()
  const route = useRoute<NativeStackScreenProps<RootStackParamList, 'Onboarding'>['route']>()
  const haptics = useHaptics()
  const { t, language, setLanguage } = useLanguage()
  const insets = useSafeAreaInsets()

  const disclaimerOnly = route.params?.disclaimerOnly ?? false

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [selectedLevel, setSelectedLevel] = useState<UserLevel | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const totalSteps = disclaimerOnly ? 1 : 4

  const handleAcceptDisclaimer = async () => {
    haptics.onPress()
    setIsSaving(true)
    try {
      const users = await database.get<User>('users').query().fetch()
      const user = users[0]
      if (user) {
        await database.write(async () => {
          await user.update(u => {
            u.disclaimerAccepted = true
            u.cguVersionAccepted = CGU_VERSION
          })
        })
      }

      if (disclaimerOnly) {
        haptics.onSuccess()
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
      } else {
        setIsSaving(false)
        setStep(1)
      }
    } catch (error) {
      if (__DEV__) console.error('Disclaimer save failed:', error)
      if (Platform.OS === 'android') {
        ToastAndroid.show(t.onboarding.saveError, ToastAndroid.SHORT)
      }
      setIsSaving(false)
    }
  }

  const handleSelectLanguage = async (lang: Language) => {
    haptics.onSelect()
    try {
      await setLanguage(lang)
    } catch (e) {
      if (__DEV__) console.error('[Onboarding] setLanguage failed:', e)
    }
  }

  const handleNextFromLanguage = () => {
    haptics.onPress()
    setStep(2)
  }

  const handleBackToDisclaimer = () => {
    haptics.onSelect()
    setStep(0)
  }

  const handleNextFromLevel = () => {
    haptics.onPress()
    setStep(3)
  }

  const handleBackToLanguage = () => {
    haptics.onSelect()
    setStep(1)
  }

  const handleBackToLevel = () => {
    haptics.onSelect()
    setStep(2)
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
        ToastAndroid.show(t.onboarding.confirmHint, ToastAndroid.LONG)
      }

      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch (error) {
      if (__DEV__) console.error('Onboarding save failed:', error)
      if (Platform.OS === 'android') {
        ToastAndroid.show(t.onboarding.saveError, ToastAndroid.SHORT)
      }
      setIsSaving(false)
    }
  }

  const handleOpenCGU = () => {
    haptics.onSelect()
    navigation.navigate('Legal')
  }

  const renderDots = () => (
    <View style={styles.dotsRow}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
        {renderDots()}

        {step === 0 ? (
          <>
            <Text style={styles.title}>{t.disclaimer.title}</Text>

            <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.disclaimerBody}>{t.disclaimer.body}</Text>

              <TouchableOpacity onPress={handleOpenCGU} style={styles.cguLinkContainer}>
                <Text style={[styles.cguLink, { color: colors.primary }]}>
                  {t.disclaimer.cguLink}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleAcceptDisclaimer}
                disabled={isSaving}
              >
                {t.disclaimer.acceptButton}
              </Button>
            </View>
          </>
        ) : step === 1 ? (
          <>
            <Text style={styles.title}>{t.onboarding.language.title}</Text>
            <Text style={styles.subtitle}>{t.onboarding.language.subtitle}</Text>

            <View style={styles.cardsContainer}>
              <OnboardingCard
                label={t.onboarding.language.fr}
                description={t.onboarding.language.frDesc}
                selected={language === 'fr'}
                onPress={() => handleSelectLanguage('fr')}
              />
              <OnboardingCard
                label={t.onboarding.language.en}
                description={t.onboarding.language.enDesc}
                selected={language === 'en'}
                onPress={() => handleSelectLanguage('en')}
              />
            </View>

            <View style={styles.footerRow}>
              <Button
                variant="secondary"
                size="lg"
                onPress={handleBackToDisclaimer}
                style={styles.backButton}
              >
                {t.common.back}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={handleNextFromLanguage}
                style={styles.confirmButton}
              >
                {t.common.next}
              </Button>
            </View>
          </>
        ) : step === 2 ? (
          <>
            <Text style={styles.title}>{t.onboarding.level.title}</Text>
            <Text style={styles.subtitle}>{t.onboarding.level.subtitle}</Text>

            <View style={styles.cardsContainer}>
              {USER_LEVELS.map(level => (
                <OnboardingCard
                  key={level}
                  label={t.onboarding.levels[level]}
                  description={t.onboarding.levelDescriptions[level]}
                  selected={selectedLevel === level}
                  onPress={() => setSelectedLevel(level)}
                />
              ))}
            </View>

            <View style={styles.footerRow}>
              <Button
                variant="secondary"
                size="lg"
                onPress={handleBackToLanguage}
                style={styles.backButton}
              >
                {t.common.back}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={handleNextFromLevel}
                disabled={selectedLevel === null}
                style={styles.confirmButton}
              >
                {t.common.next}
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t.onboarding.goal.title}</Text>
            <Text style={styles.subtitle}>{t.onboarding.goal.subtitle}</Text>

            <View style={styles.cardsContainer}>
              {USER_GOALS.map(goal => (
                <OnboardingCard
                  key={goal}
                  label={t.onboarding.goals[goal]}
                  description={t.onboarding.goalDescriptions[goal]}
                  selected={selectedGoal === goal}
                  onPress={() => setSelectedGoal(goal)}
                />
              ))}
            </View>

            <View style={styles.footerRow}>
              <Button
                variant="secondary"
                size="lg"
                onPress={handleBackToLevel}
                style={styles.backButton}
              >
                {t.common.back}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={handleConfirm}
                disabled={selectedGoal === null || isSaving}
                style={styles.confirmButton}
              >
                {t.common.confirm}
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
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
      borderRadius: borderRadius.sm,
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
    disclaimerBody: {
      color: colors.textSecondary,
      fontSize: fontSize.bodyMd,
      lineHeight: 24,
      marginTop: spacing.md,
    },
    cguLinkContainer: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    cguLink: {
      fontSize: fontSize.md,
      fontWeight: '600',
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
  }), [colors])
}
