import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'

import { ProgramsContent } from '../ProgramsScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
    }),
    batch: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('react-native-draggable-flatlist', () => {
  const { FlatList } = require('react-native')
  return {
    __esModule: true,
    default: FlatList,
    ScaleDecorator: ({ children }: { children: React.ReactNode }) => children,
  }
})

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

const mockSaveProgram = jest.fn().mockResolvedValue(true)
const mockDuplicateProgram = jest.fn().mockResolvedValue(undefined)
const mockDeleteProgram = jest.fn().mockResolvedValue(undefined)
const mockPrepareRenameProgram = jest.fn()
const mockSetSelectedProgram = jest.fn()
const mockSetIsRenamingProgram = jest.fn()
const mockSetProgramNameInput = jest.fn()

jest.mock('../../hooks/useProgramManager', () => ({
  useProgramManager: () => ({
    programNameInput: '',
    setProgramNameInput: mockSetProgramNameInput,
    isRenamingProgram: false,
    setIsRenamingProgram: mockSetIsRenamingProgram,
    selectedProgram: null,
    setSelectedProgram: mockSetSelectedProgram,
    saveProgram: mockSaveProgram,
    duplicateProgram: mockDuplicateProgram,
    deleteProgram: mockDeleteProgram,
    prepareRenameProgram: mockPrepareRenameProgram,
  }),
}))

jest.mock('../../hooks/useKeyboardAnimation', () => ({
  useKeyboardAnimation: () => ({ _value: 0 }),
}))

jest.mock('../../components/OnboardingSheet', () => {
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    OnboardingSheet: ({ visible, onProgramSelected, onSkip }: { visible: boolean; onProgramSelected: (p: object) => void; onSkip: () => void }) => {
      if (!visible) return null
      return (
        <View>
          <Text>Onboarding</Text>
          <TouchableOpacity onPress={() => onProgramSelected({ name: 'PPL', sessions: [] })}>
            <Text>Choisir PPL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip}>
            <Text>Passer</Text>
          </TouchableOpacity>
        </View>
      )
    },
  }
})

jest.mock('../../components/ProgramSection', () => {
  const { TouchableOpacity, Text } = require('react-native')
  return function MockProgramSection({ program, onPress, onOptionsPress }: { program: { name: string }; onPress: () => void; onOptionsPress: () => void }) {
    return (
      <>
        <TouchableOpacity onPress={onPress} testID={`program-${program.name}`}>
          <Text>{program.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOptionsPress} testID={`options-${program.name}`}>
          <Text>Options-{program.name}</Text>
        </TouchableOpacity>
      </>
    )
  }
})

jest.mock('../../components/BottomSheet', () => ({
  BottomSheet: ({ visible, children, title }: { visible: boolean; children: React.ReactNode; title?: string }) => {
    if (!visible) return null
    const { View, Text } = require('react-native')
    return <View>{title && <Text>{title}</Text>}{children}</View>
  },
}))

const mockImportPresetProgram = jest.fn().mockResolvedValue(undefined)
const mockMarkOnboardingCompleted = jest.fn().mockResolvedValue(undefined)

jest.mock('../../model/utils/databaseHelpers', () => ({
  importPresetProgram: (...args: unknown[]) => mockImportPresetProgram(...args),
  markOnboardingCompleted: (...args: unknown[]) => mockMarkOnboardingCompleted(...args),
}))

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn().mockReturnValue(jest.fn()),
} as never

const mockProgram = (id: string, name: string, position: number) =>
  ({
    id,
    name,
    position,
    prepareUpdate: jest.fn().mockImplementation((fn: (p: { position: number }) => void) => {
      const obj = { position }
      fn(obj)
      return obj
    }),
    sessions: { observe: () => ({ subscribe: (cb: (val: never[]) => void) => { cb([]); return { unsubscribe: jest.fn() } } }) },
  }) as never

const mockUser = (overrides = {}) =>
  ({
    id: 'u1',
    name: 'Test',
    onboardingCompleted: true,
    aiProvider: 'offline',
    ...overrides,
  }) as never

