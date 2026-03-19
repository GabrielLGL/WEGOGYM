import React from 'react'
import { render } from '@testing-library/react-native'
import LegalScreen from '../LegalScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

describe('LegalScreen', () => {
  it('affiche le contenu CGU', () => {
    const { getByText } = render(<LegalScreen />)
    expect(getByText('https://kore-app.net/cgu')).toBeTruthy()
  })

  it('affiche le texte de la politique', () => {
    const { getByText } = render(<LegalScreen />)
    // Le contenu est affiché via t.legal.fallbackContent
    expect(getByText(/conditions/i)).toBeTruthy()
  })
})
