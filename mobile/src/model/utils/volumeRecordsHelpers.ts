import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import { getMondayOfWeek } from './dateHelpers'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VolumeRecord {
  type: 'session' | 'week' | 'month'
  recordVolume: number       // kg
  recordDate: Date
  currentVolume: number      // volume de la période en cours
  percentOfRecord: number    // 0-100+
  isNewRecord: boolean       // currentVolume > recordVolume
}

export interface VolumeRecordsResult {
  records: VolumeRecord[]
  totalLifetimeVolume: number
  avgSessionVolume: number
  avgWeeklyVolume: number
  recentTrend: 'up' | 'down' | 'stable'
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function toDate(d: Date | number): Date {
  return d instanceof Date ? d : new Date(d)
}

/** Monday-based ISO week key: "YYYY-WW" */
function getWeekKey(date: Date): string {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  // Adjust to Monday (day 1)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  // Use the year of the Monday to handle year boundaries correctly
  const mondayYear = d.getFullYear()
  const jan4 = new Date(mondayYear, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const jan4Monday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000)
  const weekNum = Math.round((d.getTime() - jan4Monday.getTime()) / (7 * 86400000)) + 1
  return `${mondayYear}-W${String(weekNum).padStart(2, '0')}`
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function computeVolumeRecords(
  histories: History[],
  sets: WorkoutSet[],
): VolumeRecordsResult {
  const emptyResult: VolumeRecordsResult = {
    records: [
      { type: 'session', recordVolume: 0, recordDate: new Date(), currentVolume: 0, percentOfRecord: 0, isNewRecord: false },
      { type: 'week', recordVolume: 0, recordDate: new Date(), currentVolume: 0, percentOfRecord: 0, isNewRecord: false },
      { type: 'month', recordVolume: 0, recordDate: new Date(), currentVolume: 0, percentOfRecord: 0, isNewRecord: false },
    ],
    totalLifetimeVolume: 0,
    avgSessionVolume: 0,
    avgWeeklyVolume: 0,
    recentTrend: 'stable',
  }

  if (histories.length === 0 || sets.length === 0) return emptyResult

  // Build set lookup by historyId
  const setsByHistory = new Map<string, WorkoutSet[]>()
  for (const s of sets) {
    const list = setsByHistory.get(s.historyId) || []
    list.push(s)
    setsByHistory.set(s.historyId, list)
  }

  // 1. Session volumes
  const sessionVolumes: Array<{ volume: number; date: Date }> = []
  let totalLifetimeVolume = 0

  for (const h of histories) {
    const hSets = setsByHistory.get(h.id) || []
    const vol = hSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0)
    const date = h.startTime ? toDate(h.startTime) : new Date()
    sessionVolumes.push({ volume: vol, date })
    totalLifetimeVolume += vol
  }

  // Sort by date ascending
  sessionVolumes.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Session record
  let bestSession = { volume: 0, date: new Date() }
  for (const sv of sessionVolumes) {
    if (sv.volume > bestSession.volume) {
      bestSession = sv
    }
  }
  const lastSession = sessionVolumes[sessionVolumes.length - 1]

  // 2. Week volumes
  const weekVolumes = new Map<string, { volume: number; date: Date }>()
  for (const sv of sessionVolumes) {
    const key = getWeekKey(sv.date)
    const existing = weekVolumes.get(key)
    if (existing) {
      existing.volume += sv.volume
    } else {
      weekVolumes.set(key, { volume: sv.volume, date: getMondayOfWeek(sv.date) })
    }
  }

  let bestWeek = { volume: 0, date: new Date() }
  for (const wv of weekVolumes.values()) {
    if (wv.volume > bestWeek.volume) {
      bestWeek = wv
    }
  }

  const now = new Date()
  const currentWeekKey = getWeekKey(now)
  const currentWeekVolume = weekVolumes.get(currentWeekKey)?.volume || 0

  // 3. Month volumes
  const monthVolumes = new Map<string, { volume: number; date: Date }>()
  for (const sv of sessionVolumes) {
    const key = getMonthKey(sv.date)
    const existing = monthVolumes.get(key)
    if (existing) {
      existing.volume += sv.volume
    } else {
      monthVolumes.set(key, { volume: sv.volume, date: new Date(sv.date.getFullYear(), sv.date.getMonth(), 1) })
    }
  }

  let bestMonth = { volume: 0, date: new Date() }
  for (const mv of monthVolumes.values()) {
    if (mv.volume > bestMonth.volume) {
      bestMonth = mv
    }
  }

  const currentMonthKey = getMonthKey(now)
  const currentMonthVolume = monthVolumes.get(currentMonthKey)?.volume || 0

  // Averages
  const avgSessionVolume = sessionVolumes.length > 0
    ? Math.round(totalLifetimeVolume / sessionVolumes.length)
    : 0

  const weekCount = weekVolumes.size
  const avgWeeklyVolume = weekCount > 0
    ? Math.round(totalLifetimeVolume / weekCount)
    : 0

  // 4. Recent trend: compare last 2 weeks vs 2 weeks before
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)
  const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000)

  let recentVolume = 0
  let previousVolume = 0
  for (const sv of sessionVolumes) {
    const t = sv.date.getTime()
    if (t >= twoWeeksAgo.getTime()) {
      recentVolume += sv.volume
    } else if (t >= fourWeeksAgo.getTime()) {
      previousVolume += sv.volume
    }
  }

  let recentTrend: 'up' | 'down' | 'stable' = 'stable'
  if (previousVolume > 0) {
    const diff = ((recentVolume - previousVolume) / previousVolume) * 100
    if (diff > 10) recentTrend = 'up'
    else if (diff < -10) recentTrend = 'down'
  } else if (recentVolume > 0) {
    recentTrend = 'up'
  }

  // Build records
  const currentSessionVolume = lastSession?.volume || 0

  function buildRecord(
    type: 'session' | 'week' | 'month',
    recordVol: number,
    recordDate: Date,
    currentVol: number,
  ): VolumeRecord {
    const pct = recordVol > 0 ? Math.round((currentVol / recordVol) * 100) : 0
    return {
      type,
      recordVolume: recordVol,
      recordDate,
      currentVolume: currentVol,
      percentOfRecord: pct,
      isNewRecord: currentVol > recordVol && recordVol > 0,
    }
  }

  return {
    records: [
      buildRecord('session', bestSession.volume, bestSession.date, currentSessionVolume),
      buildRecord('week', bestWeek.volume, bestWeek.date, currentWeekVolume),
      buildRecord('month', bestMonth.volume, bestMonth.date, currentMonthVolume),
    ],
    totalLifetimeVolume,
    avgSessionVolume,
    avgWeeklyVolume,
    recentTrend,
  }
}
