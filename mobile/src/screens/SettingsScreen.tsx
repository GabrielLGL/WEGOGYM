import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, TextInput, SafeAreaView, ScrollView, Switch, TouchableOpacity, UIManager, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { LinearGradient } from 'expo-linear-gradient'
import { database } from '../model/index'
import User from '../model/models/User'
import { useHaptics } from '../hooks/useHaptics'
import { useTheme, useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Language } from '../i18n'
import { OnboardingCard } from '../components/OnboardingCard'
import { spacing } from '../theme'
import {
  USER_LEVELS,
  USER_GOALS,
  type UserLevel,
  type UserGoal,
} from '../model/constants'
import {
  SettingsTimerSection,
  SettingsNotificationsSection,
  SettingsAISection,
  SettingsDataSection,
  SettingsAboutSection,
  createSettingsStyles,
} from '../components/settings'

interface Props {
  user: User | null
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const SettingsContent: React.FC<Props> = ({ user }) => {
  const haptics = useHaptics()
  const { colors, isDark, toggleTheme, neuShadow } = useTheme()
  const { t, language, setLanguage } = useLanguage()
  const nameRef = useRef(user?.name ?? '')

  // Timer state (lifted for sync with user object)
  const [timerEnabled, setTimerEnabled] = useState(user?.timerEnabled ?? true)
  const [vibrationEnabled, setVibrationEnabled] = useState(user?.vibrationEnabled ?? true)
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(user?.timerSoundEnabled ?? true)

  // Gamification state
  const [streakTarget, setStreakTarget] = useState(user?.streakTarget ?? 3)

  // Profile editing state
  const [editingLevel, setEditingLevel] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)

  // Reminders state
  const [remindersEnabled, setRemindersEnabled] = useState(user?.remindersEnabled ?? false)
  const [reminderDays, setReminderDays] = useState<number[]>(() => {
    try { return user?.reminderDays ? JSON.parse(user.reminderDays) : [1, 3, 5] } catch { return [1, 3, 5] }
  })
  const [reminderHour, setReminderHour] = useState(user?.reminderHour ?? 18)
  const [reminderMinute, setReminderMinute] = useState(user?.reminderMinute ?? 0)

  const styles = useMemo(() => createSettingsStyles(colors, neuShadow), [colors, neuShadow])

  // Sync state when user object changes
  useEffect(() => {
    if (!user) return
    setTimerEnabled(user.timerEnabled ?? true)
    setVibrationEnabled(user.vibrationEnabled ?? true)
    setTimerSoundEnabled(user.timerSoundEnabled ?? true)
    setStreakTarget(user.streakTarget ?? 3)
    setRemindersEnabled(user.remindersEnabled ?? false)
    try {
      setReminderDays(user.reminderDays ? JSON.parse(user.reminderDays) : [1, 3, 5])
    } catch { setReminderDays([1, 3, 5]) }
    setReminderHour(user.reminderHour ?? 18)
    setReminderMinute(user.reminderMinute ?? 0)
  }, [user])

