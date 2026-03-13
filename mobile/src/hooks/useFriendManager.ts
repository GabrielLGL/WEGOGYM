import { useState, useCallback } from 'react'
import { Q } from '@nozbe/watermelondb'
import { database } from '../model'
import { decodeFriendPayload, generateFriendCode } from '../model/utils/leaderboardHelpers'
import FriendSnapshot from '../model/models/FriendSnapshot'
import User from '../model/models/User'

interface UseFriendManagerReturn {
  importFriend: (encodedCode: string) => Promise<'success' | 'invalid' | 'duplicate' | 'self'>
  removeFriend: (friendCode: string) => Promise<void>
  isImporting: boolean
}

export function useFriendManager(): UseFriendManagerReturn {
  const [isImporting, setIsImporting] = useState(false)

  const importFriend = useCallback(async (encodedCode: string): Promise<'success' | 'invalid' | 'duplicate' | 'self'> => {
    setIsImporting(true)
    try {
      const payload = decodeFriendPayload(encodedCode)
      if (!payload) return 'invalid'

      const users = await database.get<User>('users').query().fetch()
      if (users.length === 0) return 'invalid'
      const currentUser = users[0]
      if (currentUser.friendCode === payload.code) return 'self'

      const existing = await database.get<FriendSnapshot>('friend_snapshots')
        .query(Q.where('friend_code', payload.code))
        .fetch()

      if (existing.length > 0) {
        await database.write(async () => {
          await existing[0].update(snap => {
            snap.displayName = payload.name
            snap.totalXp = payload.xp
            snap.level = payload.level
            snap.currentStreak = payload.streak
            snap.totalTonnage = payload.tonnage
            snap.totalPrs = payload.prs
            snap.totalSessions = payload.sessions
            snap.importedAt = Date.now()
          })
        })
        return 'success'
      }

      await database.write(async () => {
        await database.get<FriendSnapshot>('friend_snapshots').create(snap => {
          snap.friendCode = payload.code
          snap.displayName = payload.name
          snap.totalXp = payload.xp
          snap.level = payload.level
          snap.currentStreak = payload.streak
          snap.totalTonnage = payload.tonnage
          snap.totalPrs = payload.prs
          snap.totalSessions = payload.sessions
          snap.importedAt = Date.now()
        })
      })
      return 'success'
    } catch (e) {
      if (__DEV__) console.warn('[useFriendManager] importFriend error', e)
      return 'invalid'
    } finally {
      setIsImporting(false)
    }
  }, [])

  const removeFriend = useCallback(async (friendCode: string) => {
    try {
      const snapshots = await database.get<FriendSnapshot>('friend_snapshots')
        .query(Q.where('friend_code', friendCode))
        .fetch()
      await database.write(async () => {
        await Promise.all(snapshots.map(s => s.destroyPermanently()))
      })
    } catch (e) {
      if (__DEV__) console.warn('[useFriendManager] removeFriend error', e)
    }
  }, [])

  return { importFriend, removeFriend, isImporting }
}

// Re-export generateFriendCode for convenience
export { generateFriendCode }
