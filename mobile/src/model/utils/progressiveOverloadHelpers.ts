/**
 * progressiveOverloadHelpers.ts
 * Calcule la tendance de surcharge progressive (poids max / volume) sur les N dernières séances.
 */

export interface OverloadTrend {
  metric: 'weight' | 'volume'
  trend: 'up' | 'down' | 'stable'
  percentChange: number
  lastSessions: number
  dataPoints: Array<{
    date: number
    value: number
  }>
}

interface SetInput {
  weight: number
  reps: number
  createdAt: Date | number
}

/** Convertit createdAt en timestamp numérique */
function toTimestamp(createdAt: Date | number): number {
  return typeof createdAt === 'number' ? createdAt : createdAt.getTime()
}

/** Retourne le début du jour (minuit) pour regrouper par séance */
function dayKey(ts: number): number {
  const d = new Date(ts)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * Régression linéaire simple — retourne la pente (slope) normalisée.
 * Les x sont normalisés de 0 à 1 pour éviter des overflow.
 */
function linearSlope(values: number[]): number {
  const n = values.length
  if (n < 2) return 0

  const xs = values.map((_, i) => i / (n - 1))
  const meanX = 0.5
  const meanY = values.reduce((s, v) => s + v, 0) / n

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }

  return den === 0 ? 0 : num / den
}

/**
 * Analyse la tendance de surcharge progressive sur les N dernières séances.
 *
 * @param sets - Tous les sets de l'exercice (avec weight, reps, createdAt)
 * @param windowSize - Nombre de séances à analyser (défaut : 5)
 * @returns Tendances du poids max et du volume par séance
 */
export function computeOverloadTrend(
  sets: SetInput[],
  windowSize = 5,
): { weightTrend: OverloadTrend; volumeTrend: OverloadTrend } {
  // 1. Grouper par jour
  const byDay = new Map<number, SetInput[]>()
  for (const s of sets) {
    const key = dayKey(toTimestamp(s.createdAt))
    const bucket = byDay.get(key) ?? []
    bucket.push(s)
    byDay.set(key, bucket)
  }

  // 2. Trier les séances chronologiquement et prendre les N dernières
  const sortedDays = [...byDay.keys()].sort((a, b) => a - b)
  const window = sortedDays.slice(-windowSize)

  // 3. Calculer maxWeight et sessionVolume pour chaque séance
  const weightPoints: Array<{ date: number; value: number }> = []
  const volumePoints: Array<{ date: number; value: number }> = []

  for (const day of window) {
    const daySets = byDay.get(day) ?? []
    const maxWeight = Math.max(...daySets.map(s => s.weight))
    const volume = daySets.reduce((acc, s) => acc + s.weight * s.reps, 0)
    weightPoints.push({ date: day, value: maxWeight })
    volumePoints.push({ date: day, value: volume })
  }

  const lastSessions = window.length

  // 4. Calculer tendance poids
  const wValues = weightPoints.map(p => p.value)
  const wSlope = linearSlope(wValues)
  const wFirst = wValues[0] ?? 0
  const wLast = wValues[wValues.length - 1] ?? 0
  const wPercent = wFirst > 0 ? ((wLast - wFirst) / wFirst) * 100 : 0
  const wTrend: 'up' | 'down' | 'stable' =
    wSlope > 0 && wPercent > 2 ? 'up' : wSlope < 0 && wPercent < -2 ? 'down' : 'stable'

  // 5. Calculer tendance volume
  const vValues = volumePoints.map(p => p.value)
  const vSlope = linearSlope(vValues)
  const vFirst = vValues[0] ?? 0
  const vLast = vValues[vValues.length - 1] ?? 0
  const vPercent = vFirst > 0 ? ((vLast - vFirst) / vFirst) * 100 : 0
  const vTrend: 'up' | 'down' | 'stable' =
    vSlope > 0 && vPercent > 2 ? 'up' : vSlope < 0 && vPercent < -2 ? 'down' : 'stable'

  return {
    weightTrend: {
      metric: 'weight',
      trend: wTrend,
      percentChange: wPercent,
      lastSessions,
      dataPoints: weightPoints,
    },
    volumeTrend: {
      metric: 'volume',
      trend: vTrend,
      percentChange: vPercent,
      lastSessions,
      dataPoints: volumePoints,
    },
  }
}
