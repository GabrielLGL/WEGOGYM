/**
 * @future — Préparé pour les alertes de gamification (notifications de surentraînement).
 * Pas encore intégré dans l'UI. Importé uniquement par son fichier de test.
 */
import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import { DAY_MS, WEEK_MS } from '../constants'

export type OvertrainingSignal =
  | 'no_rest_7days'        // aucun écart de 2 jours consécutifs sur 14 jours
  | 'volume_spike_3weeks'  // volume 3 dernières semaines > 150% des 3 semaines précédentes
  | 'high_frequency'       // > 7 séances sur les 7 derniers jours
  | null

export interface OvertrainingData {
  signal: OvertrainingSignal
  /** La valeur numérique pertinente : nombre de séances, jours consécutifs, ou ratio en % */
  detail: number
}

/**
 * Détecte les signaux de surentraînement à partir de l'historique et des séries.
 * Retourne null si les données sont insuffisantes (< 10 séances).
 *
 * Priorité des signaux : high_frequency > no_rest_7days > volume_spike_3weeks
 */
export function computeOvertrainingAlert(
  histories: History[],
  sets: WorkoutSet[],
): OvertrainingData | null {
  if (histories.length < 10) return null

  const now = Date.now()

  // Trier par startTime décroissant
  const sorted = [...histories].sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime(),
  )

  // ── Signal 1 : high_frequency ─────────────────────────────────────────────
  const sevenDaysAgo = now - WEEK_MS
  const recentCount = sorted.filter(h => h.startTime.getTime() >= sevenDaysAgo).length
  if (recentCount > 7) {
    return { signal: 'high_frequency', detail: recentCount }
  }

  // ── Signal 2 : no_rest_7days ──────────────────────────────────────────────
  const fourteenDaysAgo = now - 14 * DAY_MS
  const recentHistories = sorted.filter(h => h.startTime.getTime() >= fourteenDaysAgo)

  if (recentHistories.length >= 7) {
    const days = recentHistories.map(h => Math.floor(h.startTime.getTime() / DAY_MS))
    const uniqueDays = Array.from(new Set(days)).sort((a, b) => b - a)

    let hasRestGap = false
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      if (uniqueDays[i] - uniqueDays[i + 1] >= 2) {
        hasRestGap = true
        break
      }
    }

    if (!hasRestGap) {
      const consecutiveDays = (uniqueDays[0] ?? 0) - (uniqueDays[uniqueDays.length - 1] ?? 0) + 1
      return { signal: 'no_rest_7days', detail: consecutiveDays }
    }
  }

  // ── Signal 3 : volume_spike_3weeks ────────────────────────────────────────
  const historyDates = new Map(sorted.map(h => [h.id, h.startTime.getTime()]))

  let volumeRecent = 0
  let volumePrevious = 0

  const threeWeeksAgo = now - 3 * WEEK_MS
  const sixWeeksAgo = now - 6 * WEEK_MS

  for (const s of sets) {
    const ts = historyDates.get(s.history.id)
    if (ts === undefined) continue
    const tonnage = s.weight * s.reps
    if (ts >= threeWeeksAgo && ts < now) {
      volumeRecent += tonnage
    } else if (ts >= sixWeeksAgo && ts < threeWeeksAgo) {
      volumePrevious += tonnage
    }
  }

  if (volumePrevious > 0 && volumeRecent / volumePrevious > 1.5) {
    const ratio = Math.round((volumeRecent / volumePrevious) * 100)
    return { signal: 'volume_spike_3weeks', detail: ratio }
  }

  return null
}
