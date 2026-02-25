/**
 * Helpers de gamification — XP, niveaux, streak, tonnage, milestones.
 *
 * Calibrage : niveau 100 atteignable en ~500 seances (~3 ans a 3x/semaine).
 */

// ─── Constantes XP ──────────────────────────────────────────────────────────

export const BASE_XP_PER_SESSION = 80
export const BONUS_XP_PER_PR = 20
export const BONUS_XP_COMPLETION = 15

/**
 * Formule lineaire : xpForLevel(N) = 80 + 7*N pour N >= 2.
 * Total cumule pour niveau 100 ≈ 43 263 XP.
 * A 80 XP/seance (base) = ~541 seances (~3.5 ans a 3x/sem).
 * A 95 XP/seance (avec bonus) = ~455 seances (~2.9 ans).
 */
const XP_LEVEL_BASE = 80
const XP_LEVEL_SLOPE = 7

// ─── Constantes Milestones ──────────────────────────────────────────────────

export const SESSION_MILESTONES = [10, 25, 50, 100, 250, 500] as const
export const TONNAGE_MILESTONES_KG = [10_000, 50_000, 100_000, 500_000, 1_000_000] as const

// ─── XP & Niveaux ───────────────────────────────────────────────────────────

/** XP requis pour passer du niveau `level-1` au niveau `level`. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return XP_LEVEL_BASE + XP_LEVEL_SLOPE * level
}

/** XP cumule total requis pour atteindre le niveau `level`. */
export function xpCumulativeForLevel(level: number): number {
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += xpForLevel(i)
  }
  return total
}

/** Calcule le niveau actuel depuis le total XP accumule. */
export function calculateLevel(totalXp: number): number {
  let level = 1
  let cumulative = 0
  while (level < 100) {
    const nextRequired = xpForLevel(level + 1)
    if (cumulative + nextRequired > totalXp) break
    cumulative += nextRequired
    level++
  }
  return level
}

/** Progression vers le prochain niveau. */
export function xpToNextLevel(totalXp: number, currentLevel: number): {
  current: number
  required: number
  percentage: number
} {
  if (currentLevel >= 100) {
    return { current: 0, required: 0, percentage: 100 }
  }
  const cumulativeForCurrent = xpCumulativeForLevel(currentLevel)
  const required = xpForLevel(currentLevel + 1)
  const current = totalXp - cumulativeForCurrent
  const percentage = required > 0 ? Math.min(Math.floor((current / required) * 100), 100) : 0
  return { current, required, percentage }
}

/** XP gagne pour une seance. */
export function calculateSessionXP(prCount: number, isComplete: boolean): number {
  return BASE_XP_PER_SESSION
    + (prCount * BONUS_XP_PER_PR)
    + (isComplete ? BONUS_XP_COMPLETION : 0)
}

// ─── Streak ─────────────────────────────────────────────────────────────────

