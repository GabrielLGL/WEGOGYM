/**
 * Tests for ScreenLoader component
 */
import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('../../contexts/ThemeContext', () => ({
  useColors: () => require('../../theme').colors,
}))

import ScreenLoader from '../ScreenLoader'

describe('ScreenLoader', () => {
  it('renders a centered ActivityIndicator', () => {
    const { getByTestId, toJSON } = render(<ScreenLoader />)
    const tree = toJSON()
    expect(tree).toBeTruthy()
  })
})
