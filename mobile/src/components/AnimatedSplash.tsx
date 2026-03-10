import React, { useEffect } from 'react'
import { Image, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import { fontSize, spacing } from '../theme'

interface AnimatedSplashProps {
  appReady: boolean
  onFinish: () => void
}

export default function AnimatedSplash({ appReady, onFinish }: AnimatedSplashProps) {
  // Splash is rendered outside ThemeProvider, use hardcoded dark theme colors
  const SPLASH_BG = '#181b21'
  const SPLASH_PRIMARY = '#00cec9'
  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const textOpacity = useSharedValue(0)
  const textTranslateY = useSharedValue(20)
  const containerOpacity = useSharedValue(1)
  const containerScale = useSharedValue(1)

  useEffect(() => {
    if (!appReady) return

    // Phase 1: Logo fade in + scale (0→400ms)
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 })

    // Phase 2: Text slide up + fade in (400→700ms)
    textOpacity.value = withDelay(400, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }))
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 14, stiffness: 120 }))

    // Phase 3: Pause (700→1200ms) — no-op, just wait

    // Phase 4: Fade out everything (1200→1600ms)
    containerOpacity.value = withDelay(1200, withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }))
    containerScale.value = withDelay(1200, withTiming(1.05, {
      duration: 400,
      easing: Easing.in(Easing.cubic),
    }))

    // Signal finish after full animation
    const timeout = setTimeout(onFinish, 1650)

    return () => clearTimeout(timeout)
  }, [appReady, logoOpacity, logoScale, textOpacity, textTranslateY, containerOpacity, containerScale, onFinish])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }))

  return (
    <Animated.View style={[styles.container, { backgroundColor: SPLASH_BG }, containerStyle]}>
      <Animated.View style={logoStyle}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Animated.Text style={[styles.title, { color: SPLASH_PRIMARY }]}>
          KORE
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.jumbo,
    fontWeight: '800',
    letterSpacing: 12,
  },
})
