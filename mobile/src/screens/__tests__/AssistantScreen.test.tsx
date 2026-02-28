import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

const mockGeneratePlan = jest.fn().mockResolvedValue({ plan: null, usedFallback: false })

jest.mock('../../services/ai/aiService', () => ({
  generatePlan: (...args: unknown[]) => mockGeneratePlan(...args),
}))

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}))

import { AssistantScreenInner } from '../AssistantScreen'

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as never

const mockRoute = (params?: { sessionMode?: { targetProgramId: string } }) =>
  ({ params, key: 'Assistant', name: 'Assistant' }) as never

const mockUser = (overrides = {}) =>
  ({
    id: 'u1',
    name: 'Test',
    aiProvider: 'offline',
    aiApiKey: null,
    userLevel: 'intermediate',
    ...overrides,
  }) as never

const mockProgram = (id: string, name: string) =>
  ({ id, name }) as never

// Helper to press an option and flush animation timers
const pressAndFlush = (element: ReturnType<typeof render>, text: string) => {
  fireEvent.press(element.getByText(text))
  act(() => { jest.runAllTimers() })
}

describe('AssistantScreenInner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('rend sans crash avec user et programmes', () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[mockProgram('p1', 'PPL')]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText('Quel est ton objectif ?')).toBeTruthy()
  })

  it('rend avec user null sans crash', () => {
    expect(() =>
      render(
        <AssistantScreenInner
          programs={[]}
          user={null}
          navigation={mockNavigation}
          route={mockRoute()}
        />
      )
    ).not.toThrow()
  })

  it('affiche la première question du wizard (objectif)', () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText('Quel est ton objectif ?')).toBeTruthy()
  })

  it('affiche les options objectif', () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText('Hypertrophie')).toBeTruthy()
    expect(getByText('Force')).toBeTruthy()
    expect(getByText('Renforcement musculaire')).toBeTruthy()
    expect(getByText('Cardio')).toBeTruthy()
  })

  it('affiche le subtitle de la première étape', () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText(/Détermine les exercices/)).toBeTruthy()
  })

  it('affiche le badge provider Offline', () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText(/Offline/)).toBeTruthy()
  })

  it("affiche le compteur d'étapes", () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText(/1 \//)).toBeTruthy()
  })

  it('affiche le badge provider Gemini', () => {
    const { getByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser({ aiProvider: 'gemini' })}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )
    expect(getByText(/Gemini/)).toBeTruthy()
  })

  it('navigue à l\'étape équipement en sélectionnant un objectif', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')

    expect(result.getByText('Quel équipement as-tu ?')).toBeTruthy()
  })

  it('affiche le subtitle de l\'étape équipement', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')

    expect(result.getByText(/Seuls les exercices compatibles/)).toBeTruthy()
  })

  it('affiche les options équipement avec bouton Suivant', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')

    expect(result.getByText('Haltères')).toBeTruthy()
    expect(result.getByText('Machines')).toBeTruthy()
    expect(result.getByText('Suivant →')).toBeTruthy()
  })

  it('toggle un équipement et avance vers durée avec Suivant', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')

    expect(result.getByText('Durée souhaitée par séance ?')).toBeTruthy()
  })

  it('affiche le subtitle de l\'étape durée', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')

    expect(result.getByText(/Ajuste le nombre d'exercices/)).toBeTruthy()
  })

  it('les options durée affichent les sous-textes exercices', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')

    expect(result.getByText('4–5 exercices')).toBeTruthy()
    expect(result.getByText('5–7 exercices')).toBeTruthy()
  })

  it('bouton retour revient à l\'étape précédente', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    expect(result.getByText('Quel équipement as-tu ?')).toBeTruthy()

    pressAndFlush(result, '←')
    expect(result.getByText('Quel est ton objectif ?')).toBeTruthy()
  })

  it('pas de bouton retour à l\'étape 1', () => {
    const { queryByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    expect(queryByText('←')).toBeNull()
  })

  it('bouton Recommencer visible après step 1', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    expect(result.getByText('Recommencer')).toBeTruthy()
  })

  it('bouton Recommencer pas visible à l\'étape 1', () => {
    const { queryByText } = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    expect(queryByText('Recommencer')).toBeNull()
  })

  it('Recommencer reset le wizard si étape <= 2', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Recommencer'))
    expect(result.getByText('Quel est ton objectif ?')).toBeTruthy()
  })

  it('Recommencer ouvre AlertDialog si étape > 2', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    // Step 1: goal
    pressAndFlush(result, 'Hypertrophie')
    // Step 2: equipment
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    // Step 3: duration
    pressAndFlush(result, '60 min')
    // Now at step 4 (split), index 3 > 2

    fireEvent.press(result.getByText('Recommencer'))

    expect(result.getByText('Recommencer ?')).toBeTruthy()
    expect(result.getByText('Ta progression actuelle sera perdue.')).toBeTruthy()
  })

  it('confirmer Recommencer reset le wizard', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')
    fireEvent.press(result.getByText('Recommencer'))

    // Confirm button in AlertDialog
    const recommencerBtns = result.getAllByText('Recommencer')
    fireEvent.press(recommencerBtns[recommencerBtns.length - 1])

    expect(result.getByText('Quel est ton objectif ?')).toBeTruthy()
  })

  it('mode programme : passe par split, phase, recovery, injuries, days, focus', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    // Goal
    pressAndFlush(result, 'Hypertrophie')
    // Equipment
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    // Duration
    pressAndFlush(result, '60 min')
    // Split
    expect(result.getByText('Quel type de programme ?')).toBeTruthy()
    expect(result.getByText(/Détermine comment les muscles/)).toBeTruthy()
    pressAndFlush(result, 'PPL')
    // Phase
    expect(result.getByText('Dans quelle phase es-tu ?')).toBeTruthy()
    pressAndFlush(result, 'Prise de masse')
    // Recovery
    expect(result.getByText('Comment est ta récupération ?')).toBeTruthy()
    pressAndFlush(result, 'Normale')
    // Injuries
    expect(result.getByText('As-tu des zones sensibles ?')).toBeTruthy()
    fireEvent.press(result.getByText('Aucune'))
    pressAndFlush(result, 'Suivant →')
    // Days per week
    expect(result.getByText("Combien de jours d'entraînement par semaine ?")).toBeTruthy()
    pressAndFlush(result, '3 jours')
    // Muscles focus
    expect(result.getByText('Muscles à prioriser ?')).toBeTruthy()
  })

  it('mode programme : pas d\'étape niveau ni âge', () => {
    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')
    // Should be split step, not level/age
    expect(result.getByText('Quel type de programme ?')).toBeTruthy()
  })

  it('mode séance via route params : affiche 4 étapes', () => {
    const result = render(
      <AssistantScreenInner
        programs={[mockProgram('p1', 'PPL')]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute({ sessionMode: { targetProgramId: 'p1' } })}
      />
    )

    // Step 1: goal
    expect(result.getByText('Quel est ton objectif ?')).toBeTruthy()
    pressAndFlush(result, 'Hypertrophie')
    // Step 2: equipment
    expect(result.getByText('Quel équipement as-tu ?')).toBeTruthy()
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    // Step 3: duration
    expect(result.getByText('Durée souhaitée par séance ?')).toBeTruthy()
    pressAndFlush(result, '60 min')
    // Step 4: muscle groups
    expect(result.getByText("Quels groupes musculaires aujourd'hui ?")).toBeTruthy()
    expect(result.getByText('Pectoraux')).toBeTruthy()
    expect(result.getByText('Dos')).toBeTruthy()
  })

  it('mode séance : subtitle muscle groups affiché', () => {
    const result = render(
      <AssistantScreenInner
        programs={[mockProgram('p1', 'PPL')]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute({ sessionMode: { targetProgramId: 'p1' } })}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')

    expect(result.getByText(/La séance sera construite autour de ces muscles/)).toBeTruthy()
  })

  it('mode séance : pas d\'étape split ni phase', () => {
    const result = render(
      <AssistantScreenInner
        programs={[mockProgram('p1', 'PPL')]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute({ sessionMode: { targetProgramId: 'p1' } })}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')

    // Should be muscle groups, not split
    expect(result.getByText("Quels groupes musculaires aujourd'hui ?")).toBeTruthy()
  })

  it('sélectionner la dernière étape déclenche la génération', async () => {
    mockGeneratePlan.mockResolvedValueOnce({
      plan: { name: 'PPL Gen', sessions: [] },
      usedFallback: false,
    })

    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    // Goal → equipment → duration → split (Full Body) → phase → recovery → injuries → days → focus
    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')
    pressAndFlush(result, 'Full Body')
    pressAndFlush(result, 'Prise de masse')
    pressAndFlush(result, 'Normale')
    fireEvent.press(result.getByText('Aucune'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '3 jours')
    // Muscles focus (last step) → Suivant will trigger generate
    pressAndFlush(result, 'Suivant →')

    await waitFor(() => {
      expect(mockGeneratePlan).toHaveBeenCalled()
    })
  })

  it('génération injecte le niveau depuis user.userLevel', async () => {
    mockGeneratePlan.mockResolvedValueOnce({
      plan: { name: 'Gen', sessions: [] },
      usedFallback: false,
    })

    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser({ userLevel: 'beginner' })}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')
    pressAndFlush(result, 'Full Body')
    pressAndFlush(result, 'Prise de masse')
    pressAndFlush(result, 'Normale')
    fireEvent.press(result.getByText('Aucune'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '3 jours')
    pressAndFlush(result, 'Suivant →')

    await waitFor(() => {
      expect(mockGeneratePlan).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'débutant' }),
        expect.anything()
      )
    })
  })

  it('génération avec userLevel null utilise intermédiaire par défaut', async () => {
    mockGeneratePlan.mockResolvedValueOnce({
      plan: { name: 'Gen', sessions: [] },
      usedFallback: false,
    })

    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser({ userLevel: null })}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')
    pressAndFlush(result, 'Full Body')
    pressAndFlush(result, 'Prise de masse')
    pressAndFlush(result, 'Normale')
    fireEvent.press(result.getByText('Aucune'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '3 jours')
    pressAndFlush(result, 'Suivant →')

    await waitFor(() => {
      expect(mockGeneratePlan).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'intermédiaire' }),
        expect.anything()
      )
    })
  })

  it('erreur de génération affiche une alerte', async () => {
    mockGeneratePlan.mockRejectedValueOnce(new Error('API down'))

    const result = render(
      <AssistantScreenInner
        programs={[]}
        user={mockUser()}
        navigation={mockNavigation}
        route={mockRoute()}
      />
    )

    pressAndFlush(result, 'Hypertrophie')
    fireEvent.press(result.getByText('Haltères'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '60 min')
    pressAndFlush(result, 'Full Body')
    pressAndFlush(result, 'Prise de masse')
    pressAndFlush(result, 'Normale')
    fireEvent.press(result.getByText('Aucune'))
    pressAndFlush(result, 'Suivant →')
    pressAndFlush(result, '3 jours')
    pressAndFlush(result, 'Suivant →')

    await waitFor(() => {
      expect(result.getByText(/Impossible de générer/)).toBeTruthy()
    })
  })
})
