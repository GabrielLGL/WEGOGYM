import User from '../models/User'
import FriendSnapshot from '../models/FriendSnapshot'

export interface LeaderboardEntry {
  rank: number
  isMe: boolean
  friendCode: string
  displayName: string
  totalXp: number
  level: number
  currentStreak: number
  totalTonnage: number
  totalPrs: number
  totalSessions: number
}

export type LeaderboardSort = 'xp' | 'streak' | 'tonnage' | 'prs'

export function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KORE-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function encodeFriendPayload(user: User, totalSessions: number): string {
  const payload = {
    v: 1,
    code: user.friendCode,
    name: user.name || 'Anonyme',
    xp: user.totalXp,
    level: user.level,
    streak: user.currentStreak,
    tonnage: user.totalTonnage,
    prs: user.totalPrs,
    sessions: totalSessions,
  }
  return btoa(JSON.stringify(payload))
}

interface FriendCodePayload {
  v: number
  code: string
  name: string
  xp: number
  level: number
  streak: number
  tonnage: number
  prs: number
  sessions: number
}

export function decodeFriendPayload(encoded: string): FriendCodePayload | null {
  try {
    const json = atob(encoded.trim())
    const data = JSON.parse(json) as FriendCodePayload
    if (!data.v || !data.code || !data.name) return null
    return data
  } catch {
    return null
  }
}

export function buildLeaderboard(
  user: User,
  userTotalSessions: number,
  friends: FriendSnapshot[],
  sort: LeaderboardSort = 'xp'
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    {
      rank: 0,
      isMe: true,
      friendCode: user.friendCode ?? '',
      displayName: user.name || 'Moi',
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      totalTonnage: user.totalTonnage,
      totalPrs: user.totalPrs,
      totalSessions: userTotalSessions,
    },
    ...friends.map(f => ({
      rank: 0,
      isMe: false,
      friendCode: f.friendCode,
      displayName: f.displayName,
      totalXp: f.totalXp,
      level: f.level,
      currentStreak: f.currentStreak,
      totalTonnage: f.totalTonnage,
      totalPrs: f.totalPrs,
      totalSessions: f.totalSessions,
    })),
  ]

  const sortKey: Record<LeaderboardSort, keyof LeaderboardEntry> = {
    xp: 'totalXp',
    streak: 'currentStreak',
    tonnage: 'totalTonnage',
    prs: 'totalPrs',
  }

  entries.sort((a, b) => (b[sortKey[sort]] as number) - (a[sortKey[sort]] as number))
  entries.forEach((e, i) => { e.rank = i + 1 })
  return entries
}
