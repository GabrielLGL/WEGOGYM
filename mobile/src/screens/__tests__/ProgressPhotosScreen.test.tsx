import React from 'react'
import { render } from '@testing-library/react-native'

const mockCaptured: { Base: React.ComponentType<any> | null } = { Base: null }

jest.mock('@nozbe/with-observables', () => ({
  __esModule: true,
  default: () => (Component: any) => {
    mockCaptured.Base = Component
    return Component
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn(() => ({ query: () => ({ observe: () => ({}) }) })) },
}))

jest.mock('expo-image', () => ({
  Image: 'Image',
}))

jest.mock('../../services/progressPhotoService', () => ({
  capturePhoto: jest.fn(),
  pickPhotoFromGallery: jest.fn(),
  deletePhoto: jest.fn(),
}))

jest.mock('../../components/BottomSheet', () => ({
  BottomSheet: ({ children, visible }: any) =>
    visible ? children : null,
}))

jest.mock('../../components/AlertDialog', () => ({
  AlertDialog: () => null,
}))

jest.mock('../../components/Button', () => ({
  Button: ({ children, onPress }: any) => {
    const { TouchableOpacity, Text } = require('react-native')
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{children}</Text>
      </TouchableOpacity>
    )
  },
}))

require('../ProgressPhotosScreen')

const makePhoto = (id: string, daysAgo = 0, category: string | null = null) =>
  ({
    id,
    photoUri: `file:///photo-${id}.jpg`,
    date: Date.now() - daysAgo * 86400000,
    category,
    note: null,
  }) as any

describe('ProgressPhotosScreenBase', () => {
  const Base = () => mockCaptured.Base!

  it('affiche l état vide sans photos', () => {
    const Component = Base()
    const { getByText } = render(<Component photos={[]} />)
    expect(getByText('Aucune photo')).toBeTruthy()
  })

  it('affiche le bouton ajouter', () => {
    const Component = Base()
    const { getByText } = render(<Component photos={[]} />)
    expect(getByText('Prendre une photo')).toBeTruthy()
  })

  it('affiche la grille avec des photos', () => {
    const Component = Base()
    const photos = [
      makePhoto('p1', 0, 'front'),
      makePhoto('p2', 7, 'side'),
      makePhoto('p3', 14, 'back'),
    ]
    const { getByText } = render(<Component photos={photos} />)
    expect(getByText('Historique')).toBeTruthy()
  })

  it('affiche les filtres de catégorie', () => {
    const Component = Base()
    const { getByText } = render(<Component photos={[]} />)
    expect(getByText('Toutes')).toBeTruthy()
    expect(getByText('Face')).toBeTruthy()
  })
})
