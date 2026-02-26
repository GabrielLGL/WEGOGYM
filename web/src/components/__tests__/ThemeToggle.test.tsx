import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ThemeToggle from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('renders le bouton avec aria-label correct', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /changer le theme/i })).toBeInTheDocument()
  })

  it('affiche ☀️ par défaut (thème light)', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn.textContent).toContain('☀️')
  })

  it('passe en dark mode au clic', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('kore-theme')).toBe('dark')
  })

  it('retourne en light mode au deuxième clic', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn) // → dark
    fireEvent.click(btn) // → light
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('kore-theme')).toBe('light')
  })

  it('lit data-theme="dark" existant au montage', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<ThemeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button').textContent).toContain('🌙')
    })
  })
})
