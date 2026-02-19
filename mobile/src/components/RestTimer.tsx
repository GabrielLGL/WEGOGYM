import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native'
import { useHaptics } from '../hooks/useHaptics'
import { colors } from '../theme'
import {
  scheduleRestEndNotification,
  cancelNotification,
} from '../services/notificationService'

interface Props {
  duration: number // en secondes
  onClose: () => void
  notificationEnabled?: boolean
}

/**
 * Composant Timer de repos automatique.
 * Désormais intégré au flux de la page pour ne pas chevaucher la liste.
 */
const RestTimer: React.FC<Props> = ({ duration, onClose, notificationEnabled }) => {
  const haptics = useHaptics()
  const [timeLeft, setTimeLeft] = useState(duration)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hapticTimer1Ref = useRef<NodeJS.Timeout | null>(null)
  const hapticTimer2Ref = useRef<NodeJS.Timeout | null>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number>(Date.now() + duration * 1000) // Heure de fin cible
  const animValue = useRef(new Animated.Value(50)).current // Animation de montée légère
  const progressAnim = useRef(new Animated.Value(1)).current
  const notificationIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (notificationEnabled) {
      scheduleRestEndNotification(duration).then(id => {
        notificationIdRef.current = id
      })
    }
    return () => {
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current)
        notificationIdRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Animation d'entrée
    Animated.spring(animValue, { toValue: 0, useNativeDriver: true }).start()

    // Barre de progression
    Animated.timing(progressAnim, { toValue: 0, duration: duration * 1000, useNativeDriver: false }).start()

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
    timerRef.current = setInterval(updateTimer, 100)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (hapticTimer1Ref.current) clearTimeout(hapticTimer1Ref.current)
      if (hapticTimer2Ref.current) clearTimeout(hapticTimer2Ref.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const finishTimer = () => {
    if (notificationIdRef.current) {
      cancelNotification(notificationIdRef.current)
      notificationIdRef.current = null
    }

    // Triple vibration forte pour alerter la fin du repos
    haptics.onDelete()
    hapticTimer1Ref.current = setTimeout(() => haptics.onDelete(), 400)
    hapticTimer2Ref.current = setTimeout(() => haptics.onDelete(), 800)

    // Fermeture automatique après 1 secondes
    closeTimerRef.current = setTimeout(closeTimer, 1000)
  }

  const closeTimer = () => {
    if (notificationIdRef.current) {
      cancelNotification(notificationIdRef.current)
      notificationIdRef.current = null
    }

    Animated.timing(animValue, { toValue: 50, duration: 200, useNativeDriver: true }).start(() => {
      onClose()
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const timerColor = timeLeft <= 10 ? colors.warning : colors.text

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: animValue }] }]}>
      <View style={styles.progressBarWrapper}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <TouchableOpacity style={styles.content} onPress={closeTimer} activeOpacity={0.9}>
        <View style={styles.left}>
          <Text style={styles.label}>REPOS EN COURS</Text>
          <Text style={[styles.timer, { color: timerColor }]}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.hintChip}>
          <Text style={styles.hint}>Ignorer</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: colors.card,
    borderRadius: 15,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  progressBarWrapper: {
    height: 3,
    backgroundColor: colors.cardSecondary,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: colors.primary,
    height: 3,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'column' },
  label: { color: colors.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  timer: { fontSize: 22, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  hintChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  hint: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
})

export default RestTimer
