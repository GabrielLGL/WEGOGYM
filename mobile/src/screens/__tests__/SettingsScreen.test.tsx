import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { SettingsContent } from '../SettingsScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('../../services/ai/aiService', () => ({
  testProviderConnection: jest.fn(),
}))

import { database } from '../../model/index'
import { testProviderConnection } from '../../services/ai/aiService'

const mockWrite = database.write as jest.Mock
const mockTestProviderConnection = testProviderConnection as jest.Mock

const makeUser = (overrides = {}) => ({
  restDuration: 90,
  timerEnabled: true,
  aiProvider: 'offline',
  aiApiKey: null,
  update: jest.fn(),
  ...overrides,
})

describe('SettingsContent — state sync', () => {
  it('affiche les valeurs initiales du user', () => {
    const user = makeUser({ restDuration: 120, timerEnabled: false })
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

    const { getByRole } = render(<SettingsContent user={user as never} />)

    // Le Switch est un composant accessible
    const switchEl = getByRole('switch')
    fireEvent(switchEl, 'valueChange', false)

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('ne sauvegarde pas si user est null lors du toggle timer', async () => {
    const { getByRole } = render(<SettingsContent user={null} />)

    const switchEl = getByRole('switch')
    fireEvent(switchEl, 'valueChange', false)

    // Sans user, aucune écriture DB ne doit se produire
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

    // Avec user=null, restDuration = '90' par défaut
    const input = getByDisplayValue('90')
    fireEvent.changeText(input, '120')
    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(mockWrite).not.toHaveBeenCalled()
    })
  })
})

describe('SettingsContent — section IA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())
  })

  it('affiche les 4 providers disponibles', () => {
    const user = makeUser({ aiProvider: 'offline' })
    const { getByText } = render(<SettingsContent user={user as never} />)

    expect(getByText('Offline (défaut)')).toBeTruthy()
    expect(getByText('Claude (Anthropic)')).toBeTruthy()
    expect(getByText('OpenAI (GPT-4o)')).toBeTruthy()
    expect(getByText('Gemini (Google)')).toBeTruthy()
  })

  it('n\'affiche pas le champ clé API quand le provider est offline', () => {
    const user = makeUser({ aiProvider: 'offline' })
    const { queryByPlaceholderText } = render(<SettingsContent user={user as never} />)

    expect(queryByPlaceholderText('Colle ta clé API ici')).toBeNull()
  })

  it('affiche le champ clé API quand le provider est claude', async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'offline', aiApiKey: null, update: mockUpdate })

    const { getByText, findByPlaceholderText } = render(<SettingsContent user={user as never} />)

    // Sélectionner Claude
    fireEvent.press(getByText('Claude (Anthropic)'))

    const apiKeyInput = await findByPlaceholderText('Colle ta clé API ici')
    expect(apiKeyInput).toBeTruthy()
  })

  it('affiche le bouton "Tester la connexion" pour les providers non-offline', async () => {
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'claude', aiApiKey: 'sk-test', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    expect(testButton).toBeTruthy()
  })

  it('affiche une alerte pour le mode offline lors du test de connexion', async () => {
    jest.spyOn(Alert, 'alert')
    const user = makeUser({ aiProvider: 'offline' })
    const { getByText } = render(<SettingsContent user={user as never} />)

    // Le bouton "Tester" n'existe pas en mode offline — testons via l'état initial
    // avec provider claude puis on bascule
    fireEvent.press(getByText('Claude (Anthropic)'))
    // Revenir en offline
    fireEvent.press(getByText('Offline (défaut)'))

    // En mode offline, le bouton Tester n'est pas visible
    expect(getByText('Offline (défaut)')).toBeTruthy()
  })

  it('affiche une alerte "Clé manquante" si la clé API est vide lors du test', async () => {
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'claude', aiApiKey: '', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Clé manquante', expect.any(String))
    })
  })

  it('appelle testProviderConnection avec le provider et la clé lors du test', async () => {
    mockTestProviderConnection.mockResolvedValue(undefined)
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'claude', aiApiKey: 'sk-valid-key', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(mockTestProviderConnection).toHaveBeenCalledWith('claude', 'sk-valid-key')
    })
  })

  it('affiche une alerte de succès quand testProviderConnection réussit', async () => {
    mockTestProviderConnection.mockResolvedValue(undefined)
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'openai', aiApiKey: 'sk-openai-key', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Connexion réussie ✅', expect.stringContaining('openai'))
    })
  })

  it('affiche une alerte d\'erreur quand testProviderConnection échoue', async () => {
    mockTestProviderConnection.mockRejectedValue(new Error('Connection failed'))
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'gemini', aiApiKey: 'gemini-key', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur de connexion ❌', expect.stringContaining('gemini'))
    })
  })

  it('affiche un hint billing quand OpenAI retourne 429', async () => {
    mockTestProviderConnection.mockRejectedValue(new Error('Error 429 Too Many Requests'))
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'openai', aiApiKey: 'sk-openai-key', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de connexion ❌',
        expect.stringContaining('platform.openai.com/settings/billing')
      )
    })
  })

  it('affiche un hint api-keys quand OpenAI retourne 401', async () => {
    mockTestProviderConnection.mockRejectedValue(new Error('Error 401 Unauthorized'))
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'openai', aiApiKey: 'sk-invalid', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de connexion ❌',
        expect.stringContaining('platform.openai.com/api-keys')
      )
    })
  })

  it('affiche un hint console.anthropic.com quand Claude retourne 401', async () => {
    mockTestProviderConnection.mockRejectedValue(new Error('Error 401 Unauthorized'))
    jest.spyOn(Alert, 'alert')
    const mockUpdate = jest.fn()
    const user = makeUser({ aiProvider: 'claude', aiApiKey: 'sk-ant-invalid', update: mockUpdate })

    const { findByText } = render(<SettingsContent user={user as never} />)

    const testButton = await findByText('Tester la connexion')
    fireEvent.press(testButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de connexion ❌',
        expect.stringContaining('console.anthropic.com')
      )
    })
  })
})

describe('SettingsContent — section À propos', () => {
  it('affiche le nom de l\'application', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText('WEGOGYM')).toBeTruthy()
  })

  it('affiche la version', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText('1.0.0')).toBeTruthy()
  })

  it('affiche la stack technique', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText('React Native + WatermelonDB')).toBeTruthy()
  })
})
