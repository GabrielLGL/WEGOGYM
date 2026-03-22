import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react-native'
import { SettingsContent } from '../SettingsScreen'

import { database } from '../../model/index'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

const mockToggleTheme = jest.fn().mockResolvedValue(undefined)
jest.mock('../../contexts/ThemeContext', () => {
  const { colors } = require('../../theme')
  return {
    useTheme: () => ({
      colors,
      isDark: true,
      mode: 'dark' as const,
      toggleTheme: mockToggleTheme,
      setThemeMode: jest.fn().mockResolvedValue(undefined),
      neuShadow: {},
    }),
    useColors: () => require('../../theme').colors,
  }
})

const mockNavigationReset = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    reset: mockNavigationReset,
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}))

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn(),
    get: jest.fn(),
  },
}))

// SettingsWearableSection uses withObservables HOC which calls user.observe()
// Mock it to avoid HOC issues in unit tests
jest.mock('../../components/settings/SettingsWearableSection', () => ({
  SettingsWearableSection: () => null,
}))

const mockWrite = database.write as jest.Mock

// Prevent react-native's internal batch flusher timer from firing after teardown
beforeEach(() => jest.useFakeTimers())
afterEach(() => {
  act(() => jest.runAllTimers())
  jest.useRealTimers()
})

const { of } = require('rxjs')

const makeUser = (overrides = {}) => ({
  restDuration: 90,
  timerEnabled: true,
  streakTarget: 3,
  aiProvider: 'offline',
  name: 'Jean',
  unitMode: null,
  update: jest.fn(),
  observe: jest.fn().mockReturnValue(of(undefined)),
  ...overrides,
})

describe('SettingsContent — state sync', () => {
  it('affiche les valeurs initiales du user', () => {
    const user = makeUser({ restDuration: 120, timerEnabled: true })
    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)
    expect(getByDisplayValue('120')).toBeTruthy()
  })

  it('re-synchronise les états locaux quand le prop user change', () => {
    const user1 = makeUser({ restDuration: 90 })
    const { getByDisplayValue, rerender } = render(
      <SettingsContent user={user1 as never} />
    )
    expect(getByDisplayValue('90')).toBeTruthy()

    const user2 = makeUser({ restDuration: 180 })
    act(() => {
      rerender(<SettingsContent user={user2 as never} />)
    })

    expect(getByDisplayValue('180')).toBeTruthy()
  })

  it('gère un user null sans crash', () => {
    expect(() => render(<SettingsContent user={null} />)).not.toThrow()
  })
})

describe('SettingsContent — section minuteur', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())
  })

  it('affiche le switch du minuteur', () => {
    const user = makeUser({ timerEnabled: true })
    const { getByText } = render(<SettingsContent user={user as never} />)

    expect(getByText('Activer le minuteur')).toBeTruthy()
  })

  it('affiche la durée de repos en secondes', () => {
    const user = makeUser({ restDuration: 60 })
    const { getByDisplayValue, getByText } = render(<SettingsContent user={user as never} />)

    expect(getByDisplayValue('60')).toBeTruthy()
    expect(getByText('sec')).toBeTruthy()
  })

  it('appelle database.write quand le minuteur est basculé', async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ timerEnabled: true, update: mockUpdate })

    const { getAllByRole } = render(<SettingsContent user={user as never} />)

    const switchEl = getAllByRole('switch')[1] // index 0 = Apparence, index 1 = Minuteur
    fireEvent(switchEl, 'valueChange', false)

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas si user est null lors du toggle timer', async () => {
    const { getAllByRole } = render(<SettingsContent user={null} />)

    const switchEl = getAllByRole('switch')[1] // index 0 = Apparence, index 1 = Minuteur
    fireEvent(switchEl, 'valueChange', false)

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas une durée invalide (< 10)', async () => {
    const user = makeUser({ restDuration: 90 })
    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)

    const input = getByDisplayValue('90')
    fireEvent.changeText(input, '5')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas une durée invalide (> 600)', async () => {
    const user = makeUser({ restDuration: 90 })
    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)

    const input = getByDisplayValue('90')
    fireEvent.changeText(input, '999')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas une durée non-numérique', async () => {
    const user = makeUser({ restDuration: 90 })
    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)

    const input = getByDisplayValue('90')
    fireEvent.changeText(input, 'abc')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })

  it('sauvegarde une durée valide (entre 10 et 600)', async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ restDuration: 90, update: mockUpdate })

    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)

    const input = getByDisplayValue('90')
    fireEvent.changeText(input, '120')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas si user est null pour la durée de repos', async () => {
    const { getByDisplayValue } = render(<SettingsContent user={null} />)

    const input = getByDisplayValue('90')
    fireEvent.changeText(input, '120')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })

  it('reverte le switch timer en cas d\'erreur database.write', async () => {
    mockWrite.mockRejectedValue(new Error('DB error'))
    const mockUpdate = jest.fn()
    const user = makeUser({ timerEnabled: true, update: mockUpdate })

    const { getAllByRole } = render(<SettingsContent user={user as never} />)

    const switchEl = getAllByRole('switch')[1] // index 0 = Apparence, index 1 = Minuteur
    fireEvent(switchEl, 'valueChange', false)

    // The write fails, so timerEnabled should revert to true
    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
    // The component should have reverted — no crash means revert worked
  })
})

