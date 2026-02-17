import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../theme'

interface Props {
  duration: number // en secondes
  onClose: () => void
}

/**
 * Composant Timer de repos automatique.
 * Désormais intégré au flux de la page pour ne pas chevaucher la liste.
 */
const RestTimer: React.FC<Props> = ({ duration, onClose }) => {
  const [timeLeft, setTargetTime] = useState(duration)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animValue = useRef(new Animated.Value(50)).current // Animation de montée légère

  useEffect(() => {
    // Animation d'entrée
    Animated.spring(animValue, { toValue: 0, useNativeDriver: true }).start()

    // Logique du décompte
    timerRef.current = setInterval(() => {
      setTargetTime(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          finishTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const finishTimer = () => {
    // Triple vibration forte pour alerter la fin du repos
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 800)

    // Fermeture automatique après 1 secondes
    setTimeout(closeTimer, 1000)
  }

  const closeTimer = () => {
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
