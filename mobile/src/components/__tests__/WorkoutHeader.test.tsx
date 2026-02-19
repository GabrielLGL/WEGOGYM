import React from 'react'
import { render } from '@testing-library/react-native'
import { WorkoutHeader } from '../WorkoutHeader'

const defaultProps = {
  formattedTime: '00:00',
  totalVolume: 0,
  completedSets: 0,
  totalSetsTarget: 0,
}

describe('WorkoutHeader', () => {
  describe('rendu du timer', () => {
    it('affiche le temps formaté', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} formattedTime="01:30" />
      )
      expect(getByText('01:30')).toBeTruthy()
    })

    it('affiche "00:00" comme timer initial', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} formattedTime="00:00" />
      )
      expect(getByText('00:00')).toBeTruthy()
    })

    it('affiche un timer de grande valeur correctement', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} formattedTime="1:23:45" />
      )
      expect(getByText('1:23:45')).toBeTruthy()
    })
  })

  describe('rendu du volume total', () => {
    it('affiche le volume avec une décimale', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} totalVolume={1250} />
      )
      expect(getByText('1250.0')).toBeTruthy()
      expect(getByText('kg')).toBeTruthy()
    })

    it('affiche zéro quand aucun volume', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} totalVolume={0} />
      )
      expect(getByText('0.0')).toBeTruthy()
    })

    it('affiche un volume décimal correctement', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} totalVolume={87.5} />
      )
      expect(getByText('87.5')).toBeTruthy()
    })

    it('se rend sans crash avec des valeurs extrêmes', () => {
      expect(() =>
        render(<WorkoutHeader {...defaultProps} formattedTime="99:59:59" totalVolume={99999.9} />)
      ).not.toThrow()
    })
  })

  describe('compteur de séries', () => {
    it('affiche le compteur séries', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} completedSets={3} totalSetsTarget={10} />
      )
      expect(getByText('3 / 10 séries')).toBeTruthy()
    })

    it('affiche 0 / 0 séries quand aucune cible', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} />
      )
      expect(getByText('0 / 0 séries')).toBeTruthy()
    })
  })

  describe('rendu combiné', () => {
    it('affiche timer et volume simultanément', () => {
      const { getByText } = render(
        <WorkoutHeader {...defaultProps} formattedTime="10:42" totalVolume={450.5} />
      )
      expect(getByText('10:42')).toBeTruthy()
      expect(getByText('450.5')).toBeTruthy()
    })
  })
})