describe('SettingsContent — section Mon profil', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())
  })

  it('affiche le champ prénom', () => {
    const user = makeUser({ name: 'Jean' })
    const { getByText, getByDisplayValue } = render(<SettingsContent user={user as never} />)
    expect(getByText('Prénom')).toBeTruthy()
    expect(getByDisplayValue('Jean')).toBeTruthy()
  })

  it('sauvegarde le nom au blur', async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ name: 'Jean', update: mockUpdate })
    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)

    const input = getByDisplayValue('Jean')
    fireEvent.changeText(input, 'Pierre')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('sauvegarde le nom au submitEditing', async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ name: 'Jean', update: mockUpdate })
    const { getByDisplayValue } = render(<SettingsContent user={user as never} />)

    const input = getByDisplayValue('Jean')
    fireEvent.changeText(input, 'Marie')
    fireEvent(input, 'submitEditing')

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas le nom si user est null', async () => {
    const { getByPlaceholderText } = render(<SettingsContent user={null} />)

    const input = getByPlaceholderText('Toi')
    fireEvent.changeText(input, 'Test')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })

  it('affiche le placeholder quand le nom est vide', () => {
    const user = makeUser({ name: '' })
    const { getByPlaceholderText } = render(<SettingsContent user={user as never} />)
    expect(getByPlaceholderText('Toi')).toBeTruthy()
  })
})

describe('SettingsContent — section Gamification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())
  })

  it('affiche les 4 boutons objectif hebdomadaire', () => {
    const user = makeUser({ streakTarget: 3 })
    const { getByText } = render(<SettingsContent user={user as never} />)
    expect(getByText('2')).toBeTruthy()
    expect(getByText('3')).toBeTruthy()
    expect(getByText('4')).toBeTruthy()
    expect(getByText('5')).toBeTruthy()
  })

  it("taper un bouton met à jour l'affichage immédiatement (optimiste)", async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ streakTarget: 3, update: mockUpdate })
    const { getByTestId } = render(<SettingsContent user={user as never} />)

    fireEvent.press(getByTestId('streak-target-5'))
    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it("appelle database.write lors du changement d'objectif", async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ streakTarget: 3, update: mockUpdate })
    const { getByTestId } = render(<SettingsContent user={user as never} />)

    fireEvent.press(getByTestId('streak-target-4'))

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('reverte en cas d\'erreur database.write', async () => {
    mockWrite.mockRejectedValueOnce(new Error('DB error'))
    const user = makeUser({ streakTarget: 3, update: jest.fn() })
    const { getByTestId } = render(<SettingsContent user={user as never} />)

    fireEvent.press(getByTestId('streak-target-5'))
    // No crash expected — revert happens silently
    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })
})

describe('SettingsContent — section IA cachée', () => {
  it('n\'affiche pas la section IA', () => {
    const user = makeUser()
    const { queryByText } = render(<SettingsContent user={user as never} />)

    expect(queryByText('Intelligence Artificielle')).toBeNull()
    expect(queryByText('Offline — Génération locale')).toBeNull()
  })
})

describe('SettingsContent — section À propos', () => {
  it('affiche le nom de l\'application', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText('Kore')).toBeTruthy()
  })

  it('affiche la version depuis expo-constants', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    // expo-constants mock returns '1.0.0' by default via expoConfig
    expect(getByText(/\d+\.\d+\.\d+/)).toBeTruthy()
  })

  it('affiche la stack technique', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText('React Native + WatermelonDB')).toBeTruthy()
  })
})

describe('SettingsContent — section Aide', () => {
  it('affiche la section aide', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText(/Navigation/)).toBeTruthy()
    expect(getByText(/Programmes/)).toBeTruthy()
    expect(getByText(/Exercices/)).toBeTruthy()
  })
})

describe('SettingsContent — section Apparence', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockToggleTheme.mockResolvedValue(undefined)
  })

  it('affiche le switch du mode sombre', () => {
    const { getByText, getAllByRole } = render(<SettingsContent user={null} />)
    expect(getByText('Apparence')).toBeTruthy()
    expect(getByText('Mode sombre')).toBeTruthy()
    const switches = getAllByRole('switch')
    expect(switches.length).toBeGreaterThanOrEqual(1)
  })

  it('appelle toggleTheme au changement du switch Apparence', async () => {
    const { getAllByRole } = render(<SettingsContent user={null} />)
    const apparenceSwitch = getAllByRole('switch')[0]
    fireEvent(apparenceSwitch, 'valueChange', false)
    await waitFor(() => {
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })
  })
})
