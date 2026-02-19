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

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: animValue }] }]}>
      <TouchableOpacity style={styles.content} onPress={closeTimer} activeOpacity={0.9}>
        <View style={styles.left}>
          <Text style={styles.label}>REPOS EN COURS</Text>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        </View>
        <Text style={styles.hint}>Ignorer</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 5
  },
  content: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4
  },
  left: { flexDirection: 'column' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  timer: { color: colors.text, fontSize: 22, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  hint: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }
})

export default RestTimer
