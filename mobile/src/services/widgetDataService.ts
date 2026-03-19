import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { requestWidgetUpdate } from 'react-native-android-widget'
import { Q } from '@nozbe/watermelondb'
import type { Database } from '@nozbe/watermelondb'
import type User from '../model/models/User'
import type History from '../model/models/History'
import type Session from '../model/models/Session'
import type SessionExercise from '../model/models/SessionExercise'
import { KoreWidget } from '../widgets/KoreWidget'

const WIDGET_DATA_KEY = '@kore_widget_data'

export interface WidgetData {
  streak: number
  streakTarget: number
  level: number
  nextWorkoutName: string | null
  nextWorkoutExerciseCount: number
  lastUpdated: number
}

export async function saveWidgetData(data: WidgetData): Promise<void> {
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data))
  await requestWidgetUpdate({
    widgetName: 'KoreWidget',
    renderWidget: () =>
      React.createElement(KoreWidget, {
        streak: data.streak,
        streakTarget: data.streakTarget,
        level: data.level,
        nextWorkoutName: data.nextWorkoutName,
        nextWorkoutExerciseCount: data.nextWorkoutExerciseCount,
      }),
    widgetNotFound: () => undefined,
  })
}

export async function loadWidgetData(): Promise<WidgetData | null> {
  const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as WidgetData
  } catch {
    return null
  }
}

export async function buildWidgetData(database: Database): Promise<WidgetData> {
  // Lire l'utilisateur courant
  const users = await database.get<User>('users').query().fetch()
  const user = users[0] ?? null
  const streak = user?.currentStreak ?? 0
  const streakTarget = user?.streakTarget ?? 3
  const level = user?.level ?? 1

  // Trouver la prochaine session
  const nextWorkout = await findNextWorkout(database)

  return {
    streak,
    streakTarget,
    level,
    nextWorkoutName: nextWorkout?.name ?? null,
    nextWorkoutExerciseCount: nextWorkout?.exerciseCount ?? 0,
    lastUpdated: Date.now(),
  }
}

interface NextWorkout {
  name: string
  exerciseCount: number
}

async function findNextWorkout(database: Database): Promise<NextWorkout | null> {
  // 1. Dernière history complétée (end_time IS NOT NULL, non supprimée, non abandonnée)
  const completedHistories = await database
    .get<History>('histories')
    .query(
      Q.where('end_time', Q.notEq(null)),
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
      Q.sortBy('end_time', Q.desc),
      Q.take(1),
    )
    .fetch()

  const lastHistory = completedHistories[0] ?? null

  if (lastHistory) {
    // 2. Session correspondante → program_id + position
    const sessions = await database
      .get<Session>('sessions')
      .query(Q.where('id', lastHistory.sessionId))
      .fetch()
    const lastSession = sessions[0] ?? null

    if (lastSession) {
      const programId = lastSession.programId
      const lastPosition = lastSession.position

      // 3. Sessions du même programme
      const programSessions = await database
        .get<Session>('sessions')
        .query(
          Q.where('program_id', programId),
          Q.where('deleted_at', null),
          Q.sortBy('position', Q.asc),
        )
        .fetch()

      if (programSessions.length > 0) {
        // Session suivante (modulo)
        const nextPosition = (lastPosition + 1) % programSessions.length
        const nextSession = programSessions.find(s => s.position === nextPosition)
          ?? programSessions[0]

        const exerciseCount = await database
          .get<SessionExercise>('session_exercises')
          .query(Q.where('session_id', nextSession.id))
          .fetchCount()

        return { name: nextSession.name, exerciseCount }
      }
    }
  }

  // 4. Fallback : première session du premier programme
  const allSessions = await database
    .get<Session>('sessions')
    .query(
      Q.where('deleted_at', null),
      Q.sortBy('position', Q.asc),
      Q.take(1),
    )
    .fetch()

  const firstSession = allSessions[0] ?? null
  if (!firstSession) return null

  const exerciseCount = await database
    .get<SessionExercise>('session_exercises')
    .query(Q.where('session_id', firstSession.id))
    .fetchCount()

  return { name: firstSession.name, exerciseCount }
}
