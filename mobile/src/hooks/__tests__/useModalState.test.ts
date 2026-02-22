import { renderHook, act } from '@testing-library/react-native'
import { useModalState } from '../useModalState'

describe('useModalState', () => {
  it('should initialize with closed state by default', () => {
    const { result } = renderHook(() => useModalState())

    expect(result.current.isOpen).toBe(false)
  })

  it('should initialize with custom initial state', () => {
    const { result } = renderHook(() => useModalState(true))

    expect(result.current.isOpen).toBe(true)
  })

  it('should open modal', () => {
    const { result } = renderHook(() => useModalState())

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('should close modal', () => {
    const { result } = renderHook(() => useModalState(true))

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
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
