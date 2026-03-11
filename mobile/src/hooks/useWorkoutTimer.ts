import { useState, useEffect, useRef } from 'react'
import { formatSecondsToMMSS } from '../model/utils/parseUtils'

interface WorkoutTimerResult {
  elapsedSeconds: number
  formattedTime: string
}

/**
 * Hook de chronometre pour le mode seance en direct
 *
 * Calcule le temps ecoule depuis `startTimestamp` en evitant le drift
 * (meme pattern que RestTimer.tsx).
 *
 * @param startTimestamp - Date.now() au moment du lancement de la seance
 * @returns elapsedSeconds et formattedTime (MM:SS)
 *
 * @example
 * const { formattedTime } = useWorkoutTimer(startTimestampRef.current)
 */
export function useWorkoutTimer(startTimestamp: number): WorkoutTimerResult {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000)
      setElapsedSeconds(elapsed)
    }

    updateTimer()
    intervalRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startTimestamp])

  return {
    elapsedSeconds,
    formattedTime: formatSecondsToMMSS(elapsedSeconds),
  }
}
