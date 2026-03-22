/**
 * Tests for AnimatedSplash component
 */
import React from 'react'
import { render, act } from '@testing-library/react-native'
import AnimatedSplash from '../AnimatedSplash'

jest.mock('react-native-reanimated', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    __esModule: true,
    default: {
      View: ({ children, style, ...props }: Record<string, unknown>) =>
        React.createElement(View, { ...props, style }, children),
      Text: ({ children, style, ...props }: Record<string, unknown>) =>
        React.createElement(Text, { ...props, style }, children),
    },
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (toValue: number) => toValue,
    withDelay: (_delay: number, value: number) => value,
    withSpring: (toValue: number) => toValue,
    Easing: {
      out: () => undefined,
      in: () => undefined,
      cubic: undefined,
    },
  }
})

describe('AnimatedSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    act(() => { jest.runAllTimers() })
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('renders KORE text', () => {
    const { getByText } = render(
      <AnimatedSplash appReady={true} onFinish={jest.fn()} />,
    )
    expect(getByText('KORE')).toBeTruthy()
  })

  it('calls onFinish after animation completes when appReady', () => {
    const onFinish = jest.fn()
    render(<AnimatedSplash appReady={true} onFinish={onFinish} />)

    expect(onFinish).not.toHaveBeenCalled()

    act(() => { jest.advanceTimersByTime(1650) })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('does not call onFinish when appReady is false', () => {
    const onFinish = jest.fn()
    render(<AnimatedSplash appReady={false} onFinish={onFinish} />)

    act(() => { jest.advanceTimersByTime(3000) })
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('cleans up timeout on unmount', () => {
    const onFinish = jest.fn()
    const { unmount } = render(
      <AnimatedSplash appReady={true} onFinish={onFinish} />,
    )

    unmount()
    act(() => { jest.advanceTimersByTime(2000) })
    expect(onFinish).not.toHaveBeenCalled()
  })
})
