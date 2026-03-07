// Mocks AVANT les imports

const mockGoBack = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

const mockCreate = jest.fn().mockResolvedValue({})
jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      create: mockCreate,
    }),
    write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
  },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('../../components/AlertDialog', () => ({
  AlertDialog: ({ visible, title, message, onConfirm, confirmText }: {
    visible: boolean; title: string; message?: string; onConfirm: () => void; confirmText?: string
  }) => {
    if (!visible) return null
    const { View, Text, TouchableOpacity } = require('react-native')
    return (
      <View testID="alert-dialog">
        <Text>{title}</Text>
        {message && <Text>{message}</Text>}
        {confirmText && <TouchableOpacity onPress={onConfirm}><Text>{confirmText}</Text></TouchableOpacity>}
      </View>
    )
  },
}))

import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import CreateExerciseScreen from '../CreateExerciseScreen'

describe('CreateExerciseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rend le composant sans crash', () => {
    const { getByText } = render(<CreateExerciseScreen />)
    expect(getByText('Muscles')).toBeTruthy()
  })

  it('affiche les labels nom, muscles, équipement, description', () => {
    const { getByText } = render(<CreateExerciseScreen />)
    expect(getByText('Nom...')).toBeTruthy() // label uses namePlaceholder
    expect(getByText('Muscles')).toBeTruthy()
    expect(getByText('Équipement')).toBeTruthy()
    expect(getByText('Description (optionnelle)')).toBeTruthy()
  })

  it('affiche les chips muscles', () => {
    const { getAllByText } = render(<CreateExerciseScreen />)
    // Multiple muscle chips visible (Pectoraux appears in chips)
    expect(getAllByText('Pectoraux').length).toBeGreaterThan(0)
    expect(getAllByText('Biceps').length).toBeGreaterThan(0)
  })

  it('affiche les boutons équipement', () => {
    const { getAllByText } = render(<CreateExerciseScreen />)
    expect(getAllByText('Poids libre').length).toBeGreaterThan(0)
    expect(getAllByText('Machine').length).toBeGreaterThan(0)
  })

  it('le bouton créer est présent', () => {
    const { getByText } = render(<CreateExerciseScreen />)
    expect(getByText('Créer')).toBeTruthy()
  })

  it('permet de saisir un nom', () => {
    const { getAllByPlaceholderText, getByDisplayValue } = render(<CreateExerciseScreen />)
    // 'Nom...' appears as both label text and placeholder
    const nameInputs = getAllByPlaceholderText('Nom...')
    fireEvent.changeText(nameInputs[0], 'Mon exercice')
    expect(getByDisplayValue('Mon exercice')).toBeTruthy()
  })

  it('permet de sélectionner un muscle', () => {
    const { getAllByText } = render(<CreateExerciseScreen />)
    const muscleChips = getAllByText('Pectoraux')
    fireEvent.press(muscleChips[0])
    // No crash = success
    expect(muscleChips[0]).toBeTruthy()
  })

  it('permet de sélectionner un équipement', () => {
    const { getAllByText } = render(<CreateExerciseScreen />)
    const equipBtns = getAllByText('Poids libre')
    fireEvent.press(equipBtns[0])
    expect(equipBtns[0]).toBeTruthy()
  })

  it('permet de saisir une description', () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<CreateExerciseScreen />)
    const descInput = getByPlaceholderText("Instructions d'exécution...")
    fireEvent.changeText(descInput, 'Une description')
    expect(getByDisplayValue('Une description')).toBeTruthy()
  })

  it('appelle database.write lors de la création', async () => {
    const { database } = require('../../model/index')

    const { getAllByPlaceholderText, getAllByText, getByText } = render(<CreateExerciseScreen />)

    // Fill valid form
    fireEvent.changeText(getAllByPlaceholderText('Nom...')[0], 'Test Exercice')
    fireEvent.press(getAllByText('Pectoraux')[0])
    fireEvent.press(getAllByText('Poids libre')[0])

    // Press create
    fireEvent.press(getByText('Créer'))

    await waitFor(() => {
      expect(database.write).toHaveBeenCalled()
    })
  })

  it('affiche une erreur si la création échoue', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB error'))

    const { getAllByPlaceholderText, getAllByText, getByText, getByTestId } = render(<CreateExerciseScreen />)

    // Fill valid form
    const nameInputs = getAllByPlaceholderText('Nom...')
    fireEvent.changeText(nameInputs[0], 'Test Exercice')
    const pectoraux = getAllByText('Pectoraux')
    fireEvent.press(pectoraux[0])
    const poidsLibre = getAllByText('Poids libre')
    fireEvent.press(poidsLibre[0])

    // Press create
    fireEvent.press(getByText('Créer'))

    await waitFor(() => {
      expect(getByTestId('alert-dialog')).toBeTruthy()
    })
  })
})
