import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import { database } from '../model/index'
import User from '../model/models/User'
import { useHaptics } from '../hooks/useHaptics'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Language } from '../i18n'
import { OnboardingCard } from '../components/OnboardingCard'
import { AlertDialog } from '../components/AlertDialog'
import { BottomSheet } from '../components/BottomSheet'
import { exportAllData, importAllData } from '../model/utils/exportHelpers'
import { spacing, borderRadius, fontSize, type ThemeColors, getThemeNeuShadow } from '../theme'
import {
  USER_LEVELS,
  USER_GOALS,
  type UserLevel,
  type UserGoal,
} from '../model/constants'

interface Props {
  user: User | null
}

const SettingsContent: React.FC<Props> = ({ user }) => {
  const haptics = useHaptics()
  const { colors, isDark, toggleTheme, neuShadow } = useTheme()
  const { t, language, setLanguage } = useLanguage()
  const nameRef = useRef(user?.name ?? '')
  const restDurationRef = useRef(user?.restDuration?.toString() ?? '90')
  const [timerEnabled, setTimerEnabled] = useState(user?.timerEnabled ?? true)
  const [vibrationEnabled, setVibrationEnabled] = useState(user?.vibrationEnabled ?? true)
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(user?.timerSoundEnabled ?? true)
  const [streakTarget, setStreakTarget] = useState(user?.streakTarget ?? 3)
  const [editingLevel, setEditingLevel] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [pendingImportUri, setPendingImportUri] = useState<string | null>(null)

  const styles = useMemo(() => createStyles(colors, neuShadow), [colors, neuShadow])

  useEffect(() => {
    if (!user) return
    setTimerEnabled(user.timerEnabled ?? true)
    setVibrationEnabled(user.vibrationEnabled ?? true)
    setTimerSoundEnabled(user.timerSoundEnabled ?? true)
    setStreakTarget(user.streakTarget ?? 3)
  }, [user])

  const handleSaveRestDuration = useCallback(async () => {
    if (!user) return
    const duration = parseInt(restDurationRef.current, 10)
    if (isNaN(duration) || duration < 10 || duration > 600) return
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
  }, [user, haptics])

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

  const handleExportPress = () => {
    haptics.onPress()
    setShowExportOptions(true)
  }

  const handleExportShare = async () => {
    setShowExportOptions(false)
    setExporting(true)
    try {
      const filePath = await exportAllData()
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter mes données Kore',
      })
    } catch (error) {
      if (__DEV__) console.error('Export share failed:', error)
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  const handleExportDownload = async () => {
    setShowExportOptions(false)
    setExporting(true)
    try {
      const filePath = await exportAllData()
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
      if (permissions.granted) {
        const dateStr = new Date().toISOString().slice(0, 10)
        const fileName = `kore-export-${dateStr}.json`
        const content = await FileSystem.readAsStringAsync(filePath)
        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri, fileName, 'application/json'
        )
        await FileSystem.writeAsStringAsync(destUri, content)
        haptics.onSuccess()
      }
    } catch (error) {
      if (__DEV__) console.error('Export download failed:', error)
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  const handleImportPress = async () => {
    haptics.onPress()
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets[0]) {
        setPendingImportUri(result.assets[0].uri)
        setShowImportConfirm(true)
      }
    } catch (error) {
      if (__DEV__) console.error('Document picker error:', error)
    }
  }

  const handleImportConfirm = async () => {
    if (!pendingImportUri) return
    setShowImportConfirm(false)
    setImporting(true)
    try {
      await importAllData(pendingImportUri)
      haptics.onSuccess()
      setImportSuccess(true)
    } catch (error) {
      if (__DEV__) console.error('Import failed:', error)
      setImportError(true)
    } finally {
      setImporting(false)
      setPendingImportUri(null)
    }
  }

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
      setTimerEnabled(!enabled) // Revert on error
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
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
                  {lang === 'fr' ? 'Français' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section Minuteur */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.timer.title}</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.settings.timer.enable}</Text>
              <Text style={styles.settingDescription}>{t.settings.timer.enableDescription}</Text>
            </View>
            <Switch
              value={timerEnabled}
              onValueChange={handleToggleTimer}
              trackColor={{ false: colors.cardSecondary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          {timerEnabled && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{t.settings.timer.duration}</Text>
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
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{t.settings.timer.vibration}</Text>
                  <Text style={styles.settingDescription}>{t.settings.timer.vibrationDescription}</Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={handleToggleVibration}
                  trackColor={{ false: colors.cardSecondary, true: colors.primary }}
                  thumbColor={colors.text}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{t.settings.timer.sound}</Text>
                  <Text style={styles.settingDescription}>{t.settings.timer.soundDescription}</Text>
                </View>
                <Switch
                  value={timerSoundEnabled}
                  onValueChange={handleToggleTimerSound}
                  trackColor={{ false: colors.cardSecondary, true: colors.primary }}
                  thumbColor={colors.text}
                />
              </View>
            </>
          )}
        </View>

        {/* Section Gamification */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="star-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.gamification.title}</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.settings.gamification.weeklyGoal}</Text>
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

        {/* Section Intelligence Artificielle */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.ai.title}</Text>
          </View>

          <Text style={styles.aiSubLabel}>{t.settings.ai.provider}</Text>
          <View style={styles.providerList}>
            <View style={[styles.providerRow, styles.providerRowActive]}>
              <View style={[styles.radioCircle, styles.radioCircleActive]} />
              <Text style={[styles.providerLabel, styles.providerLabelActive]}>
                {t.settings.ai.offlineLabel}
              </Text>
            </View>

            <View style={[styles.providerRow, styles.providerRowDisabled]}>
              <View style={styles.radioCircle} />
              <View style={styles.providerRowContent}>
                <Text style={[styles.providerLabel, styles.providerLabelDisabled]}>
                  {t.settings.ai.cloudLabel}
                </Text>
                <Text style={styles.providerComingSoon}>{t.settings.ai.comingSoon}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Données */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="save-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.data.title}</Text>
          </View>
          <TouchableOpacity
            style={[styles.exportButton, (exporting || importing) && styles.exportButtonDisabled]}
            onPress={handleExportPress}
            disabled={exporting || importing}
            activeOpacity={0.7}
          >
            <Text style={styles.exportButtonText}>
              {exporting ? t.settings.data.exportLoading : t.settings.data.exportLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.importButton, (exporting || importing) && styles.exportButtonDisabled]}
            onPress={handleImportPress}
            disabled={exporting || importing}
            activeOpacity={0.7}
          >
            <Text style={styles.importButtonText}>
              {importing ? t.settings.data.importLoading : t.settings.data.importLabel}
            </Text>
          </TouchableOpacity>
          <Text style={styles.exportHint}>{t.settings.data.exportHint}</Text>
        </View>

        {/* BottomSheet choix d'export */}
        <BottomSheet
          visible={showExportOptions}
          onClose={() => setShowExportOptions(false)}
          title={t.settings.data.exportSheetTitle}
        >
          <TouchableOpacity style={styles.sheetOption} onPress={handleExportShare} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color={colors.primary} />
            <View style={styles.sheetOptionContent}>
              <Text style={styles.sheetOptionTitle}>{t.settings.data.shareOption}</Text>
              <Text style={styles.sheetOptionDesc}>{t.settings.data.shareDescription}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={handleExportDownload} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <View style={styles.sheetOptionContent}>
              <Text style={styles.sheetOptionTitle}>{t.settings.data.saveOption}</Text>
              <Text style={styles.sheetOptionDesc}>{t.settings.data.saveDescription}</Text>
            </View>
          </TouchableOpacity>
        </BottomSheet>

        {/* AlertDialog confirmation import */}
        <AlertDialog
          visible={showImportConfirm}
          title={t.settings.data.importConfirmTitle}
          message={t.settings.data.importConfirmMessage}
          confirmText={t.settings.data.importConfirmButton}
          confirmColor={colors.danger}
          cancelText={t.common.cancel}
          onConfirm={handleImportConfirm}
          onCancel={() => { setShowImportConfirm(false); setPendingImportUri(null) }}
        />

        {/* AlertDialog succès import */}
        <AlertDialog
          visible={importSuccess}
          title={t.settings.data.importSuccessTitle}
          message={t.settings.data.importSuccessMessage}
          confirmText={t.common.ok}
          confirmColor={colors.primary}
          onConfirm={() => setImportSuccess(false)}
          onCancel={() => setImportSuccess(false)}
          hideCancel
        />

        <AlertDialog
          visible={exportError}
          title={t.settings.data.exportErrorTitle}
          message={t.settings.data.exportErrorMessage}
          confirmText={t.common.ok}
          confirmColor={colors.primary}
          onConfirm={() => setExportError(false)}
          onCancel={() => setExportError(false)}
          hideCancel
        />

        {/* AlertDialog erreur import */}
        <AlertDialog
          visible={importError}
          title={t.settings.data.importErrorTitle}
          message={t.settings.data.importErrorMessage}
          confirmText={t.common.ok}
          confirmColor={colors.primary}
          onConfirm={() => setImportError(false)}
          onCancel={() => setImportError(false)}
          hideCancel
        />

        {/* Section À propos */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.about.title}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.settings.about.app}</Text>
            <Text style={styles.infoValue}>Kore</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.settings.about.version}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.settings.about.developedWith}</Text>
            <Text style={styles.infoValue}>React Native + WatermelonDB</Text>
          </View>
        </View>

        {/* Section Aide */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t.settings.help.title}</Text>
          </View>

          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>{t.settings.help.navigationTitle}{'\n'}</Text>
            {t.settings.help.navigationContent}{'\n\n'}
            <Text style={styles.helpBold}>{t.settings.help.programsTitle}{'\n'}</Text>
            {t.settings.help.programsContent}{'\n\n'}
            <Text style={styles.helpBold}>{t.settings.help.exercisesTitle}{'\n'}</Text>
            {t.settings.help.exercisesContent}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  )
}

