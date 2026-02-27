import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubscribeSection from '@/components/sections/SubscribeSection'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SubscribeSection — formulaire inscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche le formulaire d\'inscription', () => {
    render(<SubscribeSection />)
    expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pr.nom/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /inscrire/i })).toBeInTheDocument()
  })

  it('n\'appelle pas fetch si email vide', async () => {
    render(<SubscribeSection />)
    const submitBtn = screen.getByRole('button', { name: /inscrire/i })
    fireEvent.click(submitBtn)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('affiche "Inscription..." pendant le chargement', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))

    render(<SubscribeSection />)
    await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com')

    const form = screen.getByRole('form', { name: /formulaire d'inscription/i })
    fireEvent.submit(form)

    expect(await screen.findByText(/inscription\.\.\./i)).toBeInTheDocument()
  })

  it('affiche le message success après inscription réussie', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    render(<SubscribeSection />)
    await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com')

    const form = screen.getByRole('form', { name: /formulaire d'inscription/i })
    fireEvent.submit(form)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/inscription r.ussie/i)
  })

  it('affiche le message d\'erreur si l\'API échoue', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    render(<SubscribeSection />)
    await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com')

    const form = screen.getByRole('form', { name: /formulaire d'inscription/i })
    fireEvent.submit(form)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/erreur/i)
  })

  it('appelle fetch avec email et name corrects', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    render(<SubscribeSection />)
    await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/pr.nom/i), 'Gabriel')

    const form = screen.getByRole('form', { name: /formulaire d'inscription/i })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', name: 'Gabriel' }),
      })
    })
  })

  it('affiche le message de rate limit sur 429', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 })

    render(<SubscribeSection />)
    await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com')

    fireEvent.submit(screen.getByRole('form', { name: /formulaire d'inscription/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/trop de tentatives/i)
  })

  it('affiche le message doublon sur 409', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 409 })

    render(<SubscribeSection />)
    await userEvent.type(screen.getByLabelText(/adresse email/i), 'test@example.com')

    fireEvent.submit(screen.getByRole('form', { name: /formulaire d'inscription/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/d.j. inscrit/i)
  })
})
