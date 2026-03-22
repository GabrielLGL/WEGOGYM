/**
 * Tests for HexagonStatsCard component
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import HexagonStatsCard from '../HexagonStatsCard'
import type { HexagonAxis } from '../HexagonStatsCard'
import { colors } from '../../theme'

jest.mock('react-native-svg', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(View, props, children),
    Svg: ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(View, props, children),
    Polygon: (props: Record<string, unknown>) =>
      React.createElement(View, props),
    Line: (props: Record<string, unknown>) =>
      React.createElement(View, props),
    Circle: (props: Record<string, unknown>) =>
      React.createElement(View, props),
    Text: ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(Text, props, children),
  }
})

describe('HexagonStatsCard', () => {
  const mockAxes: HexagonAxis[] = [
    { label: 'Force', value: 0.8, rawValue: 80, rawMax: 100, color: '#FF0000' },
    { label: 'Endurance', value: 0.6, rawValue: 60, rawMax: 100, color: '#00FF00' },
    { label: 'Volume', value: 0.9, rawValue: 90, rawMax: 100, color: '#0000FF' },
    { label: 'Régularité', value: 0.5, rawValue: 50, rawMax: 100, color: '#FFFF00' },
    { label: 'Équilibre', value: 0.7, rawValue: 70, rawMax: 100, color: '#FF00FF' },
  ]

  it('renders without crashing', () => {
    const { toJSON } = render(
      <HexagonStatsCard axes={mockAxes} colors={colors} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('displays average score', () => {
    // avg = (0.8+0.6+0.9+0.5+0.7)/5 = 0.7 → 70%
    const { getByText } = render(
      <HexagonStatsCard axes={mockAxes} colors={colors} />,
    )
    expect(getByText(/70/)).toBeTruthy()
  })

  it('displays axis labels', () => {
    const { getByText } = render(
      <HexagonStatsCard axes={mockAxes} colors={colors} />,
    )
    expect(getByText('Force')).toBeTruthy()
    expect(getByText('Endurance')).toBeTruthy()
    expect(getByText('Volume')).toBeTruthy()
  })

  it('displays "score global" text', () => {
    const { getByText } = render(
      <HexagonStatsCard axes={mockAxes} colors={colors} />,
    )
    expect(getByText('score global')).toBeTruthy()
  })

  it('clamps values above 1 for average calculation', () => {
    const overAxes = mockAxes.map(a => ({ ...a, value: 1.5 }))
    const { getByText } = render(
      <HexagonStatsCard axes={overAxes} colors={colors} />,
    )
    // All clamped to 1.0 → avg 100%
    expect(getByText(/100/)).toBeTruthy()
  })

  it('handles zero values with minimum 3% for visibility', () => {
    const zeroAxes = mockAxes.map(a => ({ ...a, value: 0 }))
    const { toJSON } = render(
      <HexagonStatsCard axes={zeroAxes} colors={colors} />,
    )
    // Component still renders with zero values
    expect(toJSON()).toBeTruthy()
  })

  it('accepts custom size prop', () => {
    const { toJSON } = render(
      <HexagonStatsCard axes={mockAxes} size={200} colors={colors} />,
    )
    expect(toJSON()).toBeTruthy()
  })
})
