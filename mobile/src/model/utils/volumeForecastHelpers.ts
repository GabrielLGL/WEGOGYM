/**
 * volumeForecastHelpers.ts — Prévision du volume d'entraînement
 *
 * Calcule une prédiction du volume hebdomadaire basée sur les 8 dernières semaines,
 * avec moyenne pondérée, intervalle de confiance et tendance (régression linéaire).
 */

import type WorkoutSet from '../models/Set'

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface WeeklyVolume {
  /** Lundi de la semaine (00:00:00) */
  weekStart: Date
  /** Volume total = Σ(weight × reps) */
  volume: number
  /** Nombre de sets dans la semaine */
  setCount: number
}

export type VolumeTrend = 'increasing' | 'decreasing' | 'stable'

export interface VolumeForecast {
  /** Prédiction pour la semaine prochaine */
  predictedVolume: number
  /** Borne basse (predicted - stdDev) */
  lowerBound: number
  /** Borne haute (predicted + stdDev) */
  upperBound: number
  /** Tendance */
  trend: VolumeTrend
  /** Pente de la régression (kg/semaine) */
  trendSlope: number
  /** Semaine en cours : volume réalisé */
  currentWeekVolume: number
  /** Semaine en cours : volume projeté (réalisé + avg/jour × jours restants) */
  currentWeekProjected: number
  /** Jour de la semaine en cours (1=lundi, 7=dimanche) */
  currentWeekDay: number
  /** Historique des 8 dernières semaines */
  weeklyHistory: WeeklyVolume[]
  /** Pace mensuel */
  monthlyPace: {
    /** Volume du mois en cours (réalisé) */
    current: number
    /** Projection fin de mois */
    projected: number
    /** Moyenne mensuelle sur les données */
    average: number
  }
}

// ─── Helpers internes ────────────────────────────────────────────────────────

/** Retourne le lundi 00:00:00 de la semaine contenant `date` */
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=dimanche
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Clé de semaine pour grouper (ISO string du lundi) */
function weekKey(date: Date): string {
  return getMonday(date).toISOString().slice(0, 10)
}

/** Moyenne pondérée : S-1 poids 4, S-2 poids 3, S-3 poids 2, S-4..S-8 poids 1 */
function weightedAverage(volumes: number[]): number {
  // volumes[0] = semaine la plus ancienne, volumes[last] = semaine la plus récente
  const n = volumes.length
  const weights = volumes.map((_, i) => {
    const recency = n - i // 1 pour la plus ancienne, n pour la plus récente
    if (recency === 1) return 4
    if (recency === 2) return 3
    if (recency === 3) return 2
    return 1
  })
  // Inverser : la dernière semaine (index n-1) doit avoir le poids le plus élevé
  // recency = n - i : i=0 → recency=n (plus ancien ≠ plus récent)
  // Corrigeons : index 0 = plus ancien, index n-1 = plus récent (S-1)
  const correctedWeights = volumes.map((_, i) => {
    const distFromEnd = n - 1 - i // 0 = S-1 (plus récent)
    if (distFromEnd === 0) return 4 // S-1
    if (distFromEnd === 1) return 3 // S-2
    if (distFromEnd === 2) return 2 // S-3
    return 1 // S-4..S-8
  })
  const totalWeight = correctedWeights.reduce((s, w) => s + w, 0)
  const weightedSum = volumes.reduce((s, v, i) => s + v * correctedWeights[i], 0)
  return weightedSum / totalWeight
}

