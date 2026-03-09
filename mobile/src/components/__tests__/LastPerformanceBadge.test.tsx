// Mock databaseHelpers pour éviter l'init JSI de SQLiteAdapter
import React from 'react'
import { render } from '@testing-library/react-native'
import { LastPerformanceBadge } from '../LastPerformanceBadge'
import type { LastPerformance } from '../../types/workout'

jest.mock('../../model/utils/databaseHelpers', () => ({
  formatRelativeDate: jest.fn((date: Date) => {
    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 1) return "aujourd'hui"
    if (diffDays < 2) return 'hier'
    return `il y a ${diffDays} jours`
  }),
}))

const makeLastPerformance = (overrides: Partial<LastPerformance> = {}): LastPerformance => ({
  maxWeight: 80,
  avgWeight: 80,
  setsCount: 3,
  avgReps: 8,
  date: new Date(),
  ...overrides,
})

describe('LastPerformanceBadge', () => {
  describe('sans données de performance', () => {
    it('affiche le message "Première fois" quand lastPerformance est null', () => {
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={null} />
      )

      expect(getByText('Première fois')).toBeTruthy()
    })
  })

  describe('avec données de performance', () => {
    it('affiche les séries, reps et poids de la dernière performance', () => {
      const performance = makeLastPerformance({ setsCount: 3, avgReps: 8, maxWeight: 80 })
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={performance} />
      )

      // Le nouveau format affiche "↑ {setsCount}×{avgReps} @ {maxWeight} kg"
      const text = getByText(/↑/)
      expect(text).toBeTruthy()
      const flatChildren = JSON.stringify(text.props.children)
      expect(flatChildren).toContain('3')
      expect(flatChildren).toContain('8')
      expect(flatChildren).toContain('80')
    })

    it('affiche "aujourd\'hui" pour une date récente', () => {
      const performance = makeLastPerformance({ date: new Date() })
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={performance} />
      )

      expect(getByText(/aujourd'hui/)).toBeTruthy()
    })

    it('affiche "hier" pour une date d\'hier', () => {
      const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000)
      const performance = makeLastPerformance({ date: yesterday })
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={performance} />
      )

      expect(getByText(/hier/)).toBeTruthy()
    })

    it('affiche les unités kg dans le texte', () => {
      const performance = makeLastPerformance({ maxWeight: 100 })
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={performance} />
      )

      expect(getByText(/kg/)).toBeTruthy()
    })

    it('affiche correctement des valeurs à zéro (exercice au poids du corps)', () => {
      const performance = makeLastPerformance({ maxWeight: 0, setsCount: 4, avgReps: 10 })
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={performance} />
      )

      // Le texte doit contenir le poids 0 et les reps
      const text = getByText(/↑/)
      expect(text).toBeTruthy()
    })

    it('affiche correctement des valeurs élevées (haltérophilie)', () => {
      const performance = makeLastPerformance({ maxWeight: 250, setsCount: 1, avgReps: 1 })
      const { getByText } = render(
        <LastPerformanceBadge lastPerformance={performance} />
      )

      const text = getByText(/↑/)
      const flatChildren = JSON.stringify(text.props.children)
      expect(flatChildren).toContain('250')
    })
  })
})
