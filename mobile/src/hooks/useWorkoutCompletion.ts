/**
 * useWorkoutCompletion — Orchestre la fin de séance :
 * complète l'historique, calcule XP/tonnage/streak/badges, construit le récap.
 */

import { useCallback, useRef } from 'react'
import { Q } from '@nozbe/watermelondb'
import { database } from '../model/index'
import History from '../model/models/History'
import SetModel from '../model/models/Set'
import UserBadge from '../model/models/UserBadge'
import User from '../model/models/User'
import SessionExercise from '../model/models/SessionExercise'
import {
  completeWorkoutHistory,
  buildRecapExercises,
  getLastSessionVolume,
} from '../model/utils/databaseHelpers'
import { DAY_MS } from '../model/constants'
import {
  calculateSessionXP,
  calculateSessionTonnage,
  calculateLevel,
  updateStreak,
  getCurrentISOWeek,
  detectMilestones,
  type MilestoneEvent,
} from '../model/utils/gamificationHelpers'
import { checkBadges, type CheckBadgesParams } from '../model/utils/badgeHelpers'
import { type BadgeDefinition } from '../model/utils/badgeConstants'
import type { ValidatedSetData, RecapExerciseData, RecapComparisonData } from '../types/workout'

export interface WorkoutCompletionResult {
  durationSeconds: number
  sessionXPGained: number
  newLevel: number
  newStreak: number
  milestones: MilestoneEvent[]
  newBadges: BadgeDefinition[]
  recapExercises: RecapExerciseData[]
  recapComparison: RecapComparisonData
}

interface UseWorkoutCompletionParams {
  historyId: string
  historyRef: React.MutableRefObject<History | null>
  startTimestamp: number
  user: User | null
  completedSets: number
  totalSetsTarget: number
  totalPrs: number
  validatedSets: Record<string, ValidatedSetData>
  sessionExercises: SessionExercise[]
  sessionId: string
  totalVolume: number
  isMountedRef: React.MutableRefObject<boolean>
}

/** Timestamp du début de la semaine ISO. */
function getWeekStartTimestamp(isoWeek: string): number {
  const [yearStr, weekStr] = isoWeek.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(weekStr, 10)
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const mondayWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * DAY_MS)
  const target = new Date(mondayWeek1.getTime() + (week - 1) * 7 * DAY_MS)
  return target.getTime()
}

/** Nombre total de séances (histories non supprimées). */
async function getTotalSessionCount(): Promise<number> {
  return database
    .get<History>('histories')
    .query(Q.where('deleted_at', null))
    .fetchCount()
}

