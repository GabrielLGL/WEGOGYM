import { useState, useCallback } from 'react'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import { toDateKey } from '../model/utils/statsHelpers'
import { useLanguage } from '../contexts/LanguageContext'
import type History from '../model/models/History'
import type Session from '../model/models/Session'
import type Program from '../model/models/Program'
import type SetModel from '../model/models/Set'
import type Exercise from '../model/models/Exercise'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayCell {
  dateKey: string
  date: Date
  dayNumber: number
  count: number
  isFuture: boolean
  isCurrentMonth: boolean
}

export interface WeekRow {
  days: DayCell[]
}

export interface SetDetail {
  setOrder: number
  weight: number
  reps: number
  isPr: boolean
}

export interface ExerciseDetail {
  exerciseName: string
  sets: SetDetail[]
}

export interface SessionBlock {
  historyId: string
  programName: string
  sessionName: string
  durationMin: number | null
  exercises: ExerciseDetail[]
}

export interface DayDetail {
  dateKey: string
  label: string
  count: number
  sessions: SessionBlock[]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCalendarDayDetail(histories: History[], locale: string) {
  const { t } = useLanguage()
  const [detail, setDetail] = useState<DayDetail | null>(null)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())

  const toggleBlock = useCallback((historyId: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(historyId)) {
        next.delete(historyId)
      } else {
        next.add(historyId)
      }
      return next
    })
  }, [])

  const clearDetail = useCallback(() => {
    setDetail(null)
  }, [])

  const handleDayPress = useCallback(async (day: DayCell) => {
    if (day.isFuture || !day.isCurrentMonth) return

    if (detail?.dateKey === day.dateKey) {
      setDetail(null)
      return
    }

    const label = day.date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    if (day.count === 0) {
      setExpandedBlocks(new Set())
      setDetail({ dateKey: day.dateKey, label, count: 0, sessions: [] })
      return
    }

    try {
      // 1. Filter histories for this day (already in memory)
      const dayHistories = histories.filter(
        h => h.deletedAt === null && toDateKey(h.startTime) === day.dateKey
      )

      const historyIds = dayHistories.map(h => h.id)

      // 2. Batch fetch sessions (1 query) — using typed FK
      const sessionIds = dayHistories
        .map(h => h.sessionId)
        .filter(Boolean)
      const uniqueSessionIds = [...new Set(sessionIds)]

      const sessionsCollection = database.get<Session>('sessions')
      const allSessions = uniqueSessionIds.length > 0
        ? await sessionsCollection.query(Q.where('id', Q.oneOf(uniqueSessionIds))).fetch()
        : []
      const sessionMap = new Map(allSessions.map(s => [s.id, s]))

      // 3. Batch fetch programs (1 query) — using typed FK
      const programIds = allSessions
        .map(s => s.programId)
        .filter(Boolean)
      const uniqueProgramIds = [...new Set(programIds)]

      const programsCollection = database.get<Program>('programs')
      const allPrograms = uniqueProgramIds.length > 0
        ? await programsCollection.query(Q.where('id', Q.oneOf(uniqueProgramIds))).fetch()
        : []
      const programMap = new Map(allPrograms.map(p => [p.id, p]))

      // 4. Batch fetch sets (1 query)
      const setsCollection = database.get<SetModel>('sets')
      const allSets = historyIds.length > 0
        ? await setsCollection.query(Q.where('history_id', Q.oneOf(historyIds))).fetch()
        : []

      // Group sets by history_id — using typed FK
      const setsByHistory = new Map<string, SetModel[]>()
      for (const s of allSets) {
        const hId = s.historyId
        const arr = setsByHistory.get(hId)
        if (arr) {
          arr.push(s)
        } else {
          setsByHistory.set(hId, [s])
        }
      }

      // 5. Batch fetch exercises (1 query) — using typed FK
      const exerciseIds = allSets
        .map(s => s.exerciseId)
        .filter(Boolean)
      const uniqueExerciseIds = [...new Set(exerciseIds)]

      const exercisesCollection = database.get<Exercise>('exercises')
      const allExercises = uniqueExerciseIds.length > 0
        ? await exercisesCollection.query(Q.where('id', Q.oneOf(uniqueExerciseIds))).fetch()
        : []
      const exerciseMap = new Map(allExercises.map(e => [e.id, e]))

      // 6. Build results using Map lookups — using typed FKs
      const sessionBlocks: SessionBlock[] = dayHistories.map(h => {
        let programName = ''
        let sessionName = ''

        const session = h.sessionId ? sessionMap.get(h.sessionId) : undefined
        if (session) {
          if (session.name) sessionName = session.name
          const program = session.programId ? programMap.get(session.programId) : undefined
          if (program?.name) programName = program.name
        }

        // Duration
        let durationMin: number | null = null
        if (h.endTime) {
          const mins = Math.round(
            (h.endTime.getTime() - h.startTime.getTime()) / 60000
          )
          if (mins > 0) durationMin = mins
        }

        // Group sets by exercise — using typed FK
        const historySets = setsByHistory.get(h.id) ?? []
        const exDetailMap = new Map<string, ExerciseDetail>()

        for (const s of historySets) {
          const ex = s.exerciseId ? exerciseMap.get(s.exerciseId) : undefined
          const exName = ex?.name ?? t.statsDuration.unknownExercise

          let exDetail = exDetailMap.get(exName)
          if (!exDetail) {
            exDetail = { exerciseName: exName, sets: [] }
            exDetailMap.set(exName, exDetail)
          }
          exDetail.sets.push({
            setOrder: s.setOrder,
            weight: s.weight,
            reps: s.reps,
            isPr: s.isPr,
          })
        }

        const exercises: ExerciseDetail[] = []
        exDetailMap.forEach(exDetail => {
          exDetail.sets.sort((a, b) => a.setOrder - b.setOrder)
          exercises.push(exDetail)
        })

        return { historyId: h.id, programName, sessionName, durationMin, exercises }
      })

      setExpandedBlocks(new Set())
      setDetail({
        dateKey: day.dateKey,
        label,
        count: day.count,
        sessions: sessionBlocks,
      })
    } catch (e) {
      if (__DEV__) console.error('[useCalendarDayDetail] handleDayPress error', e)
    }
  }, [detail, histories, locale, t])

  return {
    detail,
    expandedBlocks,
    handleDayPress,
    toggleBlock,
    clearDetail,
  }
}
