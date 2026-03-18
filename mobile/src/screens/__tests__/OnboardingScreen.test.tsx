// Mocks AVANT les imports
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}))

import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import OnboardingScreen from '../OnboardingScreen'
import { database } from '../../model/index'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
    }),
    write: jest.fn().mockResolvedValue(undefined),
  },
}))

const mockReset = jest.fn()
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    reset: mockReset,
    replace: jest.fn(),
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: undefined,
  }),
}))

const mockDb = database as jest.Mocked<typeof database>

/** Helper: advance past disclaimer step 0 by pressing the accept button */
function acceptDisclaimer(getByText: ReturnType<typeof render>['getByText']) {
  // Step 0 is now the disclaimer — need to set up mock for DB write
  ;(mockDb.get as jest.Mock).mockReturnValue({
    query: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue([{
        disclaimerAccepted: false,
        cguVersionAccepted: null,
        update: jest.fn().mockResolvedValue(undefined),
      }]),
    }),
  })
  ;(mockDb.write as jest.Mock).mockImplementation(async (fn: () => Promise<void>) => {
    await fn()
  })
  fireEvent.press(getByText('Je certifie avoir lu et approuvé les CGU'))
}

describe('OnboardingScreen — step 0 (disclaimer)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le disclaimer santé au step 0', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText('Avertissement santé')).toBeTruthy()
    expect(getByText('Je certifie avoir lu et approuvé les CGU')).toBeTruthy()
  })

  it('affiche le lien vers les CGU', () => {
    const { getByText } = render(<OnboardingScreen />)
    expect(getByText("Lire les Conditions Générales d'Utilisation")).toBeTruthy()
  })
})

describe('OnboardingScreen — étape 2 (niveau)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche les cartes de niveau après disclaimer + langue', async () => {
    const { getByText } = render(<OnboardingScreen />)
    acceptDisclaimer(getByText)

    await waitFor(() => {
      expect(getByText('Choisir la langue')).toBeTruthy()
    })
    fireEvent.press(getByText('Suivant'))
    expect(getByText('Quel est ton niveau ?')).toBeTruthy()
    expect(getByText('Débutant')).toBeTruthy()
    expect(getByText('Intermédiaire')).toBeTruthy()
    expect(getByText('Avancé')).toBeTruthy()
  })

  it('passe à l\'étape 3 après sélection d\'un niveau et tap Suivant', async () => {
    const { getByText } = render(<OnboardingScreen />)
    acceptDisclaimer(getByText)

    await waitFor(() => {
      expect(getByText('Choisir la langue')).toBeTruthy()
    })
    fireEvent.press(getByText('Suivant'))
    fireEvent.press(getByText('Débutant'))
    fireEvent.press(getByText('Suivant'))

    expect(getByText('Quel est ton objectif ?')).toBeTruthy()
  })
})

describe('OnboardingScreen — étape 3 (objectif)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche les cartes d\'objectif à l\'étape 3', async () => {
    const { getByText } = render(<OnboardingScreen />)
    acceptDisclaimer(getByText)

    await waitFor(() => {
      expect(getByText('Choisir la langue')).toBeTruthy()
    })
    fireEvent.press(getByText('Suivant'))
    fireEvent.press(getByText('Débutant'))
    fireEvent.press(getByText('Suivant'))

    expect(getByText('Prise de masse')).toBeTruthy()
    expect(getByText('Force')).toBeTruthy()
    expect(getByText('Recomposition')).toBeTruthy()
    expect(getByText('Santé générale')).toBeTruthy()
  })

  it('revient à l\'étape 2 au tap sur Retour', async () => {
    const { getByText } = render(<OnboardingScreen />)
    acceptDisclaimer(getByText)

    await waitFor(() => {
      expect(getByText('Choisir la langue')).toBeTruthy()
    })
    fireEvent.press(getByText('Suivant'))
    fireEvent.press(getByText('Débutant'))
    fireEvent.press(getByText('Suivant'))
    expect(getByText('Quel est ton objectif ?')).toBeTruthy()

    fireEvent.press(getByText('Retour'))
    expect(getByText('Quel est ton niveau ?')).toBeTruthy()
  })

  it('appelle database.write et reset("Home") après confirmation', async () => {
    const mockUser = {
      userLevel: null,
      userGoal: null,
      onboardingCompleted: false,
      disclaimerAccepted: false,
      cguVersionAccepted: null,
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(mockDb.get as jest.Mock).mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([mockUser]),
      }),
    })
    ;(mockDb.write as jest.Mock).mockImplementation(async (fn: () => Promise<void>) => {
      await fn()
    })

    const { getByText } = render(<OnboardingScreen />)

    // Accept disclaimer
    fireEvent.press(getByText('Je certifie avoir lu et approuvé les CGU'))

    await waitFor(() => {
      expect(getByText('Choisir la langue')).toBeTruthy()
    })

    fireEvent.press(getByText('Suivant'))
    fireEvent.press(getByText('Débutant'))
    fireEvent.press(getByText('Suivant'))
    fireEvent.press(getByText('Force'))
    fireEvent.press(getByText('Confirmer'))

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Home' }] })
    })
  })

  it('ne confirme pas si aucun objectif sélectionné', async () => {
    const { getByText } = render(<OnboardingScreen />)
    acceptDisclaimer(getByText)

    await waitFor(() => {
      expect(getByText('Choisir la langue')).toBeTruthy()
    })
    fireEvent.press(getByText('Suivant'))
    fireEvent.press(getByText('Débutant'))
    fireEvent.press(getByText('Suivant'))

    // Reset mock counts after disclaimer write
    mockDb.write.mockClear()
    mockReset.mockClear()

    act(() => {
      fireEvent.press(getByText('Confirmer'))
    })

    await new Promise(resolve => setTimeout(resolve, 50))
    expect(mockDb.write).not.toHaveBeenCalled()
    expect(mockReset).not.toHaveBeenCalled()
  })
})
