/**
 * Tests for ScreenLoader component
 */
import React from 'react'
import { render } from '@testing-library/react-native'

import ScreenLoader from '../ScreenLoader'

jest.mock('../../contexts/ThemeContext', () => ({
  useColors: () => require('../../theme').colors,
}))

describe('ScreenLoader', () => {
  it('renders a centered ActivityIndicator', () => {
    const { toJSON } = render(<ScreenLoader />)
    const tree = toJSON()
    expect(tree).toBeTruthy()
  })
})
