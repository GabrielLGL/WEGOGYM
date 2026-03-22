import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ExerciseHistoryStats from '../ExerciseHistoryStats'
import { colors } from '../../../theme'
import { fr } from '../../../i18n/fr'
import type { Translations } from '../../../i18n'
import type { ExerciseSessionStat } from '../../../model/utils/exerciseStatsUtils'
import type { RepMaxEstimate } from '../../../model/utils/repMaxHelpers'

const t = fr as Translations

const makeStat = (overrides: Partial<ExerciseSessionStat> = {}): ExerciseSessionStat => ({
  historyId: 'hist-1',
  sessionName: 'Push Day',
  startTime: new Date('2026-03-01T10:00:00'),
  maxWeight: 80,
  sets: [
    { weight: 60, reps: 10, setOrder: 1 },
    { weight: 70, reps: 8, setOrder: 2 },
    { weight: 80, reps: 6, setOrder: 3 },
  ],
  ...overrides,
})

const makeRepMax = (overrides: Partial<RepMaxEstimate> = {}): RepMaxEstimate => ({
  estimated1RM: 95,
  estimated3RM: 88,
  estimated5RM: 82,
  bestWeight: 80,
  bestReps: 6,
  ...overrides,
})

const defaultProps = {
  pr: { weight: 80, reps: 6 },
  oneRM: 95,
  repMaxData: null,
  statsForExercise: [],
  reversedStats: [],
  colors,
  t,
  language: 'fr',
  onHistoryPress: jest.fn(),
}

describe('ExerciseHistoryStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('carte PR', () => {
    it('devrait afficher le poids et les reps du PR', () => {
      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} pr={{ weight: 100, reps: 5 }} oneRM={115} />
      )

      expect(getByText(/100.*kg.*5.*reps/)).toBeTruthy()
    })

    it('devrait afficher le 1RM estime', () => {
      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} oneRM={115} />
      )

      expect(getByText(/115/)).toBeTruthy()
    })

    it('devrait afficher un tiret quand oneRM est null', () => {
      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} oneRM={null} />
      )

      expect(getByText(/—/)).toBeTruthy()
    })

    it('devrait afficher le message vide quand pr est null', () => {
      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} pr={null} oneRM={null} />
      )

      expect(getByText(t.exerciseHistory.prEmpty)).toBeTruthy()
    })
  })

  describe('carte rep max estimator', () => {
    it('devrait ne pas afficher la section quand repMaxData est null', () => {
      const { queryByText } = render(
        <ExerciseHistoryStats {...defaultProps} repMaxData={null} />
      )

      expect(queryByText(t.exerciseHistory.repMax.title)).toBeNull()
    })

    it('devrait afficher les estimations 1RM, 3RM et 5RM', () => {
      const repMax = makeRepMax({
        estimated1RM: 100,
        estimated3RM: 92,
        estimated5RM: 85,
      })

      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} repMaxData={repMax} />
      )

      expect(getByText(t.exerciseHistory.repMax.title)).toBeTruthy()
      expect(getByText(/100.*kg/)).toBeTruthy()
      expect(getByText(/92.*kg/)).toBeTruthy()
      expect(getByText(/85.*kg/)).toBeTruthy()
    })

    it('devrait afficher le meilleur set', () => {
      const repMax = makeRepMax({ bestWeight: 80, bestReps: 6 })

      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} repMaxData={repMax} />
      )

      // Le meilleur set affiche "Meilleur set : 80 kg × 6"
      expect(getByText(/Meilleur set.*80.*6/)).toBeTruthy()
    })

    it('devrait afficher le disclaimer', () => {
      const repMax = makeRepMax()

      const { getByText } = render(
        <ExerciseHistoryStats {...defaultProps} repMaxData={repMax} />
      )

      expect(getByText(t.exerciseHistory.repMax.disclaimer)).toBeTruthy()
    })
  })

  describe('historique complet', () => {
    it('devrait afficher le nombre de seances dans le titre', () => {
      const stats = [makeStat(), makeStat({ historyId: 'hist-2' })]

      const { getByText } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          statsForExercise={stats}
          reversedStats={[...stats].reverse()}
        />
      )

      expect(getByText(/2.*séances/)).toBeTruthy()
    })

    it('devrait afficher seance au singulier pour 1 seance', () => {
      const stats = [makeStat()]

      const { getByText } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          statsForExercise={stats}
          reversedStats={stats}
        />
      )

      expect(getByText(/1.*séance/)).toBeTruthy()
    })

    it('devrait afficher l etat vide quand il n y a pas d historique', () => {
      const { getByText } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          statsForExercise={[]}
          reversedStats={[]}
        />
      )

      expect(getByText(t.exerciseHistory.noHistory)).toBeTruthy()
    })

    it('devrait afficher le nom de session et la date', () => {
      const stat = makeStat({
        sessionName: 'Upper Body',
        startTime: new Date('2026-03-15T14:00:00'),
      })

      const { getByText } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          statsForExercise={[stat]}
          reversedStats={[stat]}
        />
      )

      expect(getByText('Upper Body')).toBeTruthy()
      expect(getByText(/15.*mars.*2026/)).toBeTruthy()
    })

    it('devrait afficher les sets avec poids et reps', () => {
      const stat = makeStat({
        sets: [
          { weight: 60, reps: 10, setOrder: 1 },
          { weight: 0, reps: 15, setOrder: 2 },
        ],
      })

      const { getByText } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          statsForExercise={[stat]}
          reversedStats={[stat]}
        />
      )

      expect(getByText(/60.*kg.*10/)).toBeTruthy()
      // poids = 0 => affiche "PC" (poids de corps)
      expect(getByText(/PC.*15/)).toBeTruthy()
    })

    it('devrait appeler onHistoryPress quand on appuie sur le bouton edit', () => {
      const onHistoryPress = jest.fn()
      const stat = makeStat({ historyId: 'hist-42' })

      const { getByTestId } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          statsForExercise={[stat]}
          reversedStats={[stat]}
          onHistoryPress={onHistoryPress}
        />
      )

      // L'icone est mockee en tant que View avec testID="icon-create-outline"
      // On presse directement le testID, fireEvent remonte au parent TouchableOpacity
      fireEvent.press(getByTestId('icon-create-outline'))

      expect(onHistoryPress).toHaveBeenCalledWith('hist-42')
    })
  })

  describe('localisation de la date', () => {
    it('devrait utiliser la locale anglaise quand language est en', () => {
      const stat = makeStat({
        startTime: new Date('2026-03-15T14:00:00'),
      })

      const { getByText } = render(
        <ExerciseHistoryStats
          {...defaultProps}
          language="en"
          statsForExercise={[stat]}
          reversedStats={[stat]}
        />
      )

      // En anglais, "March 15, 2026"
      expect(getByText(/March.*15.*2026/)).toBeTruthy()
    })
  })
})
