import { useState } from 'react'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Program from '../model/models/Program'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import { isValidText } from '../model/utils/validationHelpers'
import { getNextPosition } from '../model/utils/databaseHelpers'

/**
 * useProgramManager - Hook pour gérer les opérations CRUD sur les programmes et sessions
 *
 * Encapsule la logique de création, modification et suppression de programmes/sessions.
 * Utilisé dans: HomeScreen
 *
 * @param onSuccess - Callback optionnel pour feedback haptique de succès
 * @returns États et fonctions pour gérer les programmes et sessions
 *
 * @example
 * const {
 *   // Program states
 *   programNameInput,
 *   setProgramNameInput,
 *   isRenamingProgram,
 *   setIsRenamingProgram,
 *   selectedProgram,
 *   setSelectedProgram,
 *   // Session states
 *   sessionNameInput,
 *   setSessionNameInput,
 *   isRenamingSession,
 *   setIsRenamingSession,
 *   selectedSession,
 *   setSelectedSession,
 *   targetProgram,
 *   setTargetProgram,
 *   // Operations
 *   saveProgram,
 *   duplicateProgram,
 *   deleteProgram,
 *   saveSession,
 *   duplicateSession,
 *   deleteSession,
 *   moveSession,
 * } = useProgramManager(haptics.onSuccess)
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

  /**
   * Crée ou renomme un programme
   * @returns true si succès, false sinon
   */
  const saveProgram = async (): Promise<boolean> => {
    if (!isValidText(programNameInput)) return false

    try {
      await database.write(async () => {
        if (isRenamingProgram && selectedProgram) {
          await selectedProgram.update((p) => {
            p.name = programNameInput.trim()
          })
        } else {
          const position = await getNextPosition('programs')
          await database.get<Program>('programs').create((p) => {
            p.name = programNameInput.trim()
            p.position = position
          })
        }
      })

      if (onSuccess) onSuccess()
      resetProgramForm()
      return true
    } catch (error) {
      console.error('Failed to save program:', error)
      return false
    }
  }

  /**
   * Duplique un programme
   * @returns true si succès, false sinon
   */
  const duplicateProgram = async (): Promise<boolean> => {
    if (!selectedProgram) return false

    try {
      await selectedProgram.duplicate()

      if (onSuccess) onSuccess()
      setSelectedProgram(null)
      return true
    } catch (error) {
      console.error('Failed to duplicate program:', error)
      return false
    }
  }

  /**
   * Supprime un programme et toutes ses sessions
   * @returns true si succès, false sinon
   */
  const deleteProgram = async (): Promise<boolean> => {
    if (!selectedProgram) return false

    try {
      await database.write(async () => {
        await selectedProgram.destroyPermanently()
      })

      setSelectedProgram(null)
      return true
    } catch (error) {
      console.error('Failed to delete program:', error)
      return false
    }
  }

  /**
   * Crée ou renomme une session
   * @returns true si succès, false sinon
   */
  const saveSession = async (): Promise<boolean> => {
    if (!isValidText(sessionNameInput)) return false

    try {
      await database.write(async () => {
        if (isRenamingSession && selectedSession) {
          await selectedSession.update((s) => {
            s.name = sessionNameInput.trim()
          })
        } else if (targetProgram) {
          const position = await getNextPosition(
            'sessions',
            Q.where('program_id', targetProgram.id)
          )
          await database.get<Session>('sessions').create((s) => {
            s.name = sessionNameInput.trim()
            s.program.set(targetProgram)
            s.position = position
          })
        }
      })

      if (onSuccess) onSuccess()
      resetSessionForm()
      return true
    } catch (error) {
      console.error('Failed to save session:', error)
      return false
    }
  }

  /**
   * Duplique une session avec tous ses exercices
   * @returns true si succès, false sinon
   */
  const duplicateSession = async (): Promise<boolean> => {
    if (!selectedSession) return false

    try {
      await database.write(async () => {
        const parent = await selectedSession.program.fetch()
        const position = await getNextPosition(
          'sessions',
          Q.where('program_id', selectedSession.program.id)
        )
        const newS = await database.get<Session>('sessions').create((s) => {
          s.name = `${selectedSession.name} (Copie)`
          s.position = position
          if (parent) s.program.set(parent)
        })

        const originalExos = await database
          .get<SessionExercise>('session_exercises')
          .query(Q.where('session_id', selectedSession.id))
          .fetch()

        for (const se of originalExos) {
          const exoRecord = await se.exercise.fetch()
          if (exoRecord) {
            await database.get<SessionExercise>('session_exercises').create((newSE) => {
              newSE.session.set(newS)
              newSE.exercise.set(exoRecord)
              newSE.position = se.position
              newSE.setsTarget = se.setsTarget
              newSE.repsTarget = se.repsTarget
              newSE.weightTarget = se.weightTarget
            })
          }
        }
      })

      if (onSuccess) onSuccess()
      setSelectedSession(null)
      return true
    } catch (error) {
      console.error('Failed to duplicate session:', error)
      return false
    }
  }

  /**
   * Supprime une session
   * @returns true si succès, false sinon
   */
  const deleteSession = async (): Promise<boolean> => {
    if (!selectedSession) return false

    try {
      await database.write(async () => {
        await selectedSession.destroyPermanently()
      })
      setSelectedSession(null)
      return true
    } catch (error) {
      console.error('Failed to delete session:', error)
      return false
    }
  }

  /**
   * Déplace une session vers un autre programme
   * @param targetProg - Programme de destination
   * @returns true si succès, false sinon
   */
  const moveSession = async (targetProg: Program): Promise<boolean> => {
    if (!selectedSession) return false

    try {
      await database.write(async () => {
        const position = await getNextPosition('sessions', Q.where('program_id', targetProg.id))
        await selectedSession.update((s) => {
          s.program.set(targetProg)
          s.position = position
        })
      })

      if (onSuccess) onSuccess()
      setSelectedSession(null)
      return true
    } catch (error) {
      console.error('Failed to move session:', error)
      return false
    }
  }

  /**
   * Réinitialise le formulaire de programme
   */
  const resetProgramForm = () => {
    setProgramNameInput('')
    setIsRenamingProgram(false)
    setSelectedProgram(null)
  }

  /**
   * Réinitialise le formulaire de session
   */
  const resetSessionForm = () => {
    setSessionNameInput('')
    setIsRenamingSession(false)
    setTargetProgram(null)
    setSelectedSession(null)
  }

  /**
   * Prépare le formulaire pour renommer un programme
   */
  const prepareRenameProgram = (program: Program) => {
    setSelectedProgram(program)
    setProgramNameInput(program.name)
    setIsRenamingProgram(true)
  }

  /**
   * Prépare le formulaire pour renommer une session
   */
  const prepareRenameSession = (session: Session) => {
    setSelectedSession(session)
    setSessionNameInput(session.name)
    setIsRenamingSession(true)
  }

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
