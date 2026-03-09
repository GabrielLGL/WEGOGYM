import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { OnboardingCard } from '../OnboardingCard'
import * as Haptics from 'expo-haptics'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

describe('OnboardingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le label', () => {
    const { getByText } = render(
      <OnboardingCard label="Débutant" selected={false} onPress={jest.fn()} />
    )
    expect(getByText('Débutant')).toBeTruthy()
  })

  it('affiche la description si fournie', () => {
    const { getByText } = render(
      <OnboardingCard
        label="Débutant"
        description="Je commence la muscu"
        selected={false}
        onPress={jest.fn()}
      />
    )
    expect(getByText('Je commence la muscu')).toBeTruthy()
  })

  it('ne rend pas la description si absente', () => {
    const { queryByText } = render(
      <OnboardingCard label="Débutant" selected={false} onPress={jest.fn()} />
    )
    // Seul le label doit être présent
    expect(queryByText('undefined')).toBeNull()
  })

  it('appelle onPress au tap', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <OnboardingCard label="Débutant" selected={false} onPress={onPress} />
    )
    fireEvent.press(getByText('Débutant'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('déclenche un haptic onSelect au tap', () => {
    const { getByText } = render(
      <OnboardingCard label="Débutant" selected={false} onPress={jest.fn()} />
    )
    fireEvent.press(getByText('Débutant'))
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light)
  })

  it('appelle onPress même quand selected=true', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <OnboardingCard label="Intermédiaire" selected={true} onPress={onPress} />
    )
    fireEvent.press(getByText('Intermédiaire'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('rend le label et la description ensemble', () => {
    const { getByText } = render(
      <OnboardingCard
        label="Avancé"
        description="Plus de 2 ans d'expérience"
        selected={false}
        onPress={jest.fn()}
      />
    )
    expect(getByText('Avancé')).toBeTruthy()
    expect(getByText("Plus de 2 ans d'expérience")).toBeTruthy()
  })
})
