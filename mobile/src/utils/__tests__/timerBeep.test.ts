/**
 * Tests for timerBeep.ts — WAV generation and Audio.Sound creation
 */

import { Audio } from 'expo-av'
import { createBeepSound } from '../timerBeep'

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          unloadAsync: jest.fn(),
        },
      }),
    },
  },
}))

const mockCreateAsync = Audio.Sound.createAsync as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createBeepSound', () => {
  it('creates a sound using Audio.Sound.createAsync', async () => {
    const sound = await createBeepSound()
    expect(mockCreateAsync).toHaveBeenCalledTimes(1)
    expect(sound).toBeDefined()
    expect(sound.playAsync).toBeDefined()
  })

  it('passes a data URI starting with data:audio/wav;base64,', async () => {
    await createBeepSound()
    const calledUri = mockCreateAsync.mock.calls[0][0] as { uri: string }
    expect(calledUri.uri).toMatch(/^data:audio\/wav;base64,.+/)
  })

  it('caches the data URI across calls', async () => {
    await createBeepSound()
    await createBeepSound()

    const uri1 = (mockCreateAsync.mock.calls[0][0] as { uri: string }).uri
    const uri2 = (mockCreateAsync.mock.calls[1][0] as { uri: string }).uri
    expect(uri1).toBe(uri2)
  })

  it('generates a valid base64 string (no invalid characters)', async () => {
    await createBeepSound()
    const calledUri = mockCreateAsync.mock.calls[0][0] as { uri: string }
    const base64Part = calledUri.uri.replace('data:audio/wav;base64,', '')
    expect(base64Part).toMatch(/^[A-Za-z0-9+/=]+$/)
    expect(base64Part.length).toBeGreaterThan(100) // WAV header + samples
  })
})