function createStyles(colors: ThemeColors, neuShadow: ReturnType<typeof getThemeNeuShadow>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      padding: spacing.lg,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...neuShadow.elevatedSm,
    },
    sectionTitleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: 'bold',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardSecondary,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingLabel: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
      marginBottom: 4,
    },
    settingDescription: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      backgroundColor: colors.cardSecondary,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      fontSize: fontSize.md,
      fontWeight: 'bold',
      width: 80,
      textAlign: 'center',
    },
    inputUnit: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      marginLeft: spacing.sm,
    },
    nameInput: {
      width: 140,
      textAlign: 'right',
    },
    profileCards: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardSecondary,
    },
    infoLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      marginRight: spacing.sm,
    },
    infoValue: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
      flexShrink: 1,
      textAlign: 'right',
    },
    helpText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      lineHeight: 22,
    },
    helpBold: {
      color: colors.text,
      fontWeight: 'bold',
    },
    aiSubLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    providerList: {
      gap: spacing.xs,
    },
    providerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      gap: spacing.md,
    },
    providerRowActive: {
      backgroundColor: colors.cardSecondary,
    },
    radioCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.textSecondary,
    },
    radioCircleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    providerLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
    },
    providerLabelActive: {
      color: colors.text,
      fontWeight: '600',
    },
    providerRowDisabled: {
      opacity: 0.4,
    },
    providerRowContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    providerLabelDisabled: {
      color: colors.textSecondary,
    },
    providerComingSoon: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    streakTargetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    streakTargetBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      ...neuShadow.pressed,
    },
    streakTargetBtnActive: {
      backgroundColor: colors.primary,
      ...neuShadow.elevatedSm,
    },
    streakTargetText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    streakTargetTextActive: {
      color: colors.text,
    },
    streakTargetLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    exportButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      alignItems: 'center' as const,
      ...neuShadow.elevatedSm,
    },
    exportButtonDisabled: {
      opacity: 0.6,
    },
    exportButtonText: {
      color: colors.primaryText,
      fontSize: fontSize.md,
      fontWeight: '600' as const,
    },
    exportHint: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center' as const,
      marginTop: spacing.sm,
    },
    importButton: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      alignItems: 'center' as const,
      marginTop: spacing.sm,
      ...neuShadow.elevatedSm,
    },
    importButtonText: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600' as const,
    },
    languageRow: {
      flexDirection: 'row' as const,
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
    languageBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
      alignItems: 'center' as const,
    },
    languageBtnActive: {
      backgroundColor: colors.primary,
    },
    languageBtnText: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      fontWeight: '600' as const,
    },
    languageBtnTextActive: {
      color: colors.primaryText,
    },
    sheetOption: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardSecondary,
    },
    sheetOptionContent: {
      flex: 1,
    },
    sheetOptionTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600' as const,
    },
    sheetOptionDesc: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginTop: 2,
    },
  })
}

export { SettingsContent }

export default withObservables([], () => ({
  user: database.get<User>('users').query().observe().pipe(
    map((list: User[]) => list[0] || null)
  ),
}))(SettingsContent)
