import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '../Button'
import * as Haptics from 'expo-haptics'

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

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with text children', () => {
    const { getByText } = render(
      <Button onPress={jest.fn()}>Click me</Button>
    )

    expect(getByText('Click me')).toBeTruthy()
  })

  it('should call onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <Button onPress={onPress}>Click me</Button>
    )

    fireEvent.press(getByText('Click me'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should trigger haptic feedback on press (primary)', () => {
    const { getByText } = render(
      <Button variant="primary" onPress={jest.fn()}>
        Click me
      </Button>
    )

    fireEvent.press(getByText('Click me'))

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    )
  })

  it('should trigger heavy haptic feedback on danger press', () => {
    const { getByText } = render(
      <Button variant="danger" onPress={jest.fn()}>
        Delete
      </Button>
    )

    fireEvent.press(getByText('Delete'))

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    )
  })

  it('should not trigger haptic when enableHaptics is false', () => {
    const { getByText } = render(
      <Button onPress={jest.fn()} enableHaptics={false}>
        Click me
      </Button>
    )

    fireEvent.press(getByText('Click me'))

    expect(Haptics.impactAsync).not.toHaveBeenCalled()
  })

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>
    )

    fireEvent.press(getByText('Disabled'))

    expect(onPress).not.toHaveBeenCalled()
    expect(Haptics.impactAsync).not.toHaveBeenCalled()
  })

  it('should support async onPress', async () => {
    const onPress = jest.fn(() => Promise.resolve())
    const { getByText } = render(
      <Button onPress={onPress}>Async</Button>
    )

    fireEvent.press(getByText('Async'))

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should render with different sizes', () => {
    const { rerender, getByText } = render(
      <Button onPress={jest.fn()} size="sm">
        Small
      </Button>
    )
    expect(getByText('Small')).toBeTruthy()

    rerender(
      <Button onPress={jest.fn()} size="md">
        Medium
      </Button>
    )
    expect(getByText('Medium')).toBeTruthy()

    rerender(
      <Button onPress={jest.fn()} size="lg">
        Large
      </Button>
    )
    expect(getByText('Large')).toBeTruthy()
  })

  it('should render with different variants', () => {
    const { rerender, getByText } = render(
      <Button onPress={jest.fn()} variant="primary">
        Primary
      </Button>
    )
    expect(getByText('Primary')).toBeTruthy()

    rerender(
      <Button onPress={jest.fn()} variant="danger">
        Danger
      </Button>
    )
    expect(getByText('Danger')).toBeTruthy()

    rerender(
      <Button onPress={jest.fn()} variant="secondary">
        Secondary
      </Button>
    )
    expect(getByText('Secondary')).toBeTruthy()

    rerender(
      <Button onPress={jest.fn()} variant="ghost">
        Ghost
      </Button>
    )
    expect(getByText('Ghost')).toBeTruthy()
  })

  it('should support custom styles', () => {
    const { getByText } = render(
      <Button
        onPress={jest.fn()}
        style={{ backgroundColor: 'red' }}
        textStyle={{ color: 'blue' }}
      >
        Custom
      </Button>
    )

    expect(getByText('Custom')).toBeTruthy()
  })

  it('should support fullWidth prop', () => {
    const { getByText } = render(
      <Button onPress={jest.fn()} fullWidth>
        Full Width
      </Button>
    )

    expect(getByText('Full Width')).toBeTruthy()
  })

  it('should render with React node children', () => {
    const { getByTestId } = render(
      <Button onPress={jest.fn()}>
        <React.Fragment testID="custom-child">Custom</React.Fragment>
      </Button>
    )

    expect(getByTestId('custom-child')).toBeTruthy()
  })
})
