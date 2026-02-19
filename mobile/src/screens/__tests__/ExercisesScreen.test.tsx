// Mocks AVANT les imports
jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
        fetch: jest.fn().mockResolvedValue([]),
        fetchCount: jest.fn().mockResolvedValue(0),
      }),
    }),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    addListener: jest.fn(() => jest.fn()),
    navigate: jest.fn(),
  }),
}))

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { ExercisesContent } from '../ExercisesScreen'
import type Exercise from '../../model/models/Exercise'

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 'ex-1',
  name: 'Développé couché',
  muscles: ['Pecs', 'Triceps'],
  equipment: 'Poids libre',
  isCustom: false,
  _muscles: '["Pecs","Triceps"]',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

describe('ExercisesContent', () => {
  it('affiche le bouton de recherche', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    expect(getByText(/Rechercher un exercice/)).toBeTruthy()
  })

  it('affiche le bouton créer un exercice', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    expect(getByText('+ Créer un exercice')).toBeTruthy()
  })

  it('affiche le message vide quand pas d\'exercices', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    expect(getByText('Aucun exercice trouvé.')).toBeTruthy()
  })

  it('affiche la liste des exercices', () => {
    const exercises = [
      makeExercise({ id: 'ex-1', name: 'Développé couché' }),
      makeExercise({ id: 'ex-2', name: 'Squat Arrière', muscles: ['Quadriceps'], _muscles: '["Quadriceps"]' }),
    ]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    expect(getByText('Développé couché')).toBeTruthy()
    expect(getByText('Squat Arrière')).toBeTruthy()
  })

  it('affiche les muscles et l\'équipement des exercices', () => {
    const exercises = [makeExercise()]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    expect(getByText(/Pecs.*Triceps/)).toBeTruthy()
  })

  it('ouvre la barre de recherche au clic', () => {
    const { getByText, queryByText } = render(<ExercisesContent exercises={[]} />)
    fireEvent.press(getByText(/Rechercher un exercice/))
    // La barre de recherche apparaît (le texte "Tapez le nom" est dans le placeholder)
    expect(queryByText(/Rechercher un exercice/)).toBeNull()
  })

  it('ferme la barre de recherche avec le bouton Fermer', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    fireEvent.press(getByText(/Rechercher un exercice/))
    fireEvent.press(getByText('Fermer'))
    expect(getByText(/Rechercher un exercice/)).toBeTruthy()
  })

  it('ouvre la modale d\'ajout au clic sur Créer', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    act(() => {
      fireEvent.press(getByText('+ Créer un exercice'))
    })
    expect(getByText('Annuler')).toBeTruthy()
  })

  it('ferme la modale d\'ajout au clic Annuler', () => {
    const { getByText, queryByText } = render(<ExercisesContent exercises={[]} />)
    act(() => {
      fireEvent.press(getByText('+ Créer un exercice'))
    })
    act(() => {
      fireEvent.press(getByText('Annuler'))
    })
    // La liste vide est de nouveau visible
    expect(getByText('Aucun exercice trouvé.')).toBeTruthy()
    expect(queryByText('Annuler')).toBeNull()
  })

  it('affiche les chips muscles dans la modale d\'ajout', () => {
    const { getAllByText, getByText } = render(<ExercisesContent exercises={[]} />)
    act(() => {
      fireEvent.press(getByText('+ Créer un exercice'))
    })
    // ChipSelector dans le header et dans la modale partagent les mêmes labels
    expect(getAllByText('Pecs').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Dos').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le bouton options (•••) pour chaque exercice', () => {
    const exercises = [
      makeExercise({ id: 'ex-1', name: 'Squat' }),
      makeExercise({ id: 'ex-2', name: 'Développé couché' }),
    ]
    const { getAllByText } = render(<ExercisesContent exercises={exercises} />)
    // Un bouton ••• par exercice
    expect(getAllByText('•••').length).toBe(2)
  })
})
