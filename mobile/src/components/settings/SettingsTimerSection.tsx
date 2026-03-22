import React, { useRef, useCallback, useState } from 'react'
import { View, Text, TextInput, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../../model/index'
import User from '../../model/models/User'
import { useHaptics } from '../../hooks/useHaptics'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { SettingsStyles } from './settingsStyles'

interface SettingsTimerSectionProps {
  user: User | null
  styles: SettingsStyles
  timerEnabled: boolean
  setTimerEnabled: (v: boolean) => void
  vibrationEnabled: boolean
  setVibrationEnabled: (v: boolean) => void
  timerSoundEnabled: boolean
  setTimerSoundEnabled: (v: boolean) => void
}

export const SettingsTimerSection: React.FC<SettingsTimerSectionProps> = ({
  user,
  styles,
  timerEnabled,
  setTimerEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  timerSoundEnabled,
  setTimerSoundEnabled,
}) => {
  const colors = useColors()
  const haptics = useHaptics()
  const { t } = useLanguage()
  const restDurationRef = useRef(user?.restDuration?.toString() ?? '90')
  const [timerError, setTimerError] = useState<string | null>(null)

  const handleSaveRestDuration = useCallback(async () => {
    if (!user) return
    const duration = parseInt(restDurationRef.current, 10)
    if (isNaN(duration) || duration < 10 || duration > 600) {
      setTimerError(t.settings.timer.durationError)
      return
    }
    setTimerError(null)
    try {
      await database.write(async () => {
        await user.update((u) => {
          u.restDuration = duration
        })
      })
      haptics.onSuccess()
    } catch (error) {
      if (__DEV__) console.error('Failed to update rest duration:', error)
    }
  }, [user, haptics, t])

  const handleToggleTimer = async (enabled: boolean) => {
    if (!user) return
    setTimerEnabled(enabled)
    try {
      await database.write(async () => {
        await user.update((u) => {
          u.timerEnabled = enabled
        })
      })
      haptics.onPress()
    } catch (error) {
      if (__DEV__) console.error('Failed to toggle timer:', error)
      setTimerEnabled(!enabled)
    }
  }

  const handleToggleVibration = async (enabled: boolean) => {
    if (!user) return
    setVibrationEnabled(enabled)
    try {
      await database.write(async () => {
        await user.update((u) => { u.vibrationEnabled = enabled })
      })
      haptics.onPress()
    } catch (error) {
      if (__DEV__) console.error('Failed to toggle vibration:', error)
      setVibrationEnabled(!enabled)
    }
  }

  const handleToggleTimerSound = async (enabled: boolean) => {
    if (!user) return
    setTimerSoundEnabled(enabled)
    try {
      await database.write(async () => {
        await user.update((u) => { u.timerSoundEnabled = enabled })
      })
      haptics.onPress()
    } catch (error) {
      if (__DEV__) console.error('Failed to toggle timer sound:', error)
      setTimerSoundEnabled(!enabled)
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>{t.settings.timer.title}</Text>
      </View>

      <View style={timerEnabled ? styles.settingRow : [styles.settingRow, styles.settingRowLast]}>
        <View style={styles.settingInfo}>
          <View style={styles.settingLabelRow}>
            <Ionicons name="timer-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>{t.settings.timer.enable}</Text>
          </View>
          <Text style={styles.settingDescription}>{t.settings.timer.enableDescription}</Text>
        </View>
        <Switch
          value={timerEnabled}
          onValueChange={handleToggleTimer}
          trackColor={{ false: colors.cardSecondary, true: colors.primary }}
          thumbColor={colors.switchThumb}
        />
      </View>

      {timerEnabled && (
        <>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="hourglass-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.timer.duration}</Text>
              </View>
              <Text style={styles.settingDescription}>{t.settings.timer.durationDescription}</Text>
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                defaultValue={user?.restDuration?.toString() ?? '90'}
                onChangeText={val => { restDurationRef.current = val }}
                keyboardType="numeric"
                onBlur={handleSaveRestDuration}
                onSubmitEditing={handleSaveRestDuration}
                placeholderTextColor={colors.placeholder}
              />
              <Text style={styles.inputUnit}>{t.common.seconds}</Text>
            </View>
            {timerError && <Text style={styles.reminderPermissionMsg}>{timerError}</Text>}
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.timer.vibration}</Text>
              </View>
              <Text style={styles.settingDescription}>{t.settings.timer.vibrationDescription}</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleToggleVibration}
              trackColor={{ false: colors.cardSecondary, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelRow}>
                <Ionicons name="volume-high-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>{t.settings.timer.sound}</Text>
              </View>
              <Text style={styles.settingDescription}>{t.settings.timer.soundDescription}</Text>
            </View>
            <Switch
              value={timerSoundEnabled}
              onValueChange={handleToggleTimerSound}
              trackColor={{ false: colors.cardSecondary, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>
        </>
      )}
    </View>
  )
}
