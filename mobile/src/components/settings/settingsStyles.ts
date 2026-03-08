/**
 * settingsStyles.ts — Shared styles for Settings sub-components
 */

import { StyleSheet } from 'react-native'
import { spacing, borderRadius, fontSize, type ThemeColors, getThemeNeuShadow } from '../../theme'

export type NeuShadow = ReturnType<typeof getThemeNeuShadow>

const AVATAR_SIZE = 56
const RADIO_SIZE = 18
const STREAK_BTN_SIZE = 44
const INPUT_WIDTH = 80
const NAME_INPUT_WIDTH = 140
const TIME_PICKER_MAX_HEIGHT = 200

export function createSettingsStyles(colors: ThemeColors, neuShadow: NeuShadow) {
  return StyleSheet.create({
    // Profile header hero
    profileHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...neuShadow.elevated,
    },
    profileAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: colors.primaryBg,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: spacing.md,
    },
    profileAvatarText: {
      fontSize: fontSize.xl,
      fontWeight: '700' as const,
      color: colors.primary,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: fontSize.lg,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 2,
    },
    profileSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    // Group labels
    groupLabel: {
      fontSize: fontSize.xs,
      fontWeight: '700' as const,
      color: colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase' as const,
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
      marginLeft: spacing.xs,
    },
    // Section accent bar
    sectionAccent: {
      width: 3,
      height: 20,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xxs,
    },
    // Setting label with icon
    settingLabelRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
    },
    // Last row in a section (no bottom border)
    settingRowLast: {
      borderBottomWidth: 0,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
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
      fontSize: fontSize.lg,
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
      marginBottom: spacing.xs,
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
      borderRadius: borderRadius.md,
      fontSize: fontSize.md,
      fontWeight: 'bold',
      width: INPUT_WIDTH,
      textAlign: 'center',
    },
    inputUnit: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      marginLeft: spacing.sm,
    },
    nameInput: {
      width: NAME_INPUT_WIDTH,
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
    // AI section
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
      width: RADIO_SIZE,
      height: RADIO_SIZE,
      borderRadius: borderRadius.sm,
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
    // Gamification
    streakTargetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    streakTargetBtn: {
      width: STREAK_BTN_SIZE,
      height: STREAK_BTN_SIZE,
      borderRadius: STREAK_BTN_SIZE / 2,
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
    // Data section
    dataButtonGap: {
      gap: spacing.sm,
    },
    exportHint: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center' as const,
      marginTop: spacing.sm,
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
    // Language
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
    // Reminders
    reminderPermissionMsg: {
      color: colors.danger,
      fontSize: fontSize.sm,
      paddingVertical: spacing.sm,
    },
    reminderDaysRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.xs,
      paddingBottom: spacing.sm,
    },
    reminderDayBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.ms,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.cardSecondary,
      ...neuShadow.pressed,
    },
    reminderDayBtnActive: {
      backgroundColor: colors.primary,
      ...neuShadow.elevatedSm,
    },
    reminderDayText: {
      fontSize: fontSize.sm,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    reminderDayTextActive: {
      color: colors.primaryText,
    },
    reminderTimeDisplay: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
    },
    reminderTimeText: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: 'bold' as const,
    },
    // Time picker
    timePickerContainer: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      justifyContent: 'center' as const,
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    timePickerColumn: {
      flex: 1,
      alignItems: 'center' as const,
    },
    timePickerLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '600' as const,
      marginBottom: spacing.sm,
    },
    timePickerList: {
      maxHeight: TIME_PICKER_MAX_HEIGHT,
    },
    timePickerItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.sm,
      marginVertical: 2,
      alignItems: 'center' as const,
    },
    timePickerItemActive: {
      backgroundColor: colors.primary,
    },
    timePickerItemText: {
      color: colors.textSecondary,
      fontSize: fontSize.lg,
      fontWeight: '600' as const,
    },
    timePickerItemTextActive: {
      color: colors.primaryText,
    },
    timePickerSeparator: {
      color: colors.text,
      fontSize: fontSize.xxl,
      fontWeight: 'bold' as const,
      marginTop: spacing.xl,
    },
    timePickerConfirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      alignItems: 'center' as const,
      marginTop: spacing.md,
    },
    timePickerConfirmText: {
      color: colors.primaryText,
      fontSize: fontSize.md,
      fontWeight: '600' as const,
    },
  })
}

export type SettingsStyles = ReturnType<typeof createSettingsStyles>
