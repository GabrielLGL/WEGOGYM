import { colors as staticColors } from './index'
import type { ThemeColors } from './index'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Factory pour créer un chartConfig compatible react-native-chart-kit.
 * Centralise les couleurs et styles partagés entre les écrans Stats.
 *
 * @param options.decimalPlaces - Décimales affichées (défaut: 0)
 * @param options.showDots      - Afficher les points (LineChart). Défaut: false
 * @param options.colors        - Couleurs du thème actif (useColors()). Défaut: thème dark statique
 */
export function createChartConfig(options: {
  decimalPlaces?: number
  showDots?: boolean
  colors?: ThemeColors
} = {}) {
  const { decimalPlaces = 0, showDots = false, colors = staticColors } = options
  const primaryRgb = hexToRgb(colors.primary)
  const textRgb = hexToRgb(colors.text)
  return {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces,
    color: (opacity = 1) => `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, ${opacity})`,
    style: { borderRadius: 16 },
    ...(showDots ? { propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary } } : {}),
  }
}
