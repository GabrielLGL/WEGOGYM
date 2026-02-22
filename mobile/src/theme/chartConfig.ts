import { colors } from './index'

const CHART_DOTS = { r: '4', strokeWidth: '2', stroke: colors.primary }

/**
 * Factory pour créer un chartConfig compatible react-native-chart-kit.
 * Centralise les couleurs et styles partagés entre les écrans Stats.
 *
 * @param options.decimalPlaces - Décimales affichées (défaut: 0)
 * @param options.showDots      - Afficher les points (LineChart). Défaut: false
 */
export function createChartConfig(options: {
  decimalPlaces?: number
  showDots?: boolean
} = {}) {
  const { decimalPlaces = 0, showDots = false } = options
  return {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    ...(showDots ? { propsForDots: CHART_DOTS } : {}),
  }
}
