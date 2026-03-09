import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  BackHandler,
  useWindowDimensions,
} from 'react-native'
import { Portal } from '@gorhom/portal'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useHaptics } from '../hooks/useHaptics'
import type { ThemeColors } from '../theme'

interface TargetLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface CoachMarkStep {
  key: string
  targetRef: React.RefObject<View>
  text: string
  position: 'top' | 'bottom'
}

interface CoachMarksProps {
  visible: boolean
  steps: CoachMarkStep[]
  onComplete: () => void
}

const SPOTLIGHT_PADDING = 8
const TOOLTIP_MARGIN = 12
const ANIMATION_DURATION = 250
const MAX_MEASURE_RETRIES = 5
const MEASURE_RETRY_DELAY = 300

export const CoachMarks: React.FC<CoachMarksProps> = ({
  visible,
  steps,
  onComplete,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const haptics = useHaptics()
  const { height: screenH } = useWindowDimensions()

  const [currentStep, setCurrentStep] = useState(0)
  const [targetLayout, setTargetLayout] = useState<TargetLayout | null>(null)
  const [ready, setReady] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const tooltipAnim = useRef(new Animated.Value(0)).current

  const totalSteps = steps.length
  const step = steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  // Measure target element position
  const measureTarget = useCallback(() => {
    if (!step?.targetRef?.current) {
      setTargetLayout(null)
      return
    }
    step.targetRef.current.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setRetryCount(0)
        setTargetLayout({ x, y, width, height })
      } else {
        setTargetLayout(null)
      }
    })
  }, [step])

  // Handlers (defined before effects to avoid forward references)
  const handleComplete = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true)
      onComplete()
    })
  }, [fadeAnim, onComplete])

  const handleNext = useCallback(() => {
    haptics.onSelect()
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [haptics, isLastStep, handleComplete])

  const handleSkip = useCallback(() => {
    haptics.onPress()
    handleComplete()
  }, [haptics, handleComplete])

  // Global safety timeout — auto-dismiss if stuck
  useEffect(() => {
    if (!visible || dismissed) return
    const timer = setTimeout(() => {
      handleComplete()
    }, 10_000)
    return () => clearTimeout(timer)
  }, [visible, dismissed, handleComplete])

  // Animate in on mount
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setReady(true)
        setRetryCount(0)
        measureTarget()
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }).start()
      }, 600)
      return () => clearTimeout(timer)
    } else {
      setReady(false)
      setCurrentStep(0)
      setRetryCount(0)
      setDismissed(false)
      fadeAnim.setValue(0)
      tooltipAnim.setValue(0)
    }
  }, [visible, measureTarget, fadeAnim, tooltipAnim])

  // Retry measurement when targetLayout is null
  useEffect(() => {
    if (!ready || !visible || targetLayout !== null) return

    if (retryCount >= MAX_MEASURE_RETRIES) {
      handleComplete()
      return
    }

    const timer = setTimeout(() => {
      setRetryCount(prev => prev + 1)
      measureTarget()
    }, MEASURE_RETRY_DELAY)

    return () => clearTimeout(timer)
  }, [ready, visible, targetLayout, retryCount, measureTarget, handleComplete])

  // Re-measure on step change
  useEffect(() => {
    if (!ready) return
    setRetryCount(0)
    tooltipAnim.setValue(0)
    measureTarget()
    Animated.timing(tooltipAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start()
  }, [currentStep, ready, measureTarget, tooltipAnim])

  // Android back handler
  useEffect(() => {
    if (!visible || dismissed) return
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleSkip()
      return true
    })
    return () => handler.remove()
  }, [visible, dismissed, handleSkip])

  if (!visible || !ready || !step || dismissed) return null

  // Spotlight rectangle (with padding)
  const spot = targetLayout
    ? {
        x: targetLayout.x - SPOTLIGHT_PADDING,
        y: targetLayout.y - SPOTLIGHT_PADDING,
        w: targetLayout.width + SPOTLIGHT_PADDING * 2,
        h: targetLayout.height + SPOTLIGHT_PADDING * 2,
      }
    : null

  // Tooltip position
  const tooltipTop = spot
    ? step.position === 'bottom'
      ? spot.y + spot.h + TOOLTIP_MARGIN
      : spot.y - TOOLTIP_MARGIN
    : screenH / 2

  const tooltipTranslateY = tooltipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [step.position === 'bottom' ? -10 : 10, 0],
  })

  return (
    <Portal>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Overlay rects around spotlight */}
        {spot ? (
          <>
            {/* Top */}
            <TouchableWithoutFeedback onPress={handleNext}>
              <View style={[styles.overlayRect, { top: 0, left: 0, right: 0, height: spot.y }]} />
            </TouchableWithoutFeedback>
            {/* Bottom */}
            <TouchableWithoutFeedback onPress={handleNext}>
              <View
                style={[
                  styles.overlayRect,
                  { top: spot.y + spot.h, left: 0, right: 0, bottom: 0 },
                ]}
              />
            </TouchableWithoutFeedback>
            {/* Left */}
            <TouchableWithoutFeedback onPress={handleNext}>
              <View
                style={[
                  styles.overlayRect,
                  { top: spot.y, left: 0, width: spot.x, height: spot.h },
                ]}
              />
            </TouchableWithoutFeedback>
            {/* Right */}
            <TouchableWithoutFeedback onPress={handleNext}>
              <View
                style={[
                  styles.overlayRect,
                  {
                    top: spot.y,
                    left: spot.x + spot.w,
                    right: 0,
                    height: spot.h,
                  },
                ]}
              />
            </TouchableWithoutFeedback>
            {/* Spotlight border */}
            <View
              style={[
                styles.spotlightBorder,
                {
                  top: spot.y,
                  left: spot.x,
                  width: spot.w,
                  height: spot.h,
                },
              ]}
              pointerEvents="none"
            />
          </>
        ) : (
          <TouchableWithoutFeedback onPress={handleNext}>
            <View style={[styles.overlayRect, { top: 0, left: 0, right: 0, bottom: 0 }]} />
          </TouchableWithoutFeedback>
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            {
              top: step.position === 'bottom' ? tooltipTop : undefined,
              bottom:
                step.position === 'top' && spot
                  ? screenH - spot.y + TOOLTIP_MARGIN
                  : undefined,
              opacity: tooltipAnim,
              transform: [{ translateY: tooltipTranslateY }],
            },
          ]}
        >
          <Text style={styles.tooltipText}>{step.text}</Text>

          <View style={styles.tooltipFooter}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
              <Text style={styles.skipText}>{t.coachMarks.skip}</Text>
            </TouchableOpacity>

            <View style={styles.tooltipRight}>
              <Text style={styles.stepCounter}>
                {currentStep + 1}/{totalSteps}
              </Text>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.nextText}>
                  {isLastStep ? t.coachMarks.finish : t.coachMarks.next}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Portal>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 9999,
    },
    overlayRect: {
      position: 'absolute',
      backgroundColor: colors.overlay,
    },
    spotlightBorder: {
      position: 'absolute',
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    tooltip: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      elevation: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    tooltipText: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      lineHeight: 22,
      marginBottom: spacing.ms,
    },
    tooltipFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    tooltipRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.ms,
    },
    stepCounter: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
    },
    nextButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    nextText: {
      color: colors.primaryText,
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
  }), [colors])
}
