import { renderHook, act } from '@testing-library/react-hooks'
import { DeviceEventEmitter } from 'react-native'
import { useModalState, useMultiModalSync } from '../useModalState'

// Mock DeviceEventEmitter
jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    emit: jest.fn(),
  },
}))

describe('useModalState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with closed state by default', () => {
    const { result } = renderHook(() => useModalState())

    expect(result.current.isOpen).toBe(false)
  })

  it('should initialize with custom initial state', () => {
    const { result } = renderHook(() => useModalState(true))

    expect(result.current.isOpen).toBe(true)
  })

  it('should emit SHOW_TAB_BAR on initial closed state', () => {
    renderHook(() => useModalState())

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('SHOW_TAB_BAR')
  })

  it('should emit HIDE_TAB_BAR on initial open state', () => {
    renderHook(() => useModalState(true))

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('HIDE_TAB_BAR')
  })

  it('should open modal and emit HIDE_TAB_BAR', () => {
    const { result } = renderHook(() => useModalState())

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)
    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('HIDE_TAB_BAR')
  })

  it('should close modal and emit SHOW_TAB_BAR', () => {
    const { result } = renderHook(() => useModalState(true))

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('SHOW_TAB_BAR')
  })

  it('should toggle modal state', () => {
    const { result } = renderHook(() => useModalState())

    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should support setIsOpen for compatibility', () => {
    const { result } = renderHook(() => useModalState())

    act(() => {
      result.current.setIsOpen(true)
    })

    expect(result.current.isOpen).toBe(true)
    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('HIDE_TAB_BAR')
  })

  it('should provide all expected methods', () => {
    const { result } = renderHook(() => useModalState())

    expect(result.current).toHaveProperty('isOpen')
    expect(result.current).toHaveProperty('open')
    expect(result.current).toHaveProperty('close')
    expect(result.current).toHaveProperty('toggle')
    expect(result.current).toHaveProperty('setIsOpen')
  })
})

describe('useMultiModalSync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should emit SHOW_TAB_BAR when all modals are closed', () => {
    renderHook(() => useMultiModalSync([false, false, false]))

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('SHOW_TAB_BAR')
  })

  it('should emit HIDE_TAB_BAR when at least one modal is open', () => {
    renderHook(() => useMultiModalSync([false, true, false]))

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('HIDE_TAB_BAR')
  })

  it('should emit HIDE_TAB_BAR when all modals are open', () => {
    renderHook(() => useMultiModalSync([true, true, true]))

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('HIDE_TAB_BAR')
  })

  it('should update when modal states change', () => {
    const { rerender } = renderHook(
      ({ states }) => useMultiModalSync(states),
      { initialProps: { states: [false, false] } }
    )

    expect(DeviceEventEmitter.emit).toHaveBeenLastCalledWith('SHOW_TAB_BAR')

    rerender({ states: [true, false] })

    expect(DeviceEventEmitter.emit).toHaveBeenLastCalledWith('HIDE_TAB_BAR')

    rerender({ states: [false, false] })

    expect(DeviceEventEmitter.emit).toHaveBeenLastCalledWith('SHOW_TAB_BAR')
  })

  it('should handle empty modal states array', () => {
    renderHook(() => useMultiModalSync([]))

    expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('SHOW_TAB_BAR')
  })

  it('should handle single modal state', () => {
    const { rerender } = renderHook(
      ({ states }) => useMultiModalSync(states),
      { initialProps: { states: [false] } }
    )

    expect(DeviceEventEmitter.emit).toHaveBeenLastCalledWith('SHOW_TAB_BAR')

    rerender({ states: [true] })

    expect(DeviceEventEmitter.emit).toHaveBeenLastCalledWith('HIDE_TAB_BAR')
  })
})
