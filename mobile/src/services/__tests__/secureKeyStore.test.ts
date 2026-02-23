/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Tests for secureKeyStore resilience when expo-secure-store is unavailable.
 */

// Mock database before importing
jest.mock('../../model', () => ({
  database: {
    get: jest.fn(() => ({
      query: jest.fn(() => ({
        fetch: jest.fn().mockResolvedValue([]),
      })),
    })),
    write: jest.fn(),
  },
}))

// Store mock fns to control behavior per test
const mockGetItemAsync = jest.fn()
const mockSetItemAsync = jest.fn()
const mockDeleteItemAsync = jest.fn()

jest.mock('expo-secure-store', () => ({
  getItemAsync: mockGetItemAsync,
  setItemAsync: mockSetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
}))

// We need to reset module state between tests since secureKeyStore caches
beforeEach(() => {
  jest.resetModules()
  mockGetItemAsync.mockReset()
  mockSetItemAsync.mockReset()
  mockDeleteItemAsync.mockReset()
})

describe('secureKeyStore', () => {
  describe('getApiKey', () => {
    it('returns the stored key on success', async () => {
      mockGetItemAsync.mockResolvedValue('test-key-123')
      const { getApiKey } = require('../secureKeyStore')
      const result = await getApiKey()
      expect(result).toBe('test-key-123')
    })

    it('returns null when native call throws', async () => {
      mockGetItemAsync.mockRejectedValue(new Error('Native module not available'))
      const { getApiKey } = require('../secureKeyStore')
      const result = await getApiKey()
      expect(result).toBeNull()
    })

    it('returns null on subsequent calls after native failure (store disabled)', async () => {
      mockGetItemAsync.mockRejectedValueOnce(new Error('crash'))
      const { getApiKey } = require('../secureKeyStore')

      // First call: native fails, returns null
      const r1 = await getApiKey()
      expect(r1).toBeNull()

      // Second call: store should be disabled, native not called again
      mockGetItemAsync.mockResolvedValue('should-not-reach')
      const r2 = await getApiKey()
      expect(r2).toBeNull()
    })
  })

  describe('setApiKey', () => {
    it('saves the key on success', async () => {
      mockSetItemAsync.mockResolvedValue(undefined)
      const { setApiKey } = require('../secureKeyStore')
      await expect(setApiKey('my-key')).resolves.toBeUndefined()
      expect(mockSetItemAsync).toHaveBeenCalledWith('wegogym_ai_api_key', 'my-key')
    })

    it('does not throw when native call fails', async () => {
      mockSetItemAsync.mockRejectedValue(new Error('Native module not available'))
      const { setApiKey } = require('../secureKeyStore')
      await expect(setApiKey('my-key')).resolves.toBeUndefined()
    })
  })

  describe('deleteApiKey', () => {
    it('deletes the key on success', async () => {
      mockDeleteItemAsync.mockResolvedValue(undefined)
      const { deleteApiKey } = require('../secureKeyStore')
      await expect(deleteApiKey()).resolves.toBeUndefined()
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('wegogym_ai_api_key')
    })

    it('does not throw when native call fails', async () => {
      mockDeleteItemAsync.mockRejectedValue(new Error('Native module not available'))
      const { deleteApiKey } = require('../secureKeyStore')
      await expect(deleteApiKey()).resolves.toBeUndefined()
    })
  })
})