/** Retourne la semaine ISO courante au format "YYYY-Www". */
export function getCurrentISOWeek(now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  // Ajuster au jeudi de la semaine (ISO 8601)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

/** Retourne la semaine ISO precedente. */
export function getPreviousISOWeek(isoWeek: string): string {
  const [yearStr, weekStr] = isoWeek.split('-W')
  let year = parseInt(yearStr, 10)
  let week = parseInt(weekStr, 10)
  week--
  if (week < 1) {
    year--
    // Nombre de semaines ISO dans l'annee precedente
    const dec28 = new Date(Date.UTC(year, 11, 28))
    const dayOfDec28 = dec28.getUTCDay() || 7
    dec28.setUTCDate(dec28.getUTCDate() + 4 - dayOfDec28)
    const yearStart = new Date(Date.UTC(dec28.getUTCFullYear(), 0, 1))
    week = Math.ceil((((dec28.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }
  return `${year}-W${String(week).padStart(2, '0')}`
}

export interface StreakResult {
  currentStreak: number
  bestStreak: number
  lastWorkoutWeek: string
}

/**
 * Met a jour le streak hebdomadaire.
 *
 * Appelee en fin de seance. Verifie si la semaine courante est complete
 * (sessions >= target) et met a jour le streak en consequence.
 */
export function updateStreak(
  lastWorkoutWeek: string | null,
  currentStreak: number,
  bestStreak: number,
  streakTarget: number,
  currentWeekSessions: number,
  currentISOWeek: string,
): StreakResult {
  // Semaine deja evaluee cette semaine → pas de changement
  if (lastWorkoutWeek === currentISOWeek) {
    return { currentStreak, bestStreak, lastWorkoutWeek: currentISOWeek }
  }

  // L'objectif de la semaine n'est pas encore atteint
  if (currentWeekSessions < streakTarget) {
    return { currentStreak, bestStreak, lastWorkoutWeek: lastWorkoutWeek ?? currentISOWeek }
  }

  // Objectif atteint cette semaine !
  const previousWeek = getPreviousISOWeek(currentISOWeek)
  let newStreak: number

  if (lastWorkoutWeek === previousWeek) {
    // Semaine precedente validee → continuer le streak
    newStreak = currentStreak + 1
  } else if (lastWorkoutWeek === null) {
    // Premiere semaine → demarrer le streak
    newStreak = 1
  } else {
    // Semaine(s) manquee(s) → reset et demarrer a 1
    newStreak = 1
  }

  return {
    currentStreak: newStreak,
    bestStreak: Math.max(bestStreak, newStreak),
    lastWorkoutWeek: currentISOWeek,
  }
}

// ─── Tonnage ────────────────────────────────────────────────────────────────

/** Calcule le tonnage d'une seance (somme poids × reps). */
export function calculateSessionTonnage(
  sets: ReadonlyArray<{ weight: number; reps: number }>
): number {
  return sets.reduce((total, s) => total + s.weight * s.reps, 0)
}

/** Formate un tonnage en string lisible. */
export function formatTonnage(totalKg: number): string {
  if (totalKg >= 1000) {
    return `${(totalKg / 1000).toFixed(1)} t`
  }
  return `${Math.round(totalKg)} kg`
}

// ─── Milestones ─────────────────────────────────────────────────────────────

export interface MilestoneEvent {
  type: 'session' | 'tonnage' | 'levelup'
  value: number
  emoji: string
  title: string
  message: string
}

interface MilestoneState {
  totalSessions: number
  totalTonnage: number
  level: number
}

const SESSION_MILESTONE_DATA: Record<number, { emoji: string; message: string }> = {
  10: { emoji: '\uD83D\uDCAA', message: 'Tu as pris le rythme.' },
  25: { emoji: '\uD83D\uDD25', message: 'Un quart de centenaire.' },
  50: { emoji: '\u2B50', message: 'Tu es un habitue.' },
  100: { emoji: '\uD83C\uDFC6', message: 'Niveau dedicace.' },
  250: { emoji: '\uD83D\uDC51', message: 'Force et perseverance.' },
  500: { emoji: '\uD83E\uDDBE', message: 'Legendaire.' },
}

const TONNAGE_MILESTONE_DATA: Record<number, { emoji: string; message: string }> = {
  10_000: { emoji: '\uD83C\uDFD7\uFE0F', message: 'Ca commence a compter.' },
  50_000: { emoji: '\uD83D\uDE97', message: 'Le poids d\'un camion.' },
  100_000: { emoji: '\uD83C\uDFE0', message: 'Le poids d\'une maison.' },
  500_000: { emoji: '\u2708\uFE0F', message: 'Le poids d\'un avion.' },
  1_000_000: { emoji: '\uD83D\uDE80', message: 'Interstellaire.' },
}

/** Detecte les milestones franchis entre deux etats. */
export function detectMilestones(
  before: MilestoneState,
  after: MilestoneState,
): MilestoneEvent[] {
  const events: MilestoneEvent[] = []

  // Level-up
  if (after.level > before.level) {
    events.push({
      type: 'levelup',
      value: after.level,
      emoji: '\u2B50',
      title: `Niveau ${after.level} !`,
      message: 'Continue comme ca, tu progresses !',
    })
  }

  // Session milestones
  for (const threshold of SESSION_MILESTONES) {
    if (before.totalSessions < threshold && after.totalSessions >= threshold) {
      const data = SESSION_MILESTONE_DATA[threshold]
      events.push({
        type: 'session',
        value: threshold,
        emoji: data.emoji,
        title: `${threshold} seances !`,
        message: data.message,
      })
    }
  }

  // Tonnage milestones
  for (const threshold of TONNAGE_MILESTONES_KG) {
    if (before.totalTonnage < threshold && after.totalTonnage >= threshold) {
      const data = TONNAGE_MILESTONE_DATA[threshold]
      const displayTonnage = threshold >= 1000 ? `${threshold / 1000} tonnes` : `${threshold} kg`
      events.push({
        type: 'tonnage',
        value: threshold,
        emoji: data.emoji,
        title: `${displayTonnage} soulevees !`,
        message: data.message,
      })
    }
  }

  return events
}
