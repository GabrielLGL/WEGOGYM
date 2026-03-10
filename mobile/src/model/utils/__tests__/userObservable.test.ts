import { of } from 'rxjs'
import { observeCurrentUser, fetchCurrentUser } from '../userObservable'

// Mock database
const mockObserve = jest.fn()
const mockFetch = jest.fn()
const mockQuery = jest.fn(() => ({
  observe: mockObserve,
  fetch: mockFetch,
}))
const mockGet = jest.fn<{ query: typeof mockQuery }, [string]>(() => ({ query: mockQuery }))

jest.mock('../../index', () => ({
  database: { get: (name: string) => mockGet(name) },
}))

describe('userObservable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockQuery.mockReturnValue({ observe: mockObserve, fetch: mockFetch })
  })

  describe('observeCurrentUser', () => {
    it('returns first user from observable', (done) => {
      const fakeUser = { id: 'u1', name: 'Test' }
      mockObserve.mockReturnValue(of([fakeUser, { id: 'u2' }]))

      observeCurrentUser().subscribe(user => {
        expect(user).toBe(fakeUser)
        expect(mockGet).toHaveBeenCalledWith('users')
        done()
      })
    })

    it('returns null when no users', (done) => {
      mockObserve.mockReturnValue(of([]))

      observeCurrentUser().subscribe(user => {
        expect(user).toBeNull()
        done()
      })
    })
  })

  describe('fetchCurrentUser', () => {
    it('returns first user from fetch', async () => {
      const fakeUser = { id: 'u1', name: 'Test' }
      mockFetch.mockResolvedValue([fakeUser])

      const result = await fetchCurrentUser()
      expect(result).toBe(fakeUser)
      expect(mockGet).toHaveBeenCalledWith('users')
    })

    it('returns null when no users', async () => {
      mockFetch.mockResolvedValue([])

      const result = await fetchCurrentUser()
      expect(result).toBeNull()
    })
  })
})