export function useWorkoutCompletion(params: UseWorkoutCompletionParams) {
  const paramsRef = useRef(params)
  paramsRef.current = params

  const completeWorkout = useCallback(async (): Promise<WorkoutCompletionResult | null> => {
    const {
      historyId, historyRef, startTimestamp, user, completedSets,
      totalSetsTarget, totalPrs, validatedSets, sessionExercises,
      sessionId, totalVolume, isMountedRef,
    } = paramsRef.current

    const now = Date.now()
    const durationSeconds = Math.floor((now - startTimestamp) / 1000)
    const activeHistoryId = historyRef.current?.id || historyId

    if (activeHistoryId) {
      await completeWorkoutHistory(activeHistoryId, now).catch(e => {
        if (__DEV__) console.error('[useWorkoutCompletion] completeWorkoutHistory:', e)
      })
    }

    let sessionXPGained = 0
    let newLevel = 1
    let newStreak = 0
    let milestones: MilestoneEvent[] = []
    let newBadges: BadgeDefinition[] = []

    // ── Gamification ──
    if (user && completedSets > 0) {
      try {
        const setsArray = Object.values(validatedSets).map(s => ({
          weight: s.weight,
          reps: s.reps,
        }))
        const sessionTonnage = calculateSessionTonnage(setsArray)
        const isComplete = completedSets >= totalSetsTarget
        const sessionXP = calculateSessionXP(totalPrs, isComplete)
        const newTotalXp = (user.totalXp || 0) + sessionXP
        newLevel = calculateLevel(newTotalXp)
        const newTotalTonnage = (user.totalTonnage || 0) + sessionTonnage

        const currentWeek = getCurrentISOWeek()
        const weekStart = getWeekStartTimestamp(currentWeek)
        const weekSessionCount = await database
          .get<History>('histories')
          .query(
            Q.where('deleted_at', null),
            Q.where('start_time', Q.gte(weekStart)),
          )
          .fetchCount()
        if (!isMountedRef.current) return null

        const streakResult = updateStreak(
          user.lastWorkoutWeek,
          user.currentStreak || 0,
          user.bestStreak || 0,
          user.streakTarget || 3,
          weekSessionCount,
          currentWeek,
        )

        const totalSessionCount = await getTotalSessionCount()
        const before = {
          totalSessions: totalSessionCount - 1,
          totalTonnage: user.totalTonnage || 0,
          level: user.level || 1,
        }

        const newTotalPrs = (user.totalPrs || 0) + totalPrs
        const newBestStreak = Math.max(streakResult.bestStreak, streakResult.currentStreak)

        const distinctResult = await database.get<SetModel>('sets')
          .query(Q.unsafeSqlQuery(
            'SELECT COUNT(DISTINCT s.exercise_id) as count FROM sets s ' +
            'INNER JOIN histories h ON s.history_id = h.id WHERE h.deleted_at IS NULL'
          ))
          .unsafeFetchRaw()
        const rawCount = (distinctResult[0] as Record<string, unknown> | undefined)
        const distinctExerciseCount = typeof rawCount?.count === 'number' ? rawCount.count : 0

        const existingBadgeRecords = await database.get<UserBadge>('user_badges').query().fetch()
        if (!isMountedRef.current) return null
        const existingBadgeIds = existingBadgeRecords.map(b => b.badgeId)

        const badgeParams: CheckBadgesParams = {
          user: {
            totalTonnage: newTotalTonnage,
            bestStreak: newBestStreak,
            level: newLevel,
            totalPrs: newTotalPrs,
          },
          existingBadgeIds,
          sessionCount: totalSessionCount,
          sessionVolume: sessionTonnage,
          distinctExerciseCount,
        }
        const detectedBadges = checkBadges(badgeParams)

        await database.write(async () => {
          await user.update(u => {
            u.totalXp = newTotalXp
            u.level = newLevel
            u.totalTonnage = newTotalTonnage
            u.currentStreak = streakResult.currentStreak
            u.bestStreak = streakResult.bestStreak
            u.lastWorkoutWeek = streakResult.lastWorkoutWeek
            u.totalPrs = newTotalPrs
          })
          for (const badge of detectedBadges) {
            await database.get<UserBadge>('user_badges').create(record => {
              record.badgeId = badge.id
              record.unlockedAt = new Date()
            })
          }
        })
        if (!isMountedRef.current) return null

        sessionXPGained = sessionXP
        newStreak = streakResult.currentStreak

        const after = {
          totalSessions: before.totalSessions + 1,
          totalTonnage: newTotalTonnage,
          level: newLevel,
        }
        milestones = detectMilestones(before, after)
        newBadges = detectedBadges
      } catch (e) {
        if (__DEV__) console.error('[useWorkoutCompletion] gamification update:', e)
      }
    }

    // ── Récap enrichi ──
    let recapExercises: RecapExerciseData[] = []
    let recapComparison: RecapComparisonData = { prevVolume: null, currVolume: 0, volumeGain: 0 }
    try {
      const recap = await buildRecapExercises(sessionExercises, validatedSets, historyId)
      const prevVol = await getLastSessionVolume(sessionId, historyId)
      if (!isMountedRef.current) return null
      recapExercises = recap
      recapComparison = {
        prevVolume: prevVol,
        currVolume: totalVolume,
        volumeGain: prevVol !== null ? totalVolume - prevVol : 0,
      }
    } catch (e) {
      if (__DEV__) console.error('[useWorkoutCompletion] buildRecapExercises:', e)
    }

    return {
      durationSeconds,
      sessionXPGained,
      newLevel,
      newStreak,
      milestones,
      newBadges,
      recapExercises,
      recapComparison,
    }
  }, [])

  return { completeWorkout }
}
