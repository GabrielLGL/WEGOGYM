/**
 * Couleurs centralisées de l'application (dark mode uniquement)
 */
export const colors = {
  // Backgrounds
  background: '#181b21',
  card: '#21242b',
  cardSecondary: '#282d38',

  // Actions
  primary: '#00cec9',
  danger: '#ff6b6b',
  success: '#00cec9',
  warning: '#FF9500',

  // Neutrals
  border: '#363d4d',
  separator: '#363d4d',

  // Text
  text: '#dfe6e9',
  textSecondary: '#b2bec3',
  placeholder: '#8a9299',

  // UI Elements
  overlay: 'rgba(10, 12, 16, 0.9)',
  bottomSheetOverlay: 'rgba(10, 12, 16, 0.5)',

  // Secondary buttons
  secondaryButton: '#252830',

  // Shadow (iOS neumorphique)
  shadow: '#16181d',

  // Transparent tints (pour les chips et fonds semi-transparents)
  successBg: 'rgba(0, 206, 201, 0.12)',
  primaryBg: 'rgba(0, 206, 201, 0.15)',
  surfaceOverlay: 'rgba(255, 255, 255, 0.08)',

  // Neumorphism tokens
  neuShadowDark: '#060809',

  // Gradient tokens (LinearGradient)
  bgGradientStart: '#22262e',
  bgGradientEnd: '#181b21',
  primaryGradientStart: '#00d9d4',
  primaryGradientEnd: '#007a77',

  // Text on primary-colored surfaces (buttons, badges)
  primaryText: '#ffffff',

  // Heatmap calendar intensity (index 0 = rest, 1-3 = activity levels)
  intensityColors: ['#252830', '#004d4a', '#007875', '#00cec9'] as [string, string, string, string],
}

/**
 * Espacements standardisés
 */
export const spacing = {
  xs: 4,
  sm: 8,
  ms: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
}

/**
 * Border radius standardisés (coins plus arrondis pour le neumorphisme)
 */
export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
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
  caption: 11,
  bodyMd: 15,
  jumbo: 48,
}

/**
 * Couleurs d'intensité pour le calendrier heatmap (cyan neumorphique)
 * Index 0 = repos, 1 = 1 séance, 2 = 2 séances, 3 = 3+ séances
 */
export const intensityColors = ['#252830', '#004d4a', '#007875', '#00cec9'] as const

import { Platform } from 'react-native'

/**
 * Ombres neumorphiques dark — Platform-aware
 * iOS : shadowColor + shadowOffset + shadowOpacity + shadowRadius
 * Android : elevation
 * borderColor simule le reflet clair (second shadow CSS)
 */
export const neuShadow = {
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#020304',
        shadowOffset: { width: 12, height: 12 },
        shadowOpacity: 1.0,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
    borderWidth: 1,
    borderColor: '#4a5570',
  },
  elevatedSm: {
    ...Platform.select({
      ios: {
        shadowColor: '#020304',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.95,
        shadowRadius: 12,
      },
      android: { elevation: 7 },
    }),
    borderWidth: 1,
    borderColor: '#404a62',
  },
  pressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#020304',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
    borderWidth: 1,
    borderColor: '#1e2330',
  },
}

/**
 * Palette light neumorphique (miroir du dark)
 */
export const lightColors = {
  background: '#d8dde6',
  card: '#eef1f5',
  cardSecondary: '#e4e9f0',
  primary: '#6c5ce7',
  danger: '#ff6b6b',
  success: '#006d6b',
  warning: '#e17055',
  border: '#b8c1cc',
  separator: '#b8c1cc',
  text: '#2d3436',
  textSecondary: '#525c61',
  placeholder: '#6e7a81',
  overlay: 'rgba(20, 25, 30, 0.85)',
  bottomSheetOverlay: 'rgba(20, 25, 30, 0.45)',
  secondaryButton: '#dde2e6',
  shadow: '#b0b8c1',
  successBg: 'rgba(0, 109, 107, 0.12)',
  primaryBg: 'rgba(108, 92, 231, 0.12)',
  surfaceOverlay: 'rgba(0, 0, 0, 0.06)',
  neuShadowDark: '#8a9bb0',

  // Gradient tokens (LinearGradient)
  bgGradientStart: '#eaeff5',
  bgGradientEnd: '#dce4ee',
  primaryGradientStart: '#7c6ef0',
  primaryGradientEnd: '#4a3da8',

  // Text on primary-colored surfaces (buttons, badges)
  primaryText: '#ffffff',

  // Heatmap calendar intensity (index 0 = rest, 1-3 = activity levels)
  intensityColors: ['#c5cad2', '#c5bef6', '#9b90ed', '#6c5ce7'] as [string, string, string, string],
}

/**
 * Ombres light neumorphiques — Platform-aware
 */
export const neuShadowLight = {
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#8a9bb0',
        shadowOffset: { width: 12, height: 12 },
        shadowOpacity: 1.0,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
    borderWidth: 1,
    borderColor: '#f5f8fc',
  },
  elevatedSm: {
    ...Platform.select({
      ios: {
        shadowColor: '#8a9bb0',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.95,
        shadowRadius: 12,
      },
      android: { elevation: 7 },
    }),
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  pressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#8a9bb0',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
    borderWidth: 1,
    borderColor: '#c8d0da',
  },
}

/**
 * Paramètres numériques pour react-native-shadow-2 (vrai neumorphisme double-ombre)
 * distance : taille du flou SVG, offset : décalage de l'ombre (bas-droite / haut-gauche)
 */
export const neuShadowParams = {
  dark: {
    elevated:   { distance: 14, offset: 10, darkColor: '#060809', lightColor: '#3c4558' },
    elevatedSm: { distance: 8,  offset: 6,  darkColor: '#060809', lightColor: '#3c4558' },
    pressed:    { distance: 3,  offset: 2,  darkColor: '#060809', lightColor: '#2a3040' },
  },
  light: {
    elevated:   { distance: 14, offset: 10, darkColor: '#8a9bb0', lightColor: '#ffffff' },
    elevatedSm: { distance: 8,  offset: 6,  darkColor: '#8a9bb0', lightColor: '#ffffff' },
    pressed:    { distance: 3,  offset: 2,  darkColor: '#a0aabb', lightColor: '#ffffff' },
  },
}

/** Type union des deux palettes */
export type ThemeColors = typeof colors
export type ThemeMode = 'dark' | 'light'

/** Retourne la palette de couleurs selon le mode actif */
export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === 'light' ? (lightColors as ThemeColors) : colors
}

/** Retourne les ombres neumorphiques selon le mode actif */
export function getThemeNeuShadow(mode: ThemeMode) {
  return mode === 'light' ? neuShadowLight : neuShadow
}
