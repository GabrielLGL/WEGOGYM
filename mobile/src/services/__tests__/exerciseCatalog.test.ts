/**
 * Tests for exerciseCatalog.ts — Supabase REST API service
 */

import {
  searchCatalogExercises,
  getCatalogExercise,
  mapCatalogToLocal,
  BODY_PART_TO_MUSCLES,
  TARGET_TO_MUSCLES,
  EQUIPMENT_TO_LOCAL,
  CatalogExercise,
} from '../exerciseCatalog'

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    },
  },
}))

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── mapCatalogToLocal ───────────────────────────────────────────────────────

describe('mapCatalogToLocal', () => {
  const baseCatalogExercise: CatalogExercise = {
    id: 'bench_press',
    name: 'Bench Press',
    body_part: 'strength',
    equipment: 'barbell',
    target: 'chest',
    secondary_muscles: ['triceps', 'shoulders'],
    instructions: ['Lie on bench', 'Grip barbell', 'Lower to chest', 'Press up'],
    gif_url: null,
    gif_original_url: null,
  }

  it('maps target muscle to French using TARGET_TO_MUSCLES', () => {
    const result = mapCatalogToLocal(baseCatalogExercise)
    expect(result.muscles).toEqual(['Pecs'])
  })

  it('maps equipment to French using EQUIPMENT_TO_LOCAL', () => {
    const result = mapCatalogToLocal(baseCatalogExercise)
    expect(result.equipment).toBe('Poids libre')
  })

  it('keeps exercise name as-is', () => {
    const result = mapCatalogToLocal(baseCatalogExercise)
    expect(result.name).toBe('Bench Press')
  })

  it('takes first 3 instructions as description', () => {
    const result = mapCatalogToLocal(baseCatalogExercise)
    expect(result.description).toBe('Lie on bench Grip barbell Lower to chest')
  })

  it('falls back to BODY_PART_TO_MUSCLES when target is not mapped', () => {
    const exercise: CatalogExercise = {
      ...baseCatalogExercise,
      target: 'unknown_target',
      body_part: 'cardio',
    }
    const result = mapCatalogToLocal(exercise)
    expect(result.muscles).toEqual(['Cardio'])
  })

  it('falls back to "Dos" when neither target nor body_part is mapped', () => {
    const exercise: CatalogExercise = {
      ...baseCatalogExercise,
      target: 'completely_unknown',
      body_part: 'completely_unknown',
    }
    const result = mapCatalogToLocal(exercise)
    expect(result.muscles).toEqual(['Dos'])
  })

  it('falls back to "Poids du corps" for unknown equipment', () => {
    const exercise: CatalogExercise = {
      ...baseCatalogExercise,
      equipment: 'alien_device',
    }
    const result = mapCatalogToLocal(exercise)
    expect(result.equipment).toBe('Poids du corps')
  })

  it('handles exercise with fewer than 3 instructions', () => {
    const exercise: CatalogExercise = {
      ...baseCatalogExercise,
      instructions: ['Step 1'],
    }
    const result = mapCatalogToLocal(exercise)
    expect(result.description).toBe('Step 1')
  })

  it('handles exercise with empty instructions', () => {
    const exercise: CatalogExercise = {
      ...baseCatalogExercise,
      instructions: [],
    }
    const result = mapCatalogToLocal(exercise)
    expect(result.description).toBe('')
  })
})

// ─── searchCatalogExercises ──────────────────────────────────────────────────

describe('searchCatalogExercises', () => {
  it('returns exercises and hasMore flag', async () => {
    const mockExercises = [{ id: '1', name: 'Squat' }]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExercises),
    })

    const result = await searchCatalogExercises()
    expect(result.exercises).toEqual(mockExercises)
    expect(result.hasMore).toBe(false) // 1 < 50 (PAGE_SIZE)
  })

  it('sets hasMore to true when result count equals limit', async () => {
    const mockExercises = Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: `Ex${i}` }))
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExercises),
    })

    const result = await searchCatalogExercises()
    expect(result.hasMore).toBe(true)
  })

  it('includes query filter in URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await searchCatalogExercises({ query: 'squat' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('name=ilike.*squat*')
  })

  it('includes body_part filter in URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await searchCatalogExercises({ body_part: 'strength' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('body_part=eq.strength')
  })

  it('includes equipment filter in URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await searchCatalogExercises({ equipment: 'barbell' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('equipment=eq.barbell')
  })

  it('uses custom limit and offset', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await searchCatalogExercises({ limit: 10, offset: 20 })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('limit=10')
    expect(calledUrl).toContain('offset=20')
  })

  it('throws catalog_fetch_error on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(searchCatalogExercises()).rejects.toThrow('catalog_fetch_error')
  })

  it('throws catalog_fetch_error on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    await expect(searchCatalogExercises()).rejects.toThrow('catalog_fetch_error')
  })

  it('trims query whitespace', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await searchCatalogExercises({ query: '  bench  ' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('name=ilike.*bench*')
  })

  it('skips empty query', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await searchCatalogExercises({ query: '   ' })
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).not.toContain('name=')
  })
})

// ─── getCatalogExercise ──────────────────────────────────────────────────────

describe('getCatalogExercise', () => {
  it('returns exercise when found', async () => {
    const exercise = { id: '1', name: 'Squat' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([exercise]),
    })

    const result = await getCatalogExercise('1')
    expect(result).toEqual(exercise)
  })

  it('returns null when not found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    const result = await getCatalogExercise('nonexistent')
    expect(result).toBeNull()
  })

  it('throws catalog_fetch_error on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(getCatalogExercise('1')).rejects.toThrow('catalog_fetch_error')
  })

  it('throws catalog_fetch_error on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 })

    await expect(getCatalogExercise('1')).rejects.toThrow('catalog_fetch_error')
  })

  it('includes correct headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await getCatalogExercise('1')
    const calledOptions = mockFetch.mock.calls[0][1] as { headers: Record<string, string> }
    expect(calledOptions.headers.apikey).toBe('test-anon-key')
    expect(calledOptions.headers.Authorization).toBe('Bearer test-anon-key')
  })
})

// ─── Mappings ────────────────────────────────────────────────────────────────

describe('mapping constants', () => {
  it('TARGET_TO_MUSCLES covers major muscle groups', () => {
    expect(TARGET_TO_MUSCLES['chest']).toBe('Pecs')
    expect(TARGET_TO_MUSCLES['biceps']).toBe('Biceps')
    expect(TARGET_TO_MUSCLES['triceps']).toBe('Triceps')
    expect(TARGET_TO_MUSCLES['abs']).toBe('Abdos')
    expect(TARGET_TO_MUSCLES['glutes']).toBe('Ischios')
    expect(TARGET_TO_MUSCLES['calves']).toBe('Mollets')
  })

  it('EQUIPMENT_TO_LOCAL maps common equipment', () => {
    expect(EQUIPMENT_TO_LOCAL['barbell']).toBe('Poids libre')
    expect(EQUIPMENT_TO_LOCAL['dumbbell']).toBe('Poids libre')
    expect(EQUIPMENT_TO_LOCAL['machine']).toBe('Machine')
    expect(EQUIPMENT_TO_LOCAL['body only']).toBe('Poids du corps')
    expect(EQUIPMENT_TO_LOCAL['cable']).toBe('Poulies')
  })

  it('BODY_PART_TO_MUSCLES maps categories', () => {
    expect(BODY_PART_TO_MUSCLES['strength']).toBe('Dos')
    expect(BODY_PART_TO_MUSCLES['cardio']).toBe('Cardio')
  })
})
