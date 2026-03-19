/**
 * Rep Max Estimator — Epley + Brzycki averaged
 * Pure helper, no DB dependency.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RepMaxFormulas {
  epley: number
  brzycki: number
}

export interface RepMaxEstimate {
  estimated1RM: number
  estimated3RM: number
  estimated5RM: number
  bestWeight: number
  bestReps: number
}

export interface RepMaxHistory {
  weekLabel: string
  estimated1RM: number
}

interface SetInput {
  weight: number
  reps: number
  createdAt?: Date
}

// ─── Sub-max multipliers ─────────────────────────────────────────────────────

const SUB_MAX_FACTORS: Record<string, number> = {
  '3RM': 0.93,
  '5RM': 0.87,
  '8RM': 0.80,
  '10RM': 0.75,
}

// ─── Core formulas ───────────────────────────────────────────────────────────

export function computeRepMax(weight: number, reps: number): RepMaxFormulas {
  if (reps <= 1) return { epley: weight, brzycki: weight }
  return {
    epley: weight * (1 + reps / 30),
    brzycki: weight * (36 / (37 - reps)),
  }
}

// ─── Best 1RM from a set list ────────────────────────────────────────────────

export function getBestRepMax(sets: SetInput[]): RepMaxEstimate | null {
  let best1RM = 0
  let bestWeight = 0
  let bestReps = 0

  for (const s of sets) {
    if (s.weight <= 0 || s.reps < 1 || s.reps > 15) continue
    const { epley, brzycki } = computeRepMax(s.weight, s.reps)
    const avg = (epley + brzycki) / 2
    if (avg > best1RM) {
      best1RM = avg
      bestWeight = s.weight
      bestReps = s.reps
    }
  }

  if (best1RM === 0) return null

  return {
    estimated1RM: Math.round(best1RM),
    estimated3RM: Math.round(best1RM * SUB_MAX_FACTORS['3RM']),
    estimated5RM: Math.round(best1RM * SUB_MAX_FACTORS['5RM']),
    bestWeight,
    bestReps,
  }
}

// ─── Weekly 1RM history (last 12 weeks) ──────────────────────────────────────

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dayOfWeek = d.getDay()
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

export function getRepMaxHistory(sets: SetInput[]): RepMaxHistory[] {
  const weekMap = new Map<string, number>()

  for (const s of sets) {
    if (s.weight <= 0 || s.reps < 1 || s.reps > 15 || !s.createdAt) continue
    const { epley, brzycki } = computeRepMax(s.weight, s.reps)
    const avg = (epley + brzycki) / 2
    const key = getWeekKey(s.createdAt)
    const current = weekMap.get(key) ?? 0
    if (avg > current) weekMap.set(key, avg)
  }

  return [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([weekLabel, estimated1RM]) => ({
      weekLabel,
      estimated1RM: Math.round(estimated1RM),
    }))
}

// ─── Sub-max estimates ───────────────────────────────────────────────────────

export function getSubMaxEstimates(oneRepMax: number): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, factor] of Object.entries(SUB_MAX_FACTORS)) {
    result[key] = Math.round(oneRepMax * factor)
  }
  return result
}
