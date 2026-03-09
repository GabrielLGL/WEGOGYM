import { useState, useRef, useMemo, useCallback } from 'react'
import { PanResponder } from 'react-native'

const SWIPE_MIN_DX = 15
const SWIPE_MAX_DY = 40
const SWIPE_THRESHOLD = 50

export function useMonthNavigation(onMonthChange?: () => void) {
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(() => today.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => today.getMonth())

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const goToPrevMonth = useCallback(() => {
    onMonthChange?.()
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth(m => m - 1)
    }
  }, [viewMonth, onMonthChange])

  const goToNextMonth = useCallback(() => {
    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) return
    onMonthChange?.()
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth(m => m + 1)
    }
  }, [viewMonth, viewYear, today, onMonthChange])

  const goToToday = useCallback(() => {
    onMonthChange?.()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }, [today, onMonthChange])

  // Refs to avoid stale closures in PanResponder
  const navRef = useRef({ goToNextMonth, goToPrevMonth })
  navRef.current = { goToNextMonth, goToPrevMonth }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > SWIPE_MIN_DX && Math.abs(gs.dy) < SWIPE_MAX_DY,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          navRef.current.goToNextMonth()
        } else if (gs.dx > SWIPE_THRESHOLD) {
          navRef.current.goToPrevMonth()
        }
      },
    })
  ).current

  return {
    today,
    viewYear,
    viewMonth,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    panHandlers: panResponder.panHandlers,
  }
}
