import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { ChipSelector } from '../ChipSelector'

import * as Haptics from 'expo-haptics'

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Error: 'Error',
  },
}))

const ITEMS_FIXTURE = ['Pectoraux', 'Biceps', 'Quadriceps', 'Épaules']

describe('ChipSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendu initial', () => {
    it('should rendre tous les items de la liste', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
        />
      )

      ITEMS_FIXTURE.forEach((item) => {
        expect(getByText(item)).toBeTruthy()
      })
    })

    it('should rendre le chip "Tous" par défaut (allowNone=true)', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
        />
      )

      expect(getByText('Tous')).toBeTruthy()
    })

    it('should rendre un noneLabel personnalisé', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
          noneLabel="Tous muscles"
        />
      )

      expect(getByText('Tous muscles')).toBeTruthy()
    })

    it('should ne pas rendre le chip "Tous" quand allowNone=false', () => {
      const { queryByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
          allowNone={false}
        />
      )

      expect(queryByText('Tous')).toBeNull()
    })

    it('should rendre une liste vide sans erreur', () => {
      const { queryByText } = render(
        <ChipSelector
          items={[]}
          selectedValue={null}
          onChange={jest.fn()}
        />
      )

      expect(queryByText('Pectoraux')).toBeNull()
      expect(queryByText('Tous')).toBeTruthy()
    })
  })

  describe('sélection', () => {
    it('should appeler onChange avec la valeur sélectionnée au tap sur un item', () => {
      const onChange = jest.fn()
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={onChange}
        />
      )

      fireEvent.press(getByText('Pectoraux'))

      expect(onChange).toHaveBeenCalledWith('Pectoraux')
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('should appeler onChange avec null au tap sur le chip "Tous"', () => {
      const onChange = jest.fn()
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue="Pectoraux"
          onChange={onChange}
        />
      )

      fireEvent.press(getByText('Tous'))

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('should déclencher un haptic Light lors de la sélection', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
        />
      )

      fireEvent.press(getByText('Biceps'))

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      )
    })

    it('should déclencher un haptic Light au tap sur "Tous"', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue="Pectoraux"
          onChange={jest.fn()}
        />
      )

      fireEvent.press(getByText('Tous'))

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      )
    })

    it('should appeler onChange avec chaque item différent', () => {
      const onChange = jest.fn()
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={onChange}
        />
      )

      fireEvent.press(getByText('Quadriceps'))
      expect(onChange).toHaveBeenLastCalledWith('Quadriceps')

      fireEvent.press(getByText('Épaules'))
      expect(onChange).toHaveBeenLastCalledWith('Épaules')
    })
  })

  describe('état de sélection', () => {
    it('should rendre tous les items (le style est géré par le composant)', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue="Pectoraux"
          onChange={jest.fn()}
        />
      )

      // Le composant doit afficher les items correctement
      expect(getByText('Pectoraux')).toBeTruthy()
      expect(getByText('Biceps')).toBeTruthy()
    })

    it('should rendre correctement avec selectedValue=null (chip "Tous" actif)', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
        />
      )

      expect(getByText('Tous')).toBeTruthy()
    })
  })

  describe('style personnalisé', () => {
    it('should accepter une prop style sans crash', () => {
      const { getByText } = render(
        <ChipSelector
          items={ITEMS_FIXTURE}
          selectedValue={null}
          onChange={jest.fn()}
          style={{ marginTop: 10 }}
        />
      )

      expect(getByText('Tous')).toBeTruthy()
    })
  })

  describe('noneLabel et allowNone combinés', () => {
    it('should rendre le label personnalisé quand allowNone=true', () => {
      const { getByText, queryByText } = render(
        <ChipSelector
          items={['A', 'B']}
          selectedValue={null}
          onChange={jest.fn()}
          allowNone={true}
          noneLabel="Tout afficher"
        />
      )

      expect(getByText('Tout afficher')).toBeTruthy()
      expect(queryByText('Tous')).toBeNull()
    })

    it('should ne pas rendre de chip "none" quand allowNone=false même avec noneLabel', () => {
      const { queryByText } = render(
        <ChipSelector
          items={['A', 'B']}
          selectedValue={null}
          onChange={jest.fn()}
          allowNone={false}
          noneLabel="Tout afficher"
        />
      )

      expect(queryByText('Tout afficher')).toBeNull()
    })
  })
})
