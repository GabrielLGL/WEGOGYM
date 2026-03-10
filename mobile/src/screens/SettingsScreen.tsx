import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, TextInput, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { LinearGradient } from 'expo-linear-gradient'
import { database } from '../model/index'
import User from '../model/models/User'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { useHaptics } from '../hooks/useHaptics'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { useTheme, useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Language } from '../i18n'
import { OnboardingCard } from '../components/OnboardingCard'
import { LevelBadge } from '../components/LevelBadge'
import { XPProgressBar } from '../components/XPProgressBar'
import { xpToNextLevel } from '../model/utils/gamificationHelpers'
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

  const userLevel = user?.level ?? 1
  const userXP = user?.totalXp ?? 0
  const xpInfo = xpToNextLevel(userXP, userLevel)
  const displayName = user?.name || t.settings.profile.namePlaceholder
  const initials = displayName.slice(0, 2).toUpperCase()
  const levelLabel = user?.userLevel ? t.onboarding.levels[user.userLevel as UserLevel] : ''
  const goalLabel = user?.userGoal ? t.onboarding.goals[user.userGoal as UserGoal] : ''
  const subtitle = [levelLabel, goalLabel].filter(Boolean).join(' · ')

  const toggleLevel = () => {
    haptics.onSelect()
    setEditingLevel(!editingLevel)
  }

  const toggleGoal = () => {
    haptics.onSelect()
    setEditingGoal(!editingGoal)
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
        {/* Profile Header Hero */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.profileName}>{displayName}</Text>
              <LevelBadge level={userLevel} />
            </View>
            {subtitle ? <Text style={styles.profileSubtitle}>{subtitle}</Text> : null}
            <XPProgressBar currentXP={xpInfo.current} requiredXP={xpInfo.required} percentage={xpInfo.percentage} />
          </View>
        </View>

        {/* Group: PROFIL */}
        <Text style={styles.groupLabel}>{t.settings.groups.profile}</Text>

        {/* Section Mon profil */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.profile.title}</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.profile.name}</Text>
              </View>
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
            onPress={toggleLevel}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="trophy-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.profile.level}</Text>
              </View>
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
            style={[styles.settingRow, styles.settingRowLast]}
            onPress={toggleGoal}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.profile.goal}</Text>
              </View>
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
            <View style={styles.sectionAccent} />
            <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.appearance.title}</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>
                  {isDark ? t.settings.appearance.darkMode : t.settings.appearance.lightMode}
                </Text>
              </View>
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
              thumbColor={colors.switchThumb}
            />
          </View>
          {/* Langue */}
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="language-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.appearance.language}</Text>
              </View>
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
                  {lang === 'fr' ? `\u{1F1EB}\u{1F1F7} ${t.onboarding.language.fr}` : `\u{1F1EC}\u{1F1E7} ${t.onboarding.language.en}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Group: ENTRAÎNEMENT */}
        <Text style={styles.groupLabel}>{t.settings.groups.training}</Text>

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

        {/* Group: ASSISTANT */}
        <Text style={styles.groupLabel}>{t.settings.groups.assistant}</Text>

        {/* AI */}
        <SettingsAISection styles={styles} />

        {/* Group: SYSTÈME */}
        <Text style={styles.groupLabel}>{t.settings.groups.system}</Text>

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
  user: observeCurrentUser(),
}))(SettingsContent)

const SettingsScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default SettingsScreen
