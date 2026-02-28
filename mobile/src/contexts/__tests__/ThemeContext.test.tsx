/**
 * Tests for ThemeContext API surface (mock contract).
 * The moduleNameMapper intercepts imports containing '/contexts/ThemeContext'.
 * Using '../../contexts/ThemeContext' (not '../ThemeContext') ensures the mapper
 * triggers and resolves to __mocks__/ThemeContextMock.ts — no DB dependency.
 * This verifies the mock contract that all component tests rely on.
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'

// This import matches '.*\/contexts\/ThemeContext' → resolved to ThemeContextMock
import { useColors, useTheme, ThemeProvider } from '../../contexts/ThemeContext'

describe('ThemeContext API (mock contract)', () => {
  describe('useColors()', () => {
    it('returns a non-null object', () => {
      const colors = useColors()
      expect(colors).toBeTruthy()
      expect(typeof colors).toBe('object')
    })

    it('has a "background" color property', () => {
      expect(useColors()).toHaveProperty('background')
    })

    it('has a "text" color property', () => {
      expect(useColors()).toHaveProperty('text')
    })

    it('has a "primary" color property', () => {
      expect(useColors()).toHaveProperty('primary')
    })

    it('has a "card" color property', () => {
      expect(useColors()).toHaveProperty('card')
    })

    it('has a "danger" color property', () => {
      expect(useColors()).toHaveProperty('danger')
    })

    it('has a "textSecondary" color property', () => {
      expect(useColors()).toHaveProperty('textSecondary')
    })

    it('returns color strings (non-empty)', () => {
      const colors = useColors()
      expect(typeof colors.background).toBe('string')
      expect(colors.background.length).toBeGreaterThan(0)
    })
  })

  describe('useTheme()', () => {
    it('returns a theme object with mode', () => {
      const theme = useTheme()
      expect(theme).toHaveProperty('mode')
      expect(['dark', 'light']).toContain(theme.mode)
    })

    it('has a "colors" property', () => {
      expect(useTheme()).toHaveProperty('colors')
    })

    it('has an "isDark" boolean', () => {
      const theme = useTheme()
      expect(typeof theme.isDark).toBe('boolean')
    })

    it('has a "toggleTheme" function', () => {
      expect(typeof useTheme().toggleTheme).toBe('function')
    })

    it('has a "setThemeMode" function', () => {
      expect(typeof useTheme().setThemeMode).toBe('function')
    })
  })

  describe('ThemeProvider', () => {
    it('renders children without crashing', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Text>Test enfant</Text>
        </ThemeProvider>
      )
      expect(getByText('Test enfant')).toBeTruthy()
    })
  })
})
