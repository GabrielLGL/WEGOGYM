/**
 * Tests for ScreenLoading component
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import ScreenLoading from '../ScreenLoading'

describe('ScreenLoading', () => {
  it('renders ActivityIndicator', () => {
    const { UNSAFE_getByType } = render(<ScreenLoading />)
    const { ActivityIndicator } = require('react-native')
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
  })

  it('does not render message when not provided', () => {
    const { queryByText } = render(<ScreenLoading />)
    // No text elements beyond the indicator
    expect(queryByText(/.+/)).toBeNull()
  })

  it('renders message when provided', () => {
    const { getByText } = render(<ScreenLoading message="Chargement..." />)
    expect(getByText('Chargement...')).toBeTruthy()
  })
})
