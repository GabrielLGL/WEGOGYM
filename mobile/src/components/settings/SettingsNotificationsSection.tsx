import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Switch, TouchableOpacity, FlatList, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../../model/index'
import User from '../../model/models/User'
import {
  requestNotificationPermission,
  setupReminderChannel,
  updateReminders,
} from '../../services/notificationService'
import { useHaptics } from '../../hooks/useHaptics'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { BottomSheet } from '../BottomSheet'
import type { SettingsStyles } from './settingsStyles'

interface SettingsNotificationsSectionProps {
  user: User | null
  styles: SettingsStyles
  remindersEnabled: boolean
  setRemindersEnabled: (v: boolean) => void
  reminderDays: number[]
  setReminderDays: (v: number[]) => void
  reminderHour: number
  setReminderHour: (v: number) => void
  reminderMinute: number
  setReminderMinute: (v: number) => void
  streakTarget: number
  setStreakTarget: (v: number) => void
}

export const SettingsNotificationsSection: React.FC<SettingsNotificationsSectionProps> = ({
  user,
  styles,
  remindersEnabled,
  setRemindersEnabled,
  reminderDays,
  setReminderDays,
  reminderHour,
  setReminderHour,
  reminderMinute,
  setReminderMinute,
  streakTarget,
  setStreakTarget,
}) => {
  const colors = useColors()
  const haptics = useHaptics()
  const { t } = useLanguage()

  const [showTimePicker, setShowTimePicker] = useState(false)
  const [tempHour, setTempHour] = useState(reminderHour)
  const [tempMinute, setTempMinute] = useState(reminderMinute)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const HOURS = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const MINUTES = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), [])

  const saveReminders = useCallback(async (enabled: boolean, days: number[], hour: number, minute: number) => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => {
          u.remindersEnabled = enabled
          u.reminderDays = JSON.stringify(days)
          u.reminderHour = hour
          u.reminderMinute = minute
        })
      })
      await updateReminders(enabled, days, hour, minute, t.settings.reminders.notifTitle, t.settings.reminders.notifBody)
    } catch (error) {
      if (__DEV__) console.error('Failed to save reminders:', error)
    }
  }, [user, t])

  const handleToggleReminders = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        setPermissionDenied(true)
        return
      }
      await setupReminderChannel()
      setPermissionDenied(false)
    }
    setRemindersEnabled(enabled)
    haptics.onPress()
    await saveReminders(enabled, reminderDays, reminderHour, reminderMinute)
  }

  const handleToggleDay = async (isoDay: number) => {
    const newDays = reminderDays.includes(isoDay)
      ? reminderDays.filter(d => d !== isoDay)
      : [...reminderDays, isoDay].sort((a, b) => a - b)
    setReminderDays(newDays)
    haptics.onSelect()
    await saveReminders(remindersEnabled, newDays, reminderHour, reminderMinute)
  }

  const handleConfirmTime = async () => {
    setShowTimePicker(false)
    setReminderHour(tempHour)
    setReminderMinute(tempMinute)
    haptics.onSuccess()
    await saveReminders(remindersEnabled, reminderDays, tempHour, tempMinute)
  }

  const renderHourItem = useCallback(({ item }: { item: number }) => (
    <TouchableOpacity
      style={[
        styles.timePickerItem,
        tempHour === item && styles.timePickerItemActive,
      ]}
      onPress={() => { setTempHour(item); haptics.onSelect() }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.timePickerItemText,
          tempHour === item && styles.timePickerItemTextActive,
        ]}
      >
        {String(item).padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  ), [tempHour, styles, haptics])

  const renderMinuteItem = useCallback(({ item }: { item: number }) => (
    <TouchableOpacity
      style={[
        styles.timePickerItem,
        tempMinute === item && styles.timePickerItemActive,
      ]}
      onPress={() => { setTempMinute(item); haptics.onSelect() }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.timePickerItemText,
          tempMinute === item && styles.timePickerItemTextActive,
        ]}
      >
        {String(item).padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  ), [tempMinute, styles, haptics])

  return (
    <>
      {/* Section Rappels */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.settings.reminders.title}</Text>
        </View>

        <View style={remindersEnabled ? styles.settingRow : [styles.settingRow, styles.settingRowLast]}>
          <View style={styles.settingInfo}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="notifications-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>{t.settings.reminders.enable}</Text>
            </View>
            <Text style={styles.settingDescription}>{t.settings.reminders.enableDescription}</Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: colors.cardSecondary, true: colors.primary }}
            thumbColor={colors.switchThumb}
          />
        </View>

        {permissionDenied && (
          <Text style={styles.reminderPermissionMsg}>{t.settings.reminders.permissionNeeded}</Text>
        )}

        {remindersEnabled && (
          <>
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingLabelRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>{t.settings.reminders.days}</Text>
                </View>
              </View>
            </View>
            <View style={styles.reminderDaysRow}>
              {([1, 2, 3, 4, 5, 6, 7] as const).map((isoDay, index) => (
                <TouchableOpacity
                  key={isoDay}
                  style={[
                    styles.reminderDayBtn,
                    reminderDays.includes(isoDay) && styles.reminderDayBtnActive,
                  ]}
                  onPress={() => handleToggleDay(isoDay)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.reminderDayText,
                      reminderDays.includes(isoDay) && styles.reminderDayTextActive,
                    ]}
                  >
                    {t.settings.reminders.dayLabels[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.settingRow, styles.settingRowLast]}
              onPress={() => {
                setTempHour(reminderHour)
                setTempMinute(reminderMinute)
                setShowTimePicker(true)
                haptics.onPress()
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingLabelRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>{t.settings.reminders.time}</Text>
                </View>
              </View>
              <View style={styles.reminderTimeDisplay}>
                <Text style={styles.reminderTimeText}>
                  {String(reminderHour).padStart(2, '0')}:{String(reminderMinute).padStart(2, '0')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* BottomSheet time picker */}
      <BottomSheet
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        title={t.settings.reminders.timeSheetTitle}
      >
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>{t.settings.reminders.hours}</Text>
            <FlatList
              data={HOURS}
              keyExtractor={item => `h-${item}`}
              style={styles.timePickerList}
              showsVerticalScrollIndicator={false}
              renderItem={renderHourItem}
              initialNumToRender={24}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          </View>
          <Text style={styles.timePickerSeparator}>:</Text>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>{t.settings.reminders.minutes}</Text>
            <FlatList
              data={MINUTES}
              keyExtractor={item => `m-${item}`}
              style={styles.timePickerList}
              showsVerticalScrollIndicator={false}
              renderItem={renderMinuteItem}
              initialNumToRender={12}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.timePickerConfirmBtn}
          onPress={handleConfirmTime}
          activeOpacity={0.7}
        >
          <Text style={styles.timePickerConfirmText}>{t.common.confirm}</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Section Gamification */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Ionicons name="star-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.settings.gamification.title}</Text>
        </View>
        <View style={[styles.settingRow, styles.settingRowLast]}>
          <View style={styles.settingInfo}>
            <View style={styles.settingLabelRow}>
              <Ionicons name="flame-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>{t.settings.gamification.weeklyGoal}</Text>
            </View>
            <Text style={styles.settingDescription}>{t.settings.gamification.weeklyGoalDescription}</Text>
          </View>
        </View>
        <View style={styles.streakTargetRow}>
          {[2, 3, 4, 5].map(target => (
            <TouchableOpacity
              key={target}
              testID={`streak-target-${target}`}
              style={[
                styles.streakTargetBtn,
                streakTarget === target && styles.streakTargetBtnActive,
              ]}
              onPress={async () => {
                if (!user || streakTarget === target) return
                haptics.onSelect()
                setStreakTarget(target)
                try {
                  await database.write(async () => {
                    await user.update(u => { u.streakTarget = target })
                  })
                } catch (error) {
                  if (__DEV__) console.error('Failed to update streak target:', error)
                  setStreakTarget(user.streakTarget ?? 3)
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.streakTargetText,
                  streakTarget === target && styles.streakTargetTextActive,
                ]}
              >
                {target}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.streakTargetLabel}>{t.settings.gamification.sessionsPerWeek}</Text>
        </View>
      </View>
    </>
  )
}
