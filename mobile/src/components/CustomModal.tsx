import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native'
import { Portal } from '@gorhom/portal' // <--- La magie opère ici
import { colors, borderRadius, spacing } from '../theme/index' // On utilise ton thème !

interface Props {
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  buttons?: React.ReactNode
}

export const CustomModal: React.FC<Props> = ({ visible, onClose, title, children, buttons }) => {
  // On garde tes animations, elles sont très bien
  // Note: On pourrait utiliser Reanimated pour plus de perf, mais Animated suffit ici
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 })
      ]).start()
    } else {
      // Pas d'animation de sortie gérée ici pour simplifier (le Portal démonte le composant)
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.95)
    }
  }, [visible])

  if (!visible) return null

  return (
    // Le Portal "sort" ce contenu de l'écran actuel pour le mettre à la racine
    <Portal>
      <View style={styles.container}>
        {/* L'overlay sombre qui ferme la modale au clic */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
        
        {/* Le contenu de la modale */}
        <Animated.View 
          style={[
            styles.content, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.body}>
            {children}
          </View>

          {buttons && (
            <View style={styles.buttonsRow}>
              {buttons}
            </View>
          )}
        </Animated.View>
      </View>
    </Portal>
  )
}

const styles = StyleSheet.create({
  // Le container prend tout l'écran "virtuel" du Portal
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Toujours au-dessus
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  content: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
})