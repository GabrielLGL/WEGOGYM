import { StyleSheet } from 'react-native'

/**
 * Couleurs centralisées de l'application (dark mode uniquement)
 */
export const colors = {
  // Backgrounds
  background: '#121212',
  card: '#1C1C1E',
  cardSecondary: '#2C2C2E',

  // Actions
  primary: '#007AFF',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // Neutrals
  border: '#333',
  separator: '#38383A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  placeholder: '#444',

  // UI Elements
  overlay: 'rgba(0, 0, 0, 0.85)',
  bottomSheetOverlay: 'rgba(0, 0, 0, 0.4)',

  // Secondary buttons
  secondaryButton: '#3A3A3C',
}

/**
 * Espacements standardisés
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
}

/**
 * Border radius standardisés
 */
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
}

/**
 * Tailles de police standardisées
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
}

/**
 * Styles communs réutilisables dans toute l'application
 */
export const commonStyles = StyleSheet.create({
  // Modals et overlays
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    zIndex: 1000,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },

  // Modal content
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 400,
  },

  // Boutons de modal
  modalButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },

  cardSecondary: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },

  // Text styles
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },

  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },

  bodyText: {
    fontSize: fontSize.md,
    color: colors.text,
  },

  // Separators
  separator: {
    height: 1,
    backgroundColor: colors.separator,
  },

  // Bottom sheet
  bottomSheetContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 999,
  },

  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bottomSheetOverlay,
  },

  bottomSheetContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.separator,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  // Input styles
  input: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },

  inputFocused: {
    borderWidth: 1,
    borderColor: colors.primary,
  },

  // Chip styles
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardSecondary,
    marginRight: spacing.sm,
  },

  chipSelected: {
    backgroundColor: colors.primary,
  },

  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  chipTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
