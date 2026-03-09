// Mocks AVANT tous les imports
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ProgramSection from '../ProgramSection'
import type Program from '../../model/models/Program'
import type Session from '../../model/models/Session'

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ pipe: jest.fn() }),
      }),
    }),
  },
}))

// --- Helpers de fabrication ---

const makeProgram = (id = 'prog-1', name = 'Programme A'): Program =>
  ({ id, name, observe: jest.fn() } as unknown as Program)

const makeSessions = (count: number): Session[] =>
  Array.from({ length: count }, (_, i) => ({ id: `sess-${i}`, observe: jest.fn() } as unknown as Session))

// ============================================================
// Tests de ProgramSection
// ============================================================

describe('ProgramSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendu', () => {
    it('affiche le nom du programme', () => {
      const program = makeProgram('prog-1', 'Mon Programme')
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={[]}
          onPress={jest.fn()}
          onLongPressProgram={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('Mon Programme')).toBeTruthy()
    })

    it('affiche "Aucune séance" quand sessions est vide', () => {
      const program = makeProgram()
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={[]}
          onPress={jest.fn()}
          onLongPressProgram={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('Aucune séance')).toBeTruthy()
    })

    it('affiche "1 séance" quand sessions a un élément', () => {
      const program = makeProgram()
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={makeSessions(1)}
          onPress={jest.fn()}
          onLongPressProgram={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('1 séance')).toBeTruthy()
    })

    it('affiche "3 séances" (pluriel) quand sessions a 3 éléments', () => {
      const program = makeProgram()
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={makeSessions(3)}
          onPress={jest.fn()}
          onLongPressProgram={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('3 séances')).toBeTruthy()
    })

    it('affiche le bouton options •••', () => {
      const program = makeProgram()
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={[]}
          onPress={jest.fn()}
          onLongPressProgram={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('•••')).toBeTruthy()
    })
  })

  describe('interactions', () => {
    it('appelle onPress quand le corps du programme est pressé', () => {
      const onPress = jest.fn()
      const program = makeProgram('prog-1', 'Push Day')
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={[]}
          onPress={onPress}
          onLongPressProgram={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      fireEvent.press(getByText('Push Day'))

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('appelle onOptionsPress quand le bouton ••• est pressé', () => {
      const onOptionsPress = jest.fn()
      const program = makeProgram()
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={[]}
          onPress={jest.fn()}
          onLongPressProgram={jest.fn()}
          onOptionsPress={onOptionsPress}
        />
      )

      fireEvent.press(getByText('•••'))

      expect(onOptionsPress).toHaveBeenCalledTimes(1)
    })

    it('appelle onLongPressProgram quand le long press est déclenché', () => {
      const onLongPressProgram = jest.fn()
      const program = makeProgram('prog-1', 'Pull Day')
      const { getByText } = render(
        <ProgramSection
          program={program}
          sessions={[]}
          onPress={jest.fn()}
          onLongPressProgram={onLongPressProgram}
          onOptionsPress={jest.fn()}
        />
      )

      fireEvent(getByText('Pull Day'), 'longPress')

      expect(onLongPressProgram).toHaveBeenCalledTimes(1)
    })
  })
})
