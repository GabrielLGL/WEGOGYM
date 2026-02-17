import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { AlertDialog } from '../AlertDialog'
import * as Haptics from 'expo-haptics'

// Mock Portal
jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

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

describe('AlertDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <AlertDialog
        visible={false}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )

    expect(queryByText('Test Title')).toBeNull()
  })

  it('should render when visible is true', () => {
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        message="Test Message"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )

    expect(getByText('Test Title')).toBeTruthy()
    expect(getByText('Test Message')).toBeTruthy()
  })

  it('should render without message', () => {
    const { getByText, queryByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )

    expect(getByText('Test Title')).toBeTruthy()
    // Message should not be rendered
    expect(queryByText('Test Message')).toBeNull()
  })

  it('should call onConfirm when confirm button is pressed', async () => {
    const onConfirm = jest.fn()
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    )

    fireEvent.press(getByText('Confirmer'))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  it('should call onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn()
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    )

    fireEvent.press(getByText('Annuler'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should trigger heavy haptic on confirm', async () => {
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )

    fireEvent.press(getByText('Confirmer'))

    await waitFor(() => {
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      )
    })
  })

  it('should trigger medium haptic on cancel', () => {
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )

    fireEvent.press(getByText('Annuler'))

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    )
  })

  it('should support custom confirm and cancel text', () => {
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        confirmText="Supprimer"
        cancelText="Retour"
      />
    )

    expect(getByText('Supprimer')).toBeTruthy()
    expect(getByText('Retour')).toBeTruthy()
  })

  it('should support custom confirm color', () => {
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        confirmColor="#FF0000"
      />
    )

    // Confirm button should exist
    expect(getByText('Confirmer')).toBeTruthy()
  })

  it('should support async onConfirm', async () => {
    const onConfirm = jest.fn(() => Promise.resolve())
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    )

    fireEvent.press(getByText('Confirmer'))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  it('should use default button texts when not provided', () => {
    const { getByText } = render(
      <AlertDialog
        visible={true}
        title="Test Title"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )

    expect(getByText('Confirmer')).toBeTruthy()
    expect(getByText('Annuler')).toBeTruthy()
  })
})
