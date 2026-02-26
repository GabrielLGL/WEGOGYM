import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
}))

// Mock Resend
vi.mock('@/lib/resend', () => ({
  getResend: vi.fn(),
}))

// Mock WelcomeEmail (composant React, pas besoin de le rendre)
vi.mock('@/emails/welcome', () => ({
  WelcomeEmail: vi.fn(() => null),
}))

import { POST } from '../route'
import { getSupabase } from '@/lib/supabase'
import { getResend } from '@/lib/resend'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne 400 si email manquant', async () => {
    const req = makeRequest({ name: 'Test' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Email invalide')
  })

  it('retourne 400 si email sans @', async () => {
    const req = makeRequest({ email: 'invalide' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Email invalide')
  })

  it('retourne 200 et success:true pour email valide', async () => {
    // Mock Supabase upsert OK
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    } as unknown as ReturnType<typeof getSupabase>)

    // Mock Resend OK
    vi.mocked(getResend).mockReturnValue({
      emails: { send: vi.fn().mockResolvedValue({}) },
    } as unknown as ReturnType<typeof getResend>)

    const req = makeRequest({ email: 'test@example.com', name: 'Test' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('retourne 500 si Supabase échoue', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    } as unknown as ReturnType<typeof getSupabase>)

    const req = makeRequest({ email: 'test@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Erreur lors de l'inscription")
  })

  it('retourne 200 même si Resend échoue (échec silencieux)', async () => {
    // Supabase OK
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    } as unknown as ReturnType<typeof getSupabase>)

    // Resend KO
    vi.mocked(getResend).mockReturnValue({
      emails: { send: vi.fn().mockRejectedValue(new Error('Resend error')) },
    } as unknown as ReturnType<typeof getResend>)

    const req = makeRequest({ email: 'test@example.com' })
    const res = await POST(req)
    // L'email qui rate ne doit pas faire échouer la route
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
