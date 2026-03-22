import React from 'react'
import { render } from '@testing-library/react-native'
import SummaryComparison from '../SummaryComparison'
import type { SessionComparison } from '../../../model/utils/sessionComparisonHelpers'

describe('SummaryComparison', () => {
  const makeComparison = (overrides: Partial<SessionComparison> = {}): SessionComparison => ({
    exercises: [],
    overallVolumeDelta: 0,
    overallVolumeDeltaPercent: 0,
    hasComparison: true,
    ...overrides,
  })

  describe('volume total positif', () => {
    it('devrait afficher la fleche haut et le pourcentage quand le delta est positif', () => {
      const comparison = makeComparison({
        overallVolumeDelta: 500,
        overallVolumeDeltaPercent: 12.5,
      })

      const { getByText } = render(<SummaryComparison comparison={comparison} />)

      expect(getByText(/12\.5%/)).toBeTruthy()
      expect(getByText(/\+500 kg/)).toBeTruthy()
    })
  })

  describe('volume total negatif', () => {
    it('devrait afficher la fleche bas et le pourcentage quand le delta est negatif', () => {
      const comparison = makeComparison({
        overallVolumeDelta: -300,
        overallVolumeDeltaPercent: -8.3,
      })

      const { getByText } = render(<SummaryComparison comparison={comparison} />)

      expect(getByText(/8\.3%/)).toBeTruthy()
      expect(getByText(/-300 kg/)).toBeTruthy()
    })
  })

  describe('volume total a zero', () => {
    it('devrait afficher 0.0% et +0 kg quand le delta est zero', () => {
      const comparison = makeComparison({
        overallVolumeDelta: 0,
        overallVolumeDeltaPercent: 0,
      })

      const { getByText } = render(<SummaryComparison comparison={comparison} />)

      expect(getByText(/0\.0%/)).toBeTruthy()
      expect(getByText(/\+0 kg/)).toBeTruthy()
    })
  })

  describe('exercices avec deltas', () => {
    it('devrait afficher les exercices qui ont des deltas', () => {
      const comparison = makeComparison({
        exercises: [
          {
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            current: { volume: 1000, maxWeight: 100, totalSets: 5, totalReps: 25 },
            previous: { volume: 800, maxWeight: 90, totalSets: 4, totalReps: 20, date: Date.now() - 86400000 },
            deltas: { volume: 200, volumePercent: 25, maxWeight: 10, maxWeightPercent: 11.1 },
          },
          {
            exerciseId: 'ex-2',
            exerciseName: 'Squat',
            current: { volume: 500, maxWeight: 80, totalSets: 3, totalReps: 15 },
            previous: null,
            deltas: null,
          },
        ],
      })

      const { getByText, queryByText } = render(<SummaryComparison comparison={comparison} />)

      // L'exercice avec deltas est affiche
      expect(getByText('Bench Press')).toBeTruthy()
      expect(getByText('+200 kg')).toBeTruthy()
      expect(getByText('max +10 kg')).toBeTruthy()

      // L'exercice sans deltas n'est pas affiche
      expect(queryByText('Squat')).toBeNull()
    })

    it('devrait afficher un delta volume negatif pour un exercice', () => {
      const comparison = makeComparison({
        exercises: [
          {
            exerciseId: 'ex-1',
            exerciseName: 'Deadlift',
            current: { volume: 600, maxWeight: 120, totalSets: 4, totalReps: 16 },
            previous: { volume: 800, maxWeight: 120, totalSets: 5, totalReps: 20, date: Date.now() - 86400000 },
            deltas: { volume: -200, volumePercent: -25, maxWeight: 0, maxWeightPercent: 0 },
          },
        ],
      })

      const { getByText, queryByText } = render(<SummaryComparison comparison={comparison} />)

      expect(getByText('Deadlift')).toBeTruthy()
      expect(getByText('-200 kg')).toBeTruthy()
      // maxWeight === 0 => pas affiche
      expect(queryByText(/max/)).toBeNull()
    })

    it('devrait ne pas afficher le max weight quand il est a zero', () => {
      const comparison = makeComparison({
        exercises: [
          {
            exerciseId: 'ex-1',
            exerciseName: 'Curl',
            current: { volume: 300, maxWeight: 20, totalSets: 3, totalReps: 30 },
            previous: { volume: 250, maxWeight: 20, totalSets: 3, totalReps: 25, date: Date.now() - 86400000 },
            deltas: { volume: 50, volumePercent: 20, maxWeight: 0, maxWeightPercent: 0 },
          },
        ],
      })

      const { queryByText } = render(<SummaryComparison comparison={comparison} />)

      expect(queryByText(/max/)).toBeNull()
    })
  })

  describe('liste vide d exercices', () => {
    it('devrait ne pas crasher avec une liste vide', () => {
      const comparison = makeComparison({ exercises: [] })

      const { getByText } = render(<SummaryComparison comparison={comparison} />)

      // Le titre et le volume total sont toujours affiches
      expect(getByText('Volume total')).toBeTruthy()
    })
  })
})
