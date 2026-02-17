import { renderHook } from '@testing-library/react-hooks'
import * as Haptics from 'expo-haptics'
import { useHaptics } from '../useHaptics'

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Error: 'Error',
  },
}))

describe('useHaptics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide haptic feedback API', () => {
    const { result } = renderHook(() => useHaptics())

    expect(result.current).toHaveProperty('onPress')
    expect(result.current).toHaveProperty('onSelect')
    expect(result.current).toHaveProperty('onDelete')
    expect(result.current).toHaveProperty('onSuccess')
    expect(result.current).toHaveProperty('onDrag')
    expect(result.current).toHaveProperty('onError')
    expect(result.current).toHaveProperty('onMajorSuccess')
  })

  it('should call Medium impact for onPress', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onPress()

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    )
  })

  it('should call Light impact for onSelect', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onSelect()

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    )
  })

  it('should call Heavy impact for onDelete', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onDelete()

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    )
  })

  it('should call Medium impact for onSuccess', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onSuccess()

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    )
  })

  it('should call Light impact for onDrag', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onDrag()

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    )
  })

  it('should call Error notification for onError', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onError()

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Error
    )
  })

  it('should call Success notification for onMajorSuccess', () => {
    const { result } = renderHook(() => useHaptics())
    result.current.onMajorSuccess()

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    )
  })
})
