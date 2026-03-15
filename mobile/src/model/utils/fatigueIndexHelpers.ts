/**
 * fatigueIndexHelpers — Calcul de l'indice de fatigue basé sur l'ACWR simplifié
 * (Acute:Chronic Workload Ratio)
 *
 * Éphémère — aucune persistance DB, calculé à la volée.
 */

export type FatigueZone = 'recovery' | 'optimal' | 'reaching' | 'overreaching'

export interface FatigueResult {
  /** 0–100 (0 = repos total, 100 = surmenage max) */
  index: number
  zone: FatigueZone
  /** Volume des 7 derniers jours (kg) */
  weeklyVolume: number
  /** Moyenne hebdo sur 8 semaines (kg) */
  avgWeeklyVolume: number
  /** Ratio acute/chronic */
  ratio: number
  sessionsThisWeek: number
  avgSessionsPerWeek: number
  /** Clé i18n de la recommandation */
  recommendation: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function getTs(d: Date | number): number {
  return d instanceof Date ? d.getTime() : d
}

/**
 * Calcule l'indice de fatigue basé sur le ratio volume récent vs moyenne.
 * Utilise le modèle ACWR (Acute:Chronic Workload Ratio) simplifié.
 *
 * @param sets - Séries avec poids, répétitions et date
 * @param histories - Historiques de séances (soft-delete aware)
 */
export function computeFatigueIndex(
  sets: Array<{ weight: number; reps: number; createdAt: Date | number }>,
  histories: Array<{ createdAt: Date | number; deletedAt: Date | null; isAbandoned: boolean }>,
): FatigueResult {
  const now = Date.now()
  const sevenDaysAgo = now - WEEK_MS
  const eightWeeksAgo = now - 8 * WEEK_MS

  const activeHistories = histories.filter(h => h.deletedAt === null && !h.isAbandoned)
  const recentSets = sets.filter(s => getTs(s.createdAt) >= eightWeeksAgo)

  // ── Acute load : volume des 7 derniers jours ──
  const weeklyVolume = recentSets.reduce((sum, s) => {
    if (getTs(s.createdAt) >= sevenDaysAgo) {
      return sum + s.weight * s.reps
    }
    return sum
  }, 0)

  // ── Chronic load : volume moyen hebdo sur 8 semaines ──
  let totalVolume8Weeks = 0
  for (let w = 0; w < 8; w++) {
    const weekStart = now - (w + 1) * WEEK_MS
    const weekEnd = now - w * WEEK_MS
    for (const s of recentSets) {
      const ts = getTs(s.createdAt)
      if (ts >= weekStart && ts < weekEnd) {
        totalVolume8Weeks += s.weight * s.reps
      }
    }
  }
  const avgWeeklyVolume = totalVolume8Weeks / 8

  // ── Ratio ACWR ──
  const ratio = avgWeeklyVolume === 0 ? 0 : weeklyVolume / avgWeeklyVolume

  // ── Index : clamp(ratio × 50, 0, 100) ──
  const index = Math.min(Math.max(ratio * 50, 0), 100)

  // ── Zone ──
  let zone: FatigueZone
  if (ratio < 0.5) {
    zone = 'recovery'
  } else if (ratio < 1.3) {
    zone = 'optimal'
  } else if (ratio < 1.5) {
    zone = 'reaching'
  } else {
    zone = 'overreaching'
  }

  // ── Sessions cette semaine ──
  const sessionsThisWeek = activeHistories.filter(
    h => getTs(h.createdAt) >= sevenDaysAgo,
  ).length

  // ── Moyenne séances / semaine sur 8 semaines ──
  let totalSessions8Weeks = 0
  for (let w = 0; w < 8; w++) {
    const weekStart = now - (w + 1) * WEEK_MS
    const weekEnd = now - w * WEEK_MS
    totalSessions8Weeks += activeHistories.filter(h => {
      const ts = getTs(h.createdAt)
      return ts >= weekStart && ts < weekEnd
    }).length
  }
  const avgSessionsPerWeek = totalSessions8Weeks / 8

  return {
    index,
    zone,
    weeklyVolume,
    avgWeeklyVolume,
    ratio,
    sessionsThisWeek,
    avgSessionsPerWeek,
    recommendation: `home.fatigue.recommendations.${zone}`,
  }
}