  const handleSaveName = useCallback(async () => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => {
          u.name = nameRef.current.trim() || null
        })
      })
      haptics.onSuccess()
    } catch (error) {
      if (__DEV__) console.error('Failed to update name:', error)
    }
  }, [user, haptics])

  const handleUpdateLevel = async (level: UserLevel) => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => { u.userLevel = level })
      })
      haptics.onSuccess()
      setEditingLevel(false)
    } catch (error) {
      if (__DEV__) console.error('Failed to update level:', error)
    }
  }

  const handleUpdateGoal = async (goal: UserGoal) => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => { u.userGoal = goal })
      })
      haptics.onSuccess()
      setEditingGoal(false)
    } catch (error) {
      if (__DEV__) console.error('Failed to update goal:', error)
    }
  }

  return (
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Section Mon profil */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.profile.title}</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.settings.profile.name}</Text>
              <Text style={styles.settingDescription}>{t.settings.profile.nameDescription}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.nameInput]}
              defaultValue={user?.name ?? ''}
              onChangeText={val => { nameRef.current = val }}
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
              placeholder={t.settings.profile.namePlaceholder}
              placeholderTextColor={colors.placeholder}
              maxLength={30}
            />
          </View>

          {/* Niveau */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setEditingLevel(!editingLevel)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.settings.profile.level}</Text>
              <Text style={styles.settingDescription}>{t.settings.profile.levelDescription}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={styles.infoValue}>
                {user?.userLevel ? t.onboarding.levels[user.userLevel as UserLevel] : t.settings.profile.notDefined}
              </Text>
              <Ionicons
                name={editingLevel ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>
          {editingLevel && (
            <View style={styles.profileCards}>
              {USER_LEVELS.map(level => (
                <OnboardingCard
                  key={level}
                  label={t.onboarding.levels[level]}
                  description={t.onboarding.levelDescriptions[level]}
                  selected={user?.userLevel === level}
                  onPress={() => handleUpdateLevel(level)}
                />
              ))}
            </View>
          )}

          {/* Objectif */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setEditingGoal(!editingGoal)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.settings.profile.goal}</Text>
              <Text style={styles.settingDescription}>{t.settings.profile.goalDescription}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={styles.infoValue}>
                {user?.userGoal ? t.onboarding.goals[user.userGoal as UserGoal] : t.settings.profile.notDefined}
              </Text>
              <Ionicons
                name={editingGoal ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>
          {editingGoal && (
            <View style={styles.profileCards}>
              {USER_GOALS.map(goal => (
                <OnboardingCard
                  key={goal}
                  label={t.onboarding.goals[goal]}
                  description={t.onboarding.goalDescriptions[goal]}
                  selected={user?.userGoal === goal}
                  onPress={() => handleUpdateGoal(goal)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Section Apparence */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.appearance.title}</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                {isDark ? t.settings.appearance.darkMode : t.settings.appearance.lightMode}
              </Text>
              <Text style={styles.settingDescription}>
                {isDark ? t.settings.appearance.darkDescription : t.settings.appearance.lightDescription}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={async () => {
                haptics.onPress()
                await toggleTheme()
              }}
              trackColor={{ false: colors.cardSecondary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          {/* Langue */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.settings.appearance.language}</Text>
              <Text style={styles.settingDescription}>{t.settings.appearance.languageDescription}</Text>
            </View>
          </View>
          <View style={styles.languageRow}>
            {(['fr', 'en'] as Language[]).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[styles.languageBtn, language === lang && styles.languageBtnActive]}
                onPress={async () => {
                  haptics.onSelect()
                  await setLanguage(lang)
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.languageBtnText, language === lang && styles.languageBtnTextActive]}>
                  {lang === 'fr' ? t.onboarding.language.fr : t.onboarding.language.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer */}
        <SettingsTimerSection
          user={user}
          styles={styles}
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          vibrationEnabled={vibrationEnabled}
          setVibrationEnabled={setVibrationEnabled}
          timerSoundEnabled={timerSoundEnabled}
          setTimerSoundEnabled={setTimerSoundEnabled}
        />

        {/* Notifications + Gamification */}
        <SettingsNotificationsSection
          user={user}
          styles={styles}
          remindersEnabled={remindersEnabled}
          setRemindersEnabled={setRemindersEnabled}
          reminderDays={reminderDays}
          setReminderDays={setReminderDays}
          reminderHour={reminderHour}
          setReminderHour={setReminderHour}
          reminderMinute={reminderMinute}
          setReminderMinute={setReminderMinute}
          streakTarget={streakTarget}
          setStreakTarget={setStreakTarget}
        />

        {/* AI */}
        <SettingsAISection styles={styles} />

        {/* Data */}
        <SettingsDataSection user={user} styles={styles} />

        {/* About + Help */}
        <SettingsAboutSection styles={styles} />
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  )
}

export { SettingsContent }

const ObservableContent = withObservables([], () => ({
  user: database.get<User>('users').query().observe().pipe(
    map((list: User[]) => list[0] || null)
  ),
}))(SettingsContent)

const SettingsScreen = () => {
  const colors = useColors()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default SettingsScreen
