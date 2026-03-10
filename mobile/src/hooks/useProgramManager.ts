import { useState, useCallback } from 'react'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Program from '../model/models/Program'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import { isValidText } from '../model/utils/validationHelpers'
import { getNextPosition } from '../model/utils/databaseHelpers'

/**
 * useProgramManager — Hook pour gérer les opérations CRUD sur les programmes et sessions
 *
 * Encapsule : création, renommage, duplication, suppression de programmes et sessions.
 * La duplication copie toutes les sessions, exercices et métadonnées (y compris les supersets
 * avec de nouveaux IDs pour éviter les conflits).
 * La suppression cascade : programme → sessions → session_exercises.
 *
 * Utilisé dans : ProgramsScreen, ProgramDetailScreen
 */
export function useProgramManager(onSuccess?: () => void) {
  // --- PROGRAM STATES ---
  const [programNameInput, setProgramNameInput] = useState('')
  const [isRenamingProgram, setIsRenamingProgram] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  // --- SESSION STATES ---
  const [sessionNameInput, setSessionNameInput] = useState('')
  const [isRenamingSession, setIsRenamingSession] = useState(false)
  const [targetProgram, setTargetProgram] = useState<Program | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const saveProgram = useCallback(async (): Promise<boolean> => {
    if (!isValidText(programNameInput)) return false

    try {
      const position = isRenamingProgram ? 0 : await getNextPosition('programs')
      await database.write(async () => {
        if (isRenamingProgram && selectedProgram) {
          await selectedProgram.update((p) => {
            p.name = programNameInput.trim()
          })
        } else {
          await database.get<Program>('programs').create((p) => {
            p.name = programNameInput.trim()
            p.position = position
          })
        }
      })

      if (onSuccess) onSuccess()
      setProgramNameInput('')
      setIsRenamingProgram(false)
      setSelectedProgram(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] saveProgram failed:', error)
      return false
    }
  }, [programNameInput, isRenamingProgram, selectedProgram, onSuccess])

  const duplicateProgram = useCallback(async (): Promise<boolean> => {
    if (!selectedProgram) return false

    try {
      await selectedProgram.duplicate()

      if (onSuccess) onSuccess()
      setSelectedProgram(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] duplicateProgram failed:', error)
      return false
    }
  }, [selectedProgram, onSuccess])

  /** Suppression en cascade : programme + toutes ses sessions + tous ses session_exercises */
  const deleteProgram = useCallback(async (): Promise<boolean> => {
    if (!selectedProgram) return false

    try {
      await database.write(async () => {
        const sessions = await selectedProgram.sessions.fetch()
        const sessionExercises = sessions.length > 0
          ? await database.get<SessionExercise>('session_exercises')
              .query(Q.where('session_id', Q.oneOf(sessions.map(s => s.id))))
              .fetch()
          : []
        await database.batch(
          ...sessionExercises.map(se => se.prepareDestroyPermanently()),
          ...sessions.map(s => s.prepareDestroyPermanently()),
          selectedProgram.prepareDestroyPermanently(),
        )
      })

      setSelectedProgram(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] deleteProgram failed:', error)
      return false
    }
  }, [selectedProgram])

  const saveSession = useCallback(async (): Promise<boolean> => {
    if (!isValidText(sessionNameInput)) return false

    try {
      const position = (!isRenamingSession && targetProgram)
        ? await getNextPosition('sessions', Q.where('program_id', targetProgram.id))
        : 0
      await database.write(async () => {
        if (isRenamingSession && selectedSession) {
          await selectedSession.update((s) => {
            s.name = sessionNameInput.trim()
          })
        } else if (targetProgram) {
          await database.get<Session>('sessions').create((s) => {
            s.name = sessionNameInput.trim()
            s.program.set(targetProgram)
            s.position = position
          })
        }
      })

      if (onSuccess) onSuccess()
      setSessionNameInput('')
      setIsRenamingSession(false)
      setTargetProgram(null)
      setSelectedSession(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] saveSession failed:', error)
      return false
    }
  }, [sessionNameInput, isRenamingSession, selectedSession, targetProgram, onSuccess])

  /** Duplique une session avec tous ses exercices (copie complète incluant supersets, notes, rest time) */
  const duplicateSession = useCallback(async (): Promise<boolean> => {
    if (!selectedSession) return false

    try {
      const parent = await selectedSession.program.fetch()
      const position = await getNextPosition(
        'sessions',
        Q.where('program_id', selectedSession.program.id)
      )
      const originalExos = await database
        .get<SessionExercise>('session_exercises')
        .query(Q.where('session_id', selectedSession.id))
        .fetch()
      const exoRecords = await Promise.all(originalExos.map((se) => se.exercise.fetch()))

      await database.write(async () => {
        const newS = await database.get<Session>('sessions').create((s) => {
          s.name = `${selectedSession.name} (Copie)`
          s.position = position
          if (parent) s.program.set(parent)
        })

        for (let i = 0; i < originalExos.length; i++) {
          const se = originalExos[i]
          const exoRecord = exoRecords[i]
          if (exoRecord) {
            await database.get<SessionExercise>('session_exercises').create((newSE) => {
              newSE.session.set(newS)
              newSE.exercise.set(exoRecord)
              newSE.position = se.position
              newSE.setsTarget = se.setsTarget
              newSE.setsTargetMax = se.setsTargetMax
              newSE.repsTarget = se.repsTarget
              newSE.weightTarget = se.weightTarget
              newSE.restTime = se.restTime
              newSE.notes = se.notes
              newSE.supersetId = se.supersetId
              newSE.supersetType = se.supersetType
              newSE.supersetPosition = se.supersetPosition
            })
          }
        }
      })

      if (onSuccess) onSuccess()
      setSelectedSession(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] duplicateSession failed:', error)
      return false
    }
  }, [selectedSession, onSuccess])

  const deleteSession = useCallback(async (): Promise<boolean> => {
    if (!selectedSession) return false

    try {
      await database.write(async () => {
        const sessionExercises = await selectedSession.sessionExercises.fetch()
        await database.batch(
          ...sessionExercises.map(se => se.prepareDestroyPermanently()),
          selectedSession.prepareDestroyPermanently(),
        )
      })
      setSelectedSession(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] deleteSession failed:', error)
      return false
    }
  }, [selectedSession])

  const moveSession = useCallback(async (targetProg: Program): Promise<boolean> => {
    if (!selectedSession) return false

    try {
      const position = await getNextPosition('sessions', Q.where('program_id', targetProg.id))
      await database.write(async () => {
        await selectedSession.update((s) => {
          s.program.set(targetProg)
          s.position = position
        })
      })

      if (onSuccess) onSuccess()
      setSelectedSession(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useProgramManager] moveSession failed:', error)
      return false
    }
  }, [selectedSession, onSuccess])

  const resetProgramForm = useCallback(() => {
    setProgramNameInput('')
    setIsRenamingProgram(false)
    setSelectedProgram(null)
  }, [])

  const resetSessionForm = useCallback(() => {
    setSessionNameInput('')
    setIsRenamingSession(false)
    setTargetProgram(null)
    setSelectedSession(null)
  }, [])

  const prepareRenameProgram = useCallback((program: Program) => {
    setSelectedProgram(program)
    setProgramNameInput(program.name)
    setIsRenamingProgram(true)
  }, [])

  const prepareRenameSession = useCallback((session: Session) => {
    setSelectedSession(session)
    setSessionNameInput(session.name)
    setIsRenamingSession(true)
  }, [])

  return {
    // Program states
    programNameInput,
    setProgramNameInput,
    isRenamingProgram,
    setIsRenamingProgram,
    selectedProgram,
    setSelectedProgram,

    // Session states
    sessionNameInput,
    setSessionNameInput,
    isRenamingSession,
    setIsRenamingSession,
    selectedSession,
    setSelectedSession,
    targetProgram,
    setTargetProgram,

    // Program operations
    saveProgram,
    duplicateProgram,
    deleteProgram,
    prepareRenameProgram,
    resetProgramForm,

    // Session operations
    saveSession,
    duplicateSession,
    deleteSession,
    moveSession,
    prepareRenameSession,
    resetSessionForm,
  }
}
