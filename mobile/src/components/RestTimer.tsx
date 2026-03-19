import React, { useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native'
import { Audio } from 'expo-av'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import {
  scheduleRestEndNotification,
  cancelNotification,
} from '../services/notificationService'
import { createBeepSound } from '../utils/timerBeep'

const TIMER_INTERVAL_MS = 100
const HAPTIC_DELAY_1 = 400
const HAPTIC_DELAY_2 = 800
const AUTO_CLOSE_DELAY = 1000
const TIMER_ENTRY_OFFSET = 50
const TIMER_WARNING_THRESHOLD_S = 10
const TIMER_ANIM_DURATION = 200

interface Props {
  duration: number // en secondes
  onClose: () => void
  notificationEnabled?: boolean
  vibrationEnabled?: boolean // défaut true — triple vibration haptics à la fin
  soundEnabled?: boolean     // défaut true — beep 440Hz à la fin
}

/**
 * Composant Timer de repos automatique.
 * Désormais intégré au flux de la page pour ne pas chevaucher la liste.
 */
const RestTimer: React.FC<Props> = ({
  duration,
  onClose,
  notificationEnabled,
  vibrationEnabled = true,
  soundEnabled = true,
}) => {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const haptics = useHaptics()
  const [timeLeft, setTimeLeft] = useState(duration)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hapticTimer1Ref = useRef<NodeJS.Timeout | null>(null)
  const hapticTimer2Ref = useRef<NodeJS.Timeout | null>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number>(Date.now() + duration * 1000) // Heure de fin cible
  const animValue = useRef(new Animated.Value(TIMER_ENTRY_OFFSET)).current // Animation de montée légère
  const progressAnim = useRef(new Animated.Value(1)).current
  const notificationIdRef = useRef<string | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null)
  const isMountedRef = useRef(true)
  // Refs pour éviter les stale closures dans finishTimer (appelé depuis setInterval)
  const vibrationEnabledRef = useRef(vibrationEnabled)
  const soundEnabledRef = useRef(soundEnabled)

  useEffect(() => { vibrationEnabledRef.current = vibrationEnabled }, [vibrationEnabled])
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  useEffect(() => {
    if (notificationEnabled) {
      scheduleRestEndNotification(duration, t.settings.timer.notifTitle, t.settings.timer.notifBody)
        .then(id => {
          notificationIdRef.current = id
        })
        .catch(e => { if (__DEV__) console.warn('[RestTimer] scheduleRestEndNotification failed:', e) })
    }
    return () => {
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current)
        notificationIdRef.current = null
      }
    }
  }, [duration, notificationEnabled])

  // Cleanup son + marque le composant comme démonté
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (soundRef.current) {
        soundRef.current.unloadAsync()
        soundRef.current = null
      }
    }
  }, [])

  const entryAnimRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    // Animation d'entrée
    entryAnimRef.current = Animated.spring(animValue, { toValue: 0, useNativeDriver: true })
    entryAnimRef.current.start()

    // Barre de progression
    progressAnimRef.current = Animated.timing(progressAnim, { toValue: 0, duration: duration * 1000, useNativeDriver: false })
    progressAnimRef.current.start()

    // Logique du décompte basée sur Date.now() pour éviter le drift
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))

      setTimeLeft(remaining)

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        finishTimer()
      }
    }

    // Première mise à jour immédiate
    updateTimer()

    // Mise à jour toutes les 100ms pour un affichage fluide
    timerRef.current = setInterval(updateTimer, TIMER_INTERVAL_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (hapticTimer1Ref.current) clearTimeout(hapticTimer1Ref.current)
      if (hapticTimer2Ref.current) clearTimeout(hapticTimer2Ref.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (entryAnimRef.current) entryAnimRef.current.stop()
      if (progressAnimRef.current) progressAnimRef.current.stop()
    }
  }, [])

  const finishTimer = () => {
    if (notificationIdRef.current) {
      cancelNotification(notificationIdRef.current)
      notificationIdRef.current = null
    }

    // Triple vibration forte (conditionnelle)
    if (vibrationEnabledRef.current) {
      haptics.onDelete()
      hapticTimer1Ref.current = setTimeout(() => haptics.onDelete(), HAPTIC_DELAY_1)
      hapticTimer2Ref.current = setTimeout(() => haptics.onDelete(), HAPTIC_DELAY_2)
    }

    // Son beep (conditionnel)
    if (soundEnabledRef.current) {
      createBeepSound()
        .then(sound => {
          if (!isMountedRef.current) {
            sound.unloadAsync()
            return
          }
          soundRef.current = sound
          return sound.playAsync()
        })
        .catch(e => { if (__DEV__) console.warn('[RestTimer] sound playback error:', e) })
    }

    // Fermeture automatique après 1 secondes
    closeTimerRef.current = setTimeout(closeTimer, AUTO_CLOSE_DELAY)
  }

  const isClosingRef = useRef(false)

  const closeTimer = () => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    if (notificationIdRef.current) {
      cancelNotification(notificationIdRef.current)
      notificationIdRef.current = null
    }

    Animated.timing(animValue, { toValue: TIMER_ENTRY_OFFSET, duration: TIMER_ANIM_DURATION, useNativeDriver: true }).start(() => {
      onClose()
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const timerColor = timeLeft <= TIMER_WARNING_THRESHOLD_S ? colors.warning : colors.text

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: animValue }] }]}>
      <TouchableOpacity
        style={styles.content}
        onPress={closeTimer}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={t.accessibility.skipTimer}
      >
        <View style={styles.left}>
          <Text style={styles.label}>{t.workout.restInProgress}</Text>
          <Text
            style={[styles.timer, { color: timerColor }]}
            accessibilityRole="timer"
            accessibilityLabel={t.accessibility.restTimer + ': ' + formatTime(timeLeft)}
            accessibilityLiveRegion="polite"
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
        <View style={styles.hintChip}>
          <Text style={styles.hint}>{t.workout.skipRest}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default RestTimer

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor: colors.primary,
      elevation: 8,
      overflow: 'hidden',
    },
    content: {
      paddingVertical: spacing.ms,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    left: { flexDirection: 'column' },
    label: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 'bold', letterSpacing: 1 },
    timer: { fontSize: fontSize.xxl, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    hintChip: {
      backgroundColor: colors.surfaceOverlay,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    hint: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  }), [colors])
}
