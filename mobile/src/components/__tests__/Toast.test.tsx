/**
 * Tests for Toast component
 */
import React from 'react'
import { render, act } from '@testing-library/react-native'
import { Toast } from '../Toast'
import type { ToastConfig } from '../Toast'

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    act(() => { jest.runAllTimers() })
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('renders the message', () => {
    const config: ToastConfig = { message: 'Enregistré !' }
    const { getByText } = render(<Toast config={config} onDismiss={jest.fn()} />)
    expect(getByText('Enregistré !')).toBeTruthy()
  })

  it('defaults to success variant', () => {
    const config: ToastConfig = { message: 'OK' }
    const { getByText } = render(<Toast config={config} onDismiss={jest.fn()} />)
    expect(getByText('OK')).toBeTruthy()
  })

  it('renders with error variant', () => {
    const config: ToastConfig = { message: 'Erreur', variant: 'error' }
    const { getByText } = render(<Toast config={config} onDismiss={jest.fn()} />)
    expect(getByText('Erreur')).toBeTruthy()
  })

  it('renders with info variant', () => {
    const config: ToastConfig = { message: 'Info', variant: 'info' }
    const { getByText } = render(<Toast config={config} onDismiss={jest.fn()} />)
    expect(getByText('Info')).toBeTruthy()
  })

  it('auto-dismisses after default duration (2500ms)', () => {
    const onDismiss = jest.fn()
    const config: ToastConfig = { message: 'Bye' }
    render(<Toast config={config} onDismiss={onDismiss} />)

    // Not dismissed yet before duration
    act(() => { jest.advanceTimersByTime(2400) })
    expect(onDismiss).not.toHaveBeenCalled()

    // After duration + fade-out (300ms)
    act(() => { jest.advanceTimersByTime(500) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('auto-dismisses after custom duration', () => {
    const onDismiss = jest.fn()
    const config: ToastConfig = { message: 'Custom', duration: 1000 }
    render(<Toast config={config} onDismiss={onDismiss} />)

    act(() => { jest.advanceTimersByTime(900) })
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => { jest.advanceTimersByTime(500) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('cleans up timer on unmount', () => {
    const onDismiss = jest.fn()
    const config: ToastConfig = { message: 'Unmount me' }
    const { unmount } = render(<Toast config={config} onDismiss={onDismiss} />)

    unmount()
    act(() => { jest.advanceTimersByTime(5000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
