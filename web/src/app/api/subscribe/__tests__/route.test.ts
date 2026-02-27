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

// Mock rate limiter
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}))

import { POST } from '../route'
import { getSupabase } from '@/lib/supabase'
import { getResend } from '@/lib/resend'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

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
    // Rate limit allowed by default
    vi.mocked(getClientIp).mockReturnValue('127.0.0.1')
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 3600000,
      limit: 5,
    })
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

  it('retourne 400 si email dépasse 254 caractères', async () => {
    const longEmail = 'a'.repeat(245) + '@example.com' // 257 chars
    const req = makeRequest({ email: longEmail })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Email invalide')
  })

  it('normalise l\'email en lowercase avant l\'insert', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as unknown as ReturnType<typeof getSupabase>)
    vi.mocked(getResend).mockReturnValue({
      emails: { send: vi.fn().mockResolvedValue({}) },
    } as unknown as ReturnType<typeof getResend>)

    const req = makeRequest({ email: 'Test@Example.COM', name: 'Gabriel' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    )
  })

  it('tronque le name à 100 caractères', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as unknown as ReturnType<typeof getSupabase>)
    vi.mocked(getResend).mockReturnValue({
      emails: { send: vi.fn().mockResolvedValue({}) },
    } as unknown as ReturnType<typeof getResend>)

    const longName = 'A'.repeat(150)
    const req = makeRequest({ email: 'test@example.com', name: longName })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'A'.repeat(100) })
    )
  })

  it('retourne 200 et success:true pour email valide', async () => {
    // Mock Supabase insert OK
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
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

  it('retourne 409 si email déjà inscrit', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as unknown as ReturnType<typeof getSupabase>)

    const req = makeRequest({ email: 'test@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toBe('Cet email est déjà inscrit.')
  })

  it('retourne 500 si Supabase échoue', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: { code: '42501', message: 'DB error' } })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as unknown as ReturnType<typeof getSupabase>)

    const req = makeRequest({ email: 'test@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Erreur lors de l'inscription")
  })

  it('retourne 200 même si Resend échoue (échec silencieux)', async () => {
    // Supabase OK
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
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

describe('Rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getClientIp).mockReturnValue('127.0.0.1')
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 3600000,
      limit: 5,
    })
  })

  it('retourne 429 quand la limite est atteinte', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 3600000,
      limit: 5,
    })

    const req = makeRequest({ email: 'test@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(429)

    const json = await res.json()
    expect(json.error).toMatch(/Trop de tentatives/i)
    expect(res.headers.get('Retry-After')).toBeTruthy()
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('inclut les headers X-RateLimit-* sur une requête réussie', async () => {
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as unknown as ReturnType<typeof getSupabase>)

    vi.mocked(getResend).mockReturnValue({
      emails: { send: vi.fn().mockResolvedValue({}) },
    } as unknown as ReturnType<typeof getResend>)

    const req = makeRequest({ email: 'test@example.com' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4')
    expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })
})
