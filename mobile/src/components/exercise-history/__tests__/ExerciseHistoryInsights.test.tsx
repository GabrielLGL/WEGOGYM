import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ExerciseHistoryInsights from '../ExerciseHistoryInsights'
import { colors } from '../../../theme'
import { fr } from '../../../i18n/fr'
import type { Translations } from '../../../i18n'
import type { PRPrediction } from '../../../model/utils/prPredictionHelpers'
import type { PlateauData } from '../../../model/utils/plateauHelpers'
import type { OverloadTrend } from '../../../model/utils/progressiveOverloadHelpers'
import type { AlternativeExercise } from '../../../model/utils/exerciseAlternativesHelpers'
import type { VariantSuggestion } from '../../../model/utils/variantHelpers'

const t = fr as Translations

const makeTrend = (overrides: Partial<OverloadTrend> = {}): OverloadTrend => ({
  metric: 'weight',
  trend: 'stable',
  percentChange: 0,
  lastSessions: 2,
  dataPoints: [],
  ...overrides,
})

const makePrediction = (overrides: Partial<PRPrediction> = {}): PRPrediction => ({
  currentBest1RM: 100,
  predicted1RM: 110,
  targetWeight: 105,
  weeksToTarget: 4,
  weeklyGainRate: 1.2,
  dataPoints: 5,
  confidence: 'medium',
  ...overrides,
})

const makePlateau = (overrides: Partial<PlateauData> = {}): PlateauData => ({
  isPlateauing: true,
  sessionsSinceLastPR: 5,
  daysSinceLastProgress: 30,
  currentBest1RM: 100,
  strategies: ['deload', 'vary_reps'],
  ...overrides,
})

const makeAlternative = (overrides: Partial<AlternativeExercise> = {}): AlternativeExercise => ({
  exerciseId: 'alt-1',
  exerciseName: 'Incline Bench',
  sharedMuscles: ['Pectoraux', 'Triceps'],
  matchScore: 0.8,
  totalSets: 24,
  lastUsed: Date.now(),
  ...overrides,
})

const makeVariant = (overrides: Partial<VariantSuggestion> = {}): VariantSuggestion => ({
  exercise: { id: 'var-1', name: 'Close Grip Bench' } as VariantSuggestion['exercise'],
  sharedMuscles: ['Pectoraux', 'Triceps'],
  hasHistory: false,
  similarityScore: 0.7,
  ...overrides,
})

const defaultProps = {
  prediction: null,
  plateauData: null,
  weightTrend: makeTrend(),
  volumeTrend: makeTrend({ metric: 'volume' }),
  alternatives: [],
  variantSuggestions: [],
  colors,
  t,
  onExercisePress: jest.fn(),
}

