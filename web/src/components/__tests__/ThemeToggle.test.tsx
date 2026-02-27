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
    expect(screen.getByRole('button', { name: /changer le th/i })).toBeInTheDocument()
  })

  it('affiche une icône soleil par défaut (thème light)', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    // Soleil = SVG avec un <circle> (corps du soleil)
    expect(btn.querySelector('circle')).toBeTruthy()
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

  it('affiche une icône lune quand data-theme="dark" au montage', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<ThemeToggle />)
    await waitFor(() => {
      const btn = screen.getByRole('button')
      // Lune = SVG avec un <path> (croissant), sans <circle>
      expect(btn.querySelector('path')).toBeTruthy()
      expect(btn.querySelector('circle')).toBeFalsy()
    })
  })
})
