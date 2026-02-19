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
    write: jest.fn().mockResolvedValue(undefined),
    batch: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native')
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(c => c),
    Directions: {},
  }
})

jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react')
  const { FlatList } = require('react-native')
  return {
    __esModule: true,
    default: ({ data, renderItem, keyExtractor }: {
      data: object[];
      renderItem: (params: { item: object; drag: jest.Mock; isActive: boolean }) => React.ReactNode;
      keyExtractor: (item: object) => string;
    }) =>
      React.createElement(FlatList, {
        data,
        renderItem: ({ item }: { item: object }) => renderItem({ item, drag: jest.fn(), isActive: false }),
        keyExtractor,
      }),
    ScaleDecorator: ({ children }: { children: React.ReactNode }) => children,
  }
})

jest.mock('../../model/utils/databaseHelpers', () => ({
  importPresetProgram: jest.fn().mockResolvedValue(undefined),
  markOnboardingCompleted: jest.fn().mockResolvedValue(undefined),
  getNextPosition: jest.fn().mockResolvedValue(0),
}))

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { HomeContent } from '../HomeScreen'
import type Program from '../../model/models/Program'

const makeNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
})

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  id: 'prog-1',
  name: 'PPL',
  position: 0,
  observe: jest.fn(),
  sessions: { observe: jest.fn() },
  prepareUpdate: jest.fn(),
  ...overrides,
} as unknown as Program)

describe('HomeContent', () => {
  it('affiche le bouton Créer un Programme', () => {
    const { getByText } = render(
      <HomeContent programs={[]} user={null} navigation={makeNavigation() as never} />
    )
    expect(getByText(/Créer un Programme/)).toBeTruthy()
  })

  it('rend sans crasher avec une liste de programmes vide', () => {
    expect(() =>
      render(<HomeContent programs={[]} user={null} navigation={makeNavigation() as never} />)
    ).not.toThrow()
  })

  it('rend avec plusieurs programmes', () => {
    const programs = [
      makeProgram({ id: 'p1', name: 'PPL' }),
      makeProgram({ id: 'p2', name: 'Full Body' }),
    ]
    const { getAllByText } = render(
      <HomeContent programs={programs} user={null} navigation={makeNavigation() as never} />
    )
    // ProgramSection affiche "PPL (0)" dans un Text imbriqué
    expect(getAllByText(/PPL/).length).toBeGreaterThan(0)
    expect(getAllByText(/Full Body/).length).toBeGreaterThan(0)
  })

  it('ouvre la modale de création programme au clic', () => {
    const { getByText } = render(
      <HomeContent programs={[]} user={null} navigation={makeNavigation() as never} />
    )
    act(() => {
      fireEvent.press(getByText(/Créer un Programme/))
    })
    expect(getByText('Nouveau programme')).toBeTruthy()
  })

  it('ferme la modale programme avec Annuler', () => {
    const { getByText, queryByText } = render(
      <HomeContent programs={[]} user={null} navigation={makeNavigation() as never} />
    )
    act(() => {
      fireEvent.press(getByText(/Créer un Programme/))
    })
    act(() => {
      fireEvent.press(getByText('Annuler'))
    })
    expect(queryByText('Nouveau programme')).toBeNull()
  })

  it('affiche la modale onboarding quand pas de programmes et user sans onboarding', () => {
    jest.useFakeTimers()
    const user = { onboardingCompleted: false, observe: jest.fn() }
    const { getByText } = render(
      <HomeContent programs={[]} user={user as never} navigation={makeNavigation() as never} />
    )
    // Le setTimeout de 400ms déclenche l'onboarding
    act(() => { jest.advanceTimersByTime(500) })
    // Flush les mises à jour d'état du BottomSheet (setShowContent)
    act(() => {})
    // L'onboarding est visible — titre du BottomSheet
    expect(getByText('Choisissez votre programme')).toBeTruthy()
    jest.useRealTimers()
  })

  it('n\'affiche pas l\'onboarding si onboardingCompleted = true', () => {
    jest.useFakeTimers()
    const user = { onboardingCompleted: true, observe: jest.fn() }
    const { queryByText } = render(
      <HomeContent programs={[]} user={user as never} navigation={makeNavigation() as never} />
    )
    act(() => { jest.advanceTimersByTime(500) })
    act(() => {})
    expect(queryByText('Choisissez votre programme')).toBeNull()
    jest.useRealTimers()
  })

  it('n\'affiche pas l\'onboarding si des programmes existent', () => {
    jest.useFakeTimers()
    const user = { onboardingCompleted: false, observe: jest.fn() }
    const programs = [makeProgram()]
    const { queryByText } = render(
      <HomeContent programs={programs} user={user as never} navigation={makeNavigation() as never} />
    )
    act(() => { jest.advanceTimersByTime(500) })
    act(() => {})
    expect(queryByText('Choisissez votre programme')).toBeNull()
    jest.useRealTimers()
  })
})