/** Écart-type */
function stdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/** Régression linéaire simple : retourne la pente */
function linearSlope(values: number[]): number {
  const n = values.length
  if (n <= 1) return 0
  const meanX = (n - 1) / 2
  const meanY = values.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY)
    den += (i - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

// ─── Fonction principale ─────────────────────────────────────────────────────

export function computeVolumeForecast(sets: WorkoutSet[]): VolumeForecast | null {
  if (sets.length === 0) return null

  const now = new Date()
  const currentMonday = getMonday(now)

  // 8 semaines avant la semaine courante
  const eightWeeksAgo = new Date(currentMonday)
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7)

  // Grouper les sets par semaine
  const weekMap = new Map<string, { volume: number; setCount: number; weekStart: Date }>()

  for (const set of sets) {
    const created = set.createdAt
    if (!created || created < eightWeeksAgo) continue

    const key = weekKey(created)
    const existing = weekMap.get(key)
    const vol = (set.weight ?? 0) * (set.reps ?? 0)

    if (existing) {
      existing.volume += vol
      existing.setCount += 1
    } else {
      weekMap.set(key, {
        volume: vol,
        setCount: 1,
        weekStart: getMonday(created),
      })
    }
  }

  // Séparer semaine courante des semaines passées
  const currentWeekKey = weekKey(now)
  const currentWeekData = weekMap.get(currentWeekKey)
  const currentWeekVolume = currentWeekData?.volume ?? 0

  // Semaines passées (exclure semaine courante), triées par date
  const pastWeeks: WeeklyVolume[] = []
  for (const [key, data] of weekMap) {
    if (key === currentWeekKey) continue
    pastWeeks.push({
      weekStart: data.weekStart,
      volume: data.volume,
      setCount: data.setCount,
    })
  }
  pastWeeks.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())

  // Il faut au moins 4 semaines de données passées
  if (pastWeeks.length < 4) return null

  // Limiter à 8 semaines max
  const recentWeeks = pastWeeks.slice(-8)
  const volumes = recentWeeks.map(w => w.volume)

  // Moyenne pondérée
  const predicted = weightedAverage(volumes)

  // Écart-type
  const simpleMean = volumes.reduce((s, v) => s + v, 0) / volumes.length
  const sd = stdDev(volumes, simpleMean)

  // Tendance via régression linéaire
  const slope = linearSlope(volumes)
  const trendPercent = simpleMean > 0 ? (slope / simpleMean) * 100 : 0
  const trend: VolumeTrend =
    trendPercent > 5 ? 'increasing' : trendPercent < -5 ? 'decreasing' : 'stable'

  // Projection semaine en cours
  const dayOfWeek = now.getDay()
  const currentDay = dayOfWeek === 0 ? 7 : dayOfWeek // 1=lundi, 7=dimanche
  const daysRemaining = 7 - currentDay
  const avgPerDay = currentDay > 0 ? currentWeekVolume / currentDay : 0
  const currentWeekProjected = currentWeekVolume + avgPerDay * daysRemaining

  // Pace mensuel
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysInMonth = monthEnd.getDate()
  const dayOfMonth = now.getDate()

  let currentMonthVolume = 0
  for (const set of sets) {
    const created = set.createdAt
    if (!created || created < monthStart || created > now) continue
    currentMonthVolume += (set.weight ?? 0) * (set.reps ?? 0)
  }

  const monthProjected = dayOfMonth > 0
    ? (currentMonthVolume / dayOfMonth) * daysInMonth
    : 0

  // Moyenne mensuelle basée sur les semaines passées
  const totalPastVolume = volumes.reduce((s, v) => s + v, 0)
  const totalPastWeeks = volumes.length
  const averageMonthly = totalPastWeeks > 0 ? (totalPastVolume / totalPastWeeks) * (30 / 7) : 0

  return {
    predictedVolume: Math.round(predicted),
    lowerBound: Math.round(Math.max(0, predicted - sd)),
    upperBound: Math.round(predicted + sd),
    trend,
    trendSlope: slope,
    currentWeekVolume: Math.round(currentWeekVolume),
    currentWeekProjected: Math.round(currentWeekProjected),
    currentWeekDay: currentDay,
    weeklyHistory: recentWeeks,
    monthlyPace: {
      current: Math.round(currentMonthVolume),
      projected: Math.round(monthProjected),
      average: Math.round(averageMonthly),
    },
  }
}
