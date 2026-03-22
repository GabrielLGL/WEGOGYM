import React from 'react'
import { render } from '@testing-library/react-native'
import SummaryExerciseList from '../SummaryExerciseList'
import type { RecapExerciseData, RecapComparisonData } from '../../../types/workout'

describe('SummaryExerciseList', () => {
  const makeExercise = (overrides: Partial<RecapExerciseData> = {}): RecapExerciseData => ({
    exerciseId: 'ex-1',
    exerciseName: 'Bench Press',
    setsValidated: 3,
    setsTarget: 3,
    sets: [
      { reps: 10, weight: 60 },
      { reps: 8, weight: 70 },
    ],
    prevMaxWeight: 65,
    currMaxWeight: 70,
    muscles: ['Pectoraux'],
    ...overrides,
  })

  const makeComparison = (overrides: Partial<RecapComparisonData> = {}): RecapComparisonData => ({
    prevVolume: 2000,
    currVolume: 2500,
    volumeGain: 500,
    ...overrides,
  })

  describe('liste vide', () => {
    it('devrait retourner null quand recapExercises est vide', () => {
      const { toJSON } = render(
        <SummaryExerciseList
          recapExercises={[]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      expect(toJSON()).toBeNull()
    })
  })

  describe('section ce que tu as fait', () => {
    it('devrait afficher le nom de l exercice et les sets', () => {
      const exo = makeExercise()

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[exo]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText('Bench Press')).toBeTruthy()
      // Les sets sont affiches avec le format "reps x weight unit"
      expect(getByText(/10.*60.*kg.*8.*70.*kg/)).toBeTruthy()
    })

    it('devrait afficher le badge incomplet quand setsValidated < setsTarget', () => {
      const exo = makeExercise({ setsValidated: 2, setsTarget: 4 })

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[exo]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText('2/4')).toBeTruthy()
    })

    it('devrait ne pas afficher de badge quand setsTarget est 0', () => {
      const exo = makeExercise({ setsValidated: 3, setsTarget: 0 })

      const { queryByText } = render(
        <SummaryExerciseList
          recapExercises={[exo]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      // Pas de badge "3/0" ni de checkmark
      expect(queryByText('3/0')).toBeNull()
    })

    it('devrait afficher un poids decimal correctement', () => {
      const exo = makeExercise({
        sets: [{ reps: 5, weight: 62.5 }],
      })

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[exo]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText(/62\.5/)).toBeTruthy()
    })

    it('devrait afficher un poids entier sans decimale', () => {
      const exo = makeExercise({
        sets: [{ reps: 5, weight: 80 }],
      })

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[exo]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      // 80 et non 80.0
      expect(getByText(/5.*80 kg/)).toBeTruthy()
    })
  })

  describe('section progression - premiere seance', () => {
    it('devrait afficher le message de premiere seance quand prevVolume est null', () => {
      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[makeExercise()]}
          recapComparison={makeComparison({ prevVolume: null, volumeGain: 0 })}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText('Première séance !')).toBeTruthy()
    })
  })

  describe('section progression - volume positif', () => {
    it('devrait afficher le gain de volume en positif', () => {
      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[makeExercise()]}
          recapComparison={makeComparison({ volumeGain: 250 })}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText(/\+250\.0 kg/)).toBeTruthy()
    })
  })

  describe('section progression - volume negatif', () => {
    it('devrait afficher la perte de volume en negatif', () => {
      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[makeExercise()]}
          recapComparison={makeComparison({ volumeGain: -150 })}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText(/-150\.0 kg/)).toBeTruthy()
    })
  })

  describe('section progression - meme volume', () => {
    it('devrait afficher meme volume quand le gain est zero', () => {
      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[makeExercise()]}
          recapComparison={makeComparison({ volumeGain: 0 })}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText('Même volume')).toBeTruthy()
    })
  })

  describe('exercices avec delta de poids max', () => {
    it('devrait afficher la progression du poids max par exercice', () => {
      const exoWithDelta = makeExercise({
        exerciseName: 'Squat',
        prevMaxWeight: 100,
        currMaxWeight: 110,
      })

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[makeExercise()]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[exoWithDelta]}
        />
      )

      expect(getByText('Squat')).toBeTruthy()
      expect(getByText(/100.*→.*110 kg/)).toBeTruthy()
    })

    it('devrait afficher la regression du poids max par exercice', () => {
      const exoWithDelta = makeExercise({
        exerciseName: 'OHP',
        prevMaxWeight: 50,
        currMaxWeight: 45,
      })

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={[makeExercise()]}
          recapComparison={makeComparison()}
          exercisesWithDelta={[exoWithDelta]}
        />
      )

      expect(getByText('OHP')).toBeTruthy()
      expect(getByText(/50.*→.*45 kg/)).toBeTruthy()
    })
  })

  describe('plusieurs exercices', () => {
    it('devrait afficher tous les exercices dans la liste', () => {
      const exos = [
        makeExercise({ exerciseId: 'ex-1', exerciseName: 'Bench Press' }),
        makeExercise({ exerciseId: 'ex-2', exerciseName: 'Incline Bench' }),
        makeExercise({ exerciseId: 'ex-3', exerciseName: 'Flyes' }),
      ]

      const { getByText } = render(
        <SummaryExerciseList
          recapExercises={exos}
          recapComparison={makeComparison()}
          exercisesWithDelta={[]}
        />
      )

      expect(getByText('Bench Press')).toBeTruthy()
      expect(getByText('Incline Bench')).toBeTruthy()
      expect(getByText('Flyes')).toBeTruthy()
    })
  })
})
