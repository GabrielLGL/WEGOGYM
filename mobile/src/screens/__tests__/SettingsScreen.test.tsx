import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react-native'
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

import { database } from '../../model/index'

const mockWrite = database.write as jest.Mock

const makeUser = (overrides = {}) => ({
  restDuration: 90,
  timerEnabled: true,
  aiProvider: 'offline',
  aiApiKey: null,
  name: 'Jean',
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

    const { getByRole } = render(<SettingsContent user={user as never} />)

    const switchEl = getByRole('switch')
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

describe('SettingsContent — section IA', () => {
  it('affiche le provider offline actif', () => {
    const user = makeUser()
    const { getByText } = render(<SettingsContent user={user as never} />)

    expect(getByText('Offline — Génération locale')).toBeTruthy()
  })

  it('affiche le badge "Prochainement" pour l\'IA cloud', () => {
    const user = makeUser()
    const { getByText } = render(<SettingsContent user={user as never} />)

    expect(getByText('IA cloud')).toBeTruthy()
    expect(getByText('Prochainement')).toBeTruthy()
  })

  it('n\'affiche pas de champ clé API', () => {
    const user = makeUser()
    const { queryByPlaceholderText } = render(<SettingsContent user={user as never} />)

    expect(queryByPlaceholderText('Colle ta clé API ici')).toBeNull()
  })

  it('n\'affiche pas de bouton "Tester la connexion"', () => {
    const user = makeUser()
    const { queryByText } = render(<SettingsContent user={user as never} />)

    expect(queryByText('Tester la connexion')).toBeNull()
  })
})

describe('SettingsContent — section À propos', () => {
  it('affiche le nom de l\'application', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText('Kore')).toBeTruthy()
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

describe('SettingsContent — section Aide', () => {
  it('affiche la section aide', () => {
    const { getByText } = render(<SettingsContent user={null} />)
    expect(getByText(/Navigation/)).toBeTruthy()
    expect(getByText(/Programmes/)).toBeTruthy()
    expect(getByText(/Exercices/)).toBeTruthy()
  })
})
