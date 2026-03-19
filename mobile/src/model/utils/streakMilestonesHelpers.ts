/**
 * streakMilestonesHelpers — Calcule les jalons de streak atteints et le prochain à débloquer.
 */

export interface Milestone {
  days: number
  label: string
  icon: string
  reached: boolean
}

export interface MilestonesResult {
  currentStreak: number
  milestones: Milestone[]
  nextMilestone: Milestone | null
  daysToNext: number
  progressToNext: number // 0-100
}

interface HistoryLike {
  startedAt: Date | number
  isAbandoned: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 200, 365] as const

const MILESTONE_ICONS: Record<number, string> = {
  3: '🔥',
  7: '⚡',
  14: '💪',
  30: '🏆',
  60: '🌟',
  100: '💎',
  200: '👑',
  365: '🏅',
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Calcule les milestones de streak.
 *
 * **Sémantique du streak** : nombre de jours calendrier uniques avec au moins
 * 1 séance non-abandonnée, dans une fenêtre consécutive où aucun gap ne
 * dépasse 1 jour de repos. Seuls les jours d'entraînement effectifs sont
 * comptés (un jour de repos toléré ne s'ajoute PAS au total).
 *
 * Exemple : sessions lundi, mercredi, jeudi → streak = 3 (pas 4).
 *
 * Algorithme :
 * 1. Collecte les jours uniques d'entraînement (startOfDay, locale)
 * 2. Itère en arrière depuis le jour le plus récent
 *    - Gap ≤ 2 × DAY_MS entre 2 jours consécutifs → streak++
 *    - Sinon → fin du streak
 * 3. Le streak n'est valide que s'il inclut aujourd'hui ou hier
 * 4. Pour chaque milestone : reached = currentStreak >= days
 * 5. nextMilestone = premier milestone non-atteint
 * 6. progressToNext = progression entre le dernier atteint et le prochain
 */
export function computeStreakMilestones(
  histories: HistoryLike[],
  labels: Record<number, string>,
): MilestonesResult {
  // Filter valid histories
  const valid = histories.filter(h => !h.isAbandoned)

  // Collect unique training days
  const daySet = new Set<number>()
  for (const h of valid) {
    const ts = typeof h.startedAt === 'number' ? h.startedAt : h.startedAt.getTime()
    daySet.add(startOfDay(ts))
  }

  const sortedDays = Array.from(daySet).sort((a, b) => a - b)

  // Compute current streak (allowing 1 rest day gap)
  const now = Date.now()
  const todayStart = startOfDay(now)
  let currentStreak = 0

  if (sortedDays.length > 0) {
    const lastDay = sortedDays[sortedDays.length - 1]
    // Streak must include today or yesterday
    if (lastDay === todayStart || lastDay === todayStart - DAY_MS) {
      let streak = 1
      for (let i = sortedDays.length - 2; i >= 0; i--) {
        const gap = sortedDays[i + 1] - sortedDays[i]
        if (gap <= 2 * DAY_MS) {
          // Gap ≤ 2 jours → tolérance 1 jour de repos, on compte ce jour d'entraînement
          streak++
        } else {
          break
        }
      }
      currentStreak = streak
    }
  }

  // Build milestones
  const milestones: Milestone[] = MILESTONE_DAYS.map(days => ({
    days,
    label: labels[days] ?? `${days}j`,
    icon: MILESTONE_ICONS[days] ?? '⭐',
    reached: currentStreak >= days,
  }))

  // Find next milestone
  const nextMilestone = milestones.find(m => !m.reached) ?? null
  const lastReachedDays = [...milestones].reverse().find(m => m.reached)?.days ?? 0
  const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0
  const range = nextMilestone ? nextMilestone.days - lastReachedDays : 1
  const progressToNext = nextMilestone
    ? Math.min(100, Math.max(0, Math.round(((currentStreak - lastReachedDays) / range) * 100)))
    : 100

  return {
    currentStreak,
    milestones,
    nextMilestone,
    daysToNext,
    progressToNext,
  }
}
