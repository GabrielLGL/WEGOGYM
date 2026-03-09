import React from 'react'
import { render } from '@testing-library/react-native'
import { HeatmapCalendar } from '../HeatmapCalendar'
import type { HeatmapDay } from '../../model/utils/statsHelpers'

const makeDay = (date: string, dayOfWeek: number, count: number): HeatmapDay => ({
  date,
  dayOfWeek,
  count,
})

// Une semaine complète : lun-dim (dayOfWeek 0-6)
const oneWeek: HeatmapDay[] = [
  makeDay('2024-01-01', 0, 0),
  makeDay('2024-01-02', 1, 1),
  makeDay('2024-01-03', 2, 2),
  makeDay('2024-01-04', 3, 0),
  makeDay('2024-01-05', 4, 3),
  makeDay('2024-01-06', 5, 1),
  makeDay('2024-01-07', 6, 0),
]

// Données couvrant deux mois
const twoMonths: HeatmapDay[] = [
  makeDay('2024-01-29', 0, 0),
  makeDay('2024-01-30', 1, 1),
  makeDay('2024-01-31', 2, 0),
  makeDay('2024-02-01', 3, 2),
  makeDay('2024-02-02', 4, 0),
  makeDay('2024-02-03', 5, 1),
  makeDay('2024-02-04', 6, 0),
]

describe('HeatmapCalendar', () => {
  it('se rend sans crash avec data vide', () => {
    expect(() => render(<HeatmapCalendar data={[]} />)).not.toThrow()
  })

  it('se rend sans crash avec une semaine de données', () => {
    expect(() => render(<HeatmapCalendar data={oneWeek} />)).not.toThrow()
  })

  it('affiche les labels de légende "Moins" et "Plus"', () => {
    const { getByText } = render(<HeatmapCalendar data={[]} />)
    expect(getByText('Moins')).toBeTruthy()
    expect(getByText('Plus')).toBeTruthy()
  })

  it('affiche le label du mois de janvier', () => {
    const { getByText } = render(<HeatmapCalendar data={oneWeek} />)
    expect(getByText('Jan')).toBeTruthy()
  })

  it('affiche les labels des deux mois sur données chevauchantes', () => {
    const { getByText } = render(<HeatmapCalendar data={twoMonths} />)
    expect(getByText('Jan')).toBeTruthy()
    expect(getByText('Fév')).toBeTruthy()
  })

  it('se rend sans crash avec données count=0 (jours de repos)', () => {
    const restDays = [
      makeDay('2024-03-04', 0, 0),
      makeDay('2024-03-05', 1, 0),
      makeDay('2024-03-10', 6, 0),
    ]
    expect(() => render(<HeatmapCalendar data={restDays} />)).not.toThrow()
  })

  it('se rend sans crash avec count > 3 (intensité plafonnée)', () => {
    const highCount = [
      makeDay('2024-03-04', 0, 5),
      makeDay('2024-03-10', 6, 10),
    ]
    expect(() => render(<HeatmapCalendar data={highCount} />)).not.toThrow()
  })
})