describe('ExerciseHistoryInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('section surcharge progressive', () => {
    it('devrait ne pas afficher la section quand lastSessions < 3', () => {
      const { queryByText } = render(
        <ExerciseHistoryInsights
          {...defaultProps}
          weightTrend={makeTrend({ lastSessions: 2 })}
          volumeTrend={makeTrend({ lastSessions: 2 })}
        />
      )

      expect(queryByText(t.exerciseHistory.overload.title)).toBeNull()
    })

    it('devrait afficher la section quand lastSessions >= 3', () => {
      const { getByText } = render(
        <ExerciseHistoryInsights
          {...defaultProps}
          weightTrend={makeTrend({ lastSessions: 5, trend: 'up', percentChange: 8.5 })}
          volumeTrend={makeTrend({ lastSessions: 5, trend: 'down', percentChange: -3.2 })}
        />
      )

      expect(getByText(t.exerciseHistory.overload.title)).toBeTruthy()
      expect(getByText(t.exerciseHistory.overload.maxWeight)).toBeTruthy()
      expect(getByText(t.exerciseHistory.overload.volume)).toBeTruthy()
    })

    it('devrait afficher les tendances up/down/stable correctement', () => {
      const { getByText } = render(
        <ExerciseHistoryInsights
          {...defaultProps}
          weightTrend={makeTrend({ lastSessions: 3, trend: 'up', percentChange: 5.0 })}
          volumeTrend={makeTrend({ lastSessions: 3, trend: 'stable', percentChange: 0.0 })}
        />
      )

      expect(getByText(/5\.0%/)).toBeTruthy()
      expect(getByText(/0\.0%/)).toBeTruthy()
    })

    it('devrait afficher le disclaimer avec le nombre de seances', () => {
      const { getByText } = render(
        <ExerciseHistoryInsights
          {...defaultProps}
          weightTrend={makeTrend({ lastSessions: 7, trend: 'up', percentChange: 3 })}
          volumeTrend={makeTrend({ lastSessions: 7 })}
        />
      )

      expect(getByText(/7/)).toBeTruthy()
    })
  })

  describe('section alternatives', () => {
    it('devrait ne pas afficher la section quand la liste est vide', () => {
      const { queryByText } = render(
        <ExerciseHistoryInsights {...defaultProps} alternatives={[]} />
      )

      expect(queryByText(t.exerciseHistory.alternatives.title)).toBeNull()
    })

    it('devrait afficher les exercices alternatifs', () => {
      const alt = makeAlternative()

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} alternatives={[alt]} />
      )

      expect(getByText(t.exerciseHistory.alternatives.title)).toBeTruthy()
      expect(getByText('Incline Bench')).toBeTruthy()
      expect(getByText('Pectoraux, Triceps')).toBeTruthy()
      expect(getByText(/24/)).toBeTruthy()
    })

    it('devrait appeler onExercisePress quand on appuie sur une alternative', () => {
      const onExercisePress = jest.fn()
      const alt = makeAlternative({ exerciseId: 'alt-42' })

      const { getByText } = render(
        <ExerciseHistoryInsights
          {...defaultProps}
          alternatives={[alt]}
          onExercisePress={onExercisePress}
        />
      )

      fireEvent.press(getByText('Incline Bench'))

      expect(onExercisePress).toHaveBeenCalledWith('alt-42')
    })
  })

  describe('section prediction', () => {
    it('devrait ne pas afficher la section quand prediction est null', () => {
      const { queryByText } = render(
        <ExerciseHistoryInsights {...defaultProps} prediction={null} />
      )

      expect(queryByText(t.exerciseHistory.prediction.title)).toBeNull()
    })

    it('devrait afficher le 1RM actuel et le prochain palier', () => {
      const prediction = makePrediction({
        currentBest1RM: 100,
        targetWeight: 105,
      })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} prediction={prediction} />
      )

      expect(getByText(t.exerciseHistory.prediction.title)).toBeTruthy()
      expect(getByText(/100\.0 kg/)).toBeTruthy()
      expect(getByText(/105\.0 kg/)).toBeTruthy()
    })

    it('devrait afficher le nombre de semaines et le gain hebdomadaire', () => {
      const prediction = makePrediction({
        weeksToTarget: 6,
        weeklyGainRate: 0.8,
      })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} prediction={prediction} />
      )

      expect(getByText(/6/)).toBeTruthy()
      expect(getByText(/0\.8/)).toBeTruthy()
    })

    it('devrait afficher tooFar quand weeksToTarget > 52', () => {
      const prediction = makePrediction({ weeksToTarget: 100 })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} prediction={prediction} />
      )

      expect(getByText(t.exerciseHistory.prediction.tooFar)).toBeTruthy()
    })

    it('devrait afficher la confiance low', () => {
      const prediction = makePrediction({ confidence: 'low', dataPoints: 3 })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} prediction={prediction} />
      )

      expect(getByText(t.exerciseHistory.prediction.confidenceLow)).toBeTruthy()
    })

    it('devrait afficher la confiance high', () => {
      const prediction = makePrediction({ confidence: 'high', dataPoints: 12 })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} prediction={prediction} />
      )

      expect(getByText(t.exerciseHistory.prediction.confidenceHigh)).toBeTruthy()
    })
  })

  describe('section plateau', () => {
    it('devrait ne pas afficher la section quand plateauData est null', () => {
      const { queryByText } = render(
        <ExerciseHistoryInsights {...defaultProps} plateauData={null} />
      )

      expect(queryByText(t.exerciseHistory.plateau.title)).toBeNull()
    })

    it('devrait ne pas afficher la section quand isPlateauing est false', () => {
      const plateau = makePlateau({ isPlateauing: false })

      const { queryByText } = render(
        <ExerciseHistoryInsights {...defaultProps} plateauData={plateau} />
      )

      expect(queryByText(t.exerciseHistory.plateau.title)).toBeNull()
    })

    it('devrait afficher l alerte avec le nombre de seances et jours', () => {
      const plateau = makePlateau({
        sessionsSinceLastPR: 8,
        daysSinceLastProgress: 45,
        strategies: ['deload'],
      })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} plateauData={plateau} />
      )

      expect(getByText(t.exerciseHistory.plateau.title)).toBeTruthy()
      expect(getByText(/8.*45/)).toBeTruthy()
    })

    it('devrait afficher les strategies de debloquage', () => {
      const plateau = makePlateau({
        strategies: ['deload', 'progressive'],
      })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} plateauData={plateau} />
      )

      expect(getByText(t.exerciseHistory.plateau.strategies.deload)).toBeTruthy()
      expect(getByText(t.exerciseHistory.plateau.strategies.progressive)).toBeTruthy()
    })
  })

  describe('section variantes', () => {
    it('devrait ne pas afficher la section quand la liste est vide', () => {
      const { queryByText } = render(
        <ExerciseHistoryInsights {...defaultProps} variantSuggestions={[]} />
      )

      expect(queryByText(t.exerciseHistory.variants.title)).toBeNull()
    })

    it('devrait afficher les variantes avec le badge deja pratique', () => {
      const variant = makeVariant({ hasHistory: true })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} variantSuggestions={[variant]} />
      )

      expect(getByText(t.exerciseHistory.variants.title)).toBeTruthy()
      expect(getByText('Close Grip Bench')).toBeTruthy()
      expect(getByText(t.exerciseHistory.variants.done)).toBeTruthy()
    })

    it('devrait afficher les variantes avec le badge a decouvrir', () => {
      const variant = makeVariant({ hasHistory: false })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} variantSuggestions={[variant]} />
      )

      expect(getByText(t.exerciseHistory.variants.discover)).toBeTruthy()
    })

    it('devrait appeler onExercisePress quand on appuie sur une variante', () => {
      const onExercisePress = jest.fn()
      const variant = makeVariant()

      const { getByText } = render(
        <ExerciseHistoryInsights
          {...defaultProps}
          variantSuggestions={[variant]}
          onExercisePress={onExercisePress}
        />
      )

      fireEvent.press(getByText('Close Grip Bench'))

      expect(onExercisePress).toHaveBeenCalledWith('var-1')
    })

    it('devrait afficher les muscles partages', () => {
      const variant = makeVariant({ sharedMuscles: ['Pectoraux', 'Epaules'] })

      const { getByText } = render(
        <ExerciseHistoryInsights {...defaultProps} variantSuggestions={[variant]} />
      )

      expect(getByText('Pectoraux · Epaules')).toBeTruthy()
    })
  })
})
