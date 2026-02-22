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

  // Shadow (iOS)
  shadow: '#000',

  // Transparent tints (pour les chips et fonds semi-transparents)
  successBg: 'rgba(52, 199, 89, 0.12)',
  primaryBg: 'rgba(0, 122, 255, 0.15)',
  surfaceOverlay: 'rgba(255, 255, 255, 0.08)',
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
  hero: 32,
}

/**
 * Couleurs d'intensité pour le calendrier heatmap
 * Index 0 = repos, 1 = 1 séance, 2 = 2 séances, 3 = 3+ séances
 */
export const intensityColors = ['#2C2C2E', '#1E4D2B', '#2D7A47', '#34C759'] as const

