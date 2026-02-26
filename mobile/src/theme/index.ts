/**
 * Couleurs centralisées de l'application (dark mode uniquement)
 */
export const colors = {
  // Backgrounds
  background: '#21242b',
  card: '#21242b',
  cardSecondary: '#252830',

  // Actions
  primary: '#00cec9',
  danger: '#ff6b6b',
  success: '#00cec9',
  warning: '#FF9500',

  // Neutrals
  border: '#2c3039',
  separator: '#2c3039',

  // Text
  text: '#dfe6e9',
  textSecondary: '#b2bec3',
  placeholder: '#636e72',

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
  neuShadowLight: '#3c4558',
  secondaryAccent: '#6c5ce7',

  // Gradient tokens (LinearGradient)
  cardGradientStart: '#262d3a',
  cardGradientEnd: '#1a1d24',
  bgGradientStart: '#22262e',
  bgGradientEnd: '#181b21',
  primaryGradientStart: '#00d9d4',
  primaryGradientEnd: '#007a77',
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
  hero: 32,
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
  background: '#dde3ea',
  card: '#edf1f5',
  cardSecondary: '#d5dce5',
  primary: '#00cec9',
  danger: '#ff6b6b',
  success: '#00cec9',
  warning: '#e17055',
  border: '#c5cad1',
  separator: '#c5cad1',
  text: '#2d3436',
  textSecondary: '#636e72',
  placeholder: '#8a9299',
  overlay: 'rgba(20, 25, 30, 0.85)',
  bottomSheetOverlay: 'rgba(20, 25, 30, 0.45)',
  secondaryButton: '#dde2e6',
  shadow: '#b0b8c1',
  successBg: 'rgba(0, 206, 201, 0.12)',
  primaryBg: 'rgba(0, 206, 201, 0.15)',
  surfaceOverlay: 'rgba(0, 0, 0, 0.06)',
  neuShadowDark: '#8a9bb0',
  neuShadowLight: '#ffffff',
  secondaryAccent: '#6c5ce7',

  // Gradient tokens (LinearGradient)
  cardGradientStart: '#eaeff5',
  cardGradientEnd: '#d8dfe8',
  bgGradientStart: '#dde3ea',
  bgGradientEnd: '#cdd5de',
  primaryGradientStart: '#00d9d4',
  primaryGradientEnd: '#007a77',
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
    borderColor: '#ffffff',
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
    borderColor: '#ffffff',
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
    borderColor: '#d0d7e0',
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