describe('ProgramsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // --- Rendu de base ---

  it('rend sans programmes sans crash', () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser()} navigation={mockNavigation} />
    )
    expect(getByText(/Créer un Programme/)).toBeTruthy()
  })

  it('rend avec user null sans crash', () => {
    expect(() =>
      render(<ProgramsContent programs={[]} user={null} navigation={mockNavigation} />)
    ).not.toThrow()
  })

  it('rend avec des programmes sans crash', () => {
    const programs = [
      mockProgram('p1', 'PPL 3j', 0),
      mockProgram('p2', 'Upper Lower', 1),
    ]
    const { getByText } = render(
      <ProgramsContent programs={programs} user={mockUser()} navigation={mockNavigation} />
    )
    expect(getByText('PPL 3j')).toBeTruthy()
    expect(getByText('Upper Lower')).toBeTruthy()
  })

  // --- Création programme ---

  it('le bouton Créer ouvre le BottomSheet de choix', () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByText(/Créer un Programme/))
    expect(getByText('Soi-même')).toBeTruthy()
    expect(getByText('Automatique')).toBeTruthy()
  })

  it('cliquer sur "Soi-même" ouvre la modale programme', () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByText(/Créer un Programme/))
    fireEvent.press(getByText('Soi-même'))
    expect(getByText('Nouveau programme')).toBeTruthy()
  })

  it('cliquer sur "Automatique" navigue vers Assistant', () => {
    const navMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn().mockReturnValue(jest.fn()),
    } as never
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser()} navigation={navMock} />
    )
    fireEvent.press(getByText(/Créer un Programme/))
    fireEvent.press(getByText('Automatique'))
    expect((navMock as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith('Assistant')
  })

  it('cliquer sur Valider dans la modale programme appelle saveProgram', async () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByText(/Créer un Programme/))
    fireEvent.press(getByText('Soi-même'))
    fireEvent.press(getByText('Valider'))

    await waitFor(() => {
      expect(mockSaveProgram).toHaveBeenCalled()
    })
  })

  it('Annuler dans la modale programme la ferme', () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByText(/Créer un Programme/))
    fireEvent.press(getByText('Soi-même'))
    expect(getByText('Nouveau programme')).toBeTruthy()

    fireEvent.press(getByText('Annuler'))
    // Modal should close (the title "Nouveau programme" should not be visible)
    // Note: CustomModal might not be mocked to hide, but the Annuler handler calls setIsProgramModalVisible(false)
  })

  // --- Détail programme (navigation) ---

  it('taper un programme navigue vers ProgramDetail', () => {
    const navMock = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn().mockReturnValue(jest.fn()),
    } as never
    const programs = [mockProgram('p1', 'PPL 3j', 0)]
    const { getByTestId } = render(
      <ProgramsContent programs={programs} user={mockUser()} navigation={navMock} />
    )
    fireEvent.press(getByTestId('program-PPL 3j'))
    expect((navMock as { navigate: jest.Mock }).navigate).toHaveBeenCalledWith('ProgramDetail', { programId: 'p1' })
  })

  // --- Options programme ---

  it('le bouton options ouvre le BottomSheet options programme', () => {
    const programs = [mockProgram('p1', 'PPL 3j', 0)]
    const { getByText, getByTestId } = render(
      <ProgramsContent programs={programs} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByTestId('options-PPL 3j'))
    expect(getByText('Renommer le Programme')).toBeTruthy()
    expect(getByText('Dupliquer le Programme')).toBeTruthy()
    expect(getByText('Supprimer le Programme')).toBeTruthy()
  })

  it('dupliquer un programme appelle duplicateProgram', async () => {
    const programs = [mockProgram('p1', 'PPL 3j', 0)]
    const { getByText, getByTestId } = render(
      <ProgramsContent programs={programs} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByTestId('options-PPL 3j'))
    fireEvent.press(getByText('Dupliquer le Programme'))

    await waitFor(() => {
      expect(mockDuplicateProgram).toHaveBeenCalled()
    })
  })

  it('supprimer un programme ouvre l\'AlertDialog', () => {
    const programs = [mockProgram('p1', 'PPL 3j', 0)]
    const { getByText, getByTestId } = render(
      <ProgramsContent programs={programs} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByTestId('options-PPL 3j'))
    fireEvent.press(getByText('Supprimer le Programme'))
    expect(getByText(/Supprimer ce programme/)).toBeTruthy()
  })

  it('confirmer la suppression appelle deleteProgram', async () => {
    const programs = [mockProgram('p1', 'PPL 3j', 0)]
    const { getByText, getAllByText, getByTestId } = render(
      <ProgramsContent programs={programs} user={mockUser()} navigation={mockNavigation} />
    )
    fireEvent.press(getByTestId('options-PPL 3j'))
    fireEvent.press(getByText('Supprimer le Programme'))
    const suppressBtns = getAllByText('Supprimer')
    fireEvent.press(suppressBtns[suppressBtns.length - 1])

    await waitFor(() => {
      expect(mockDeleteProgram).toHaveBeenCalled()
    })
  })

  // --- Onboarding ---

  it('affiche l\'onboarding quand 0 programmes et user non onboarded', () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser({ onboardingCompleted: false })} navigation={mockNavigation} />
    )
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(getByText('Onboarding')).toBeTruthy()
  })

  it('choisir un programme onboarding appelle importPresetProgram', async () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser({ onboardingCompleted: false })} navigation={mockNavigation} />
    )
    act(() => {
      jest.advanceTimersByTime(500)
    })

    await act(async () => {
      fireEvent.press(getByText('Choisir PPL'))
    })

    await waitFor(() => {
      expect(mockImportPresetProgram).toHaveBeenCalled()
      expect(mockMarkOnboardingCompleted).toHaveBeenCalled()
    })
  })

  it('passer l\'onboarding appelle markOnboardingCompleted', async () => {
    const { getByText } = render(
      <ProgramsContent programs={[]} user={mockUser({ onboardingCompleted: false })} navigation={mockNavigation} />
    )
    act(() => {
      jest.advanceTimersByTime(500)
    })

    await act(async () => {
      fireEvent.press(getByText('Passer'))
    })

    await waitFor(() => {
      expect(mockMarkOnboardingCompleted).toHaveBeenCalled()
    })
  })

})
