import {
  generateFriendCode,
  encodeFriendPayload,
  decodeFriendPayload,
  buildLeaderboard,
} from '../leaderboardHelpers'

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    friendCode: 'KORE-ABC123',
    name: 'TestUser',
    totalXp: 1000,
    level: 5,
    currentStreak: 3,
    totalTonnage: 50000,
    totalPrs: 10,
    ...overrides,
  } as never
}

function makeFriend(overrides: Record<string, unknown> = {}) {
  return {
    friendCode: 'KORE-DEF456',
    displayName: 'Ami1',
    totalXp: 800,
    level: 4,
    currentStreak: 2,
    totalTonnage: 40000,
    totalPrs: 8,
    totalSessions: 20,
    ...overrides,
  } as never
}

describe('generateFriendCode', () => {
  it('génère un code au format KORE-XXXXXX', () => {
    const code = generateFriendCode()
    expect(code).toMatch(/^KORE-[A-Z2-9]{6}$/)
  })

  it('génère des codes uniques', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateFriendCode()))
    expect(codes.size).toBeGreaterThan(1)
  })
})

describe('encodeFriendPayload / decodeFriendPayload', () => {
  it('encode et décode un payload correctement', () => {
    const user = makeUser()
    const encoded = encodeFriendPayload(user, 25)
    const decoded = decodeFriendPayload(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.code).toBe('KORE-ABC123')
    expect(decoded!.name).toBe('TestUser')
    expect(decoded!.xp).toBe(1000)
    expect(decoded!.sessions).toBe(25)
  })

  it('retourne null si payload invalide', () => {
    expect(decodeFriendPayload('invalid-base64!!!')).toBeNull()
  })

  it('retourne null si payload JSON sans champs requis', () => {
    const encoded = btoa(JSON.stringify({ foo: 'bar' }))
    expect(decodeFriendPayload(encoded)).toBeNull()
  })

  it('utilise Anonyme si user.name est vide', () => {
    const user = makeUser({ name: '' })
    const encoded = encodeFriendPayload(user, 5)
    const decoded = decodeFriendPayload(encoded)
    expect(decoded!.name).toBe('Anonyme')
  })
})

describe('buildLeaderboard', () => {
  it('retourne liste avec seulement le user si aucun ami', () => {
    const user = makeUser()
    const result = buildLeaderboard(user, 10, [])
    expect(result).toHaveLength(1)
    expect(result[0].isMe).toBe(true)
    expect(result[0].rank).toBe(1)
  })

  it('classe par XP décroissant par défaut', () => {
    const user = makeUser({ totalXp: 500 })
    const friend = makeFriend({ totalXp: 800 })
    const result = buildLeaderboard(user, 10, [friend], 'xp')
    expect(result[0].totalXp).toBe(800)
    expect(result[0].isMe).toBe(false)
    expect(result[1].totalXp).toBe(500)
    expect(result[1].isMe).toBe(true)
  })

  it('identifie le user courant avec isMe', () => {
    const user = makeUser({ totalXp: 2000 })
    const f1 = makeFriend({ totalXp: 1500, friendCode: 'KORE-111111' })
    const f2 = makeFriend({ totalXp: 1000, friendCode: 'KORE-222222' })
    const result = buildLeaderboard(user, 10, [f1, f2])
    const me = result.find(e => e.isMe)
    expect(me).toBeDefined()
    expect(me!.rank).toBe(1)
  })

  it('gère les égalités avec des rangs consécutifs', () => {
    const user = makeUser({ totalXp: 1000 })
    const friend = makeFriend({ totalXp: 1000 })
    const result = buildLeaderboard(user, 10, [friend])
    expect(result[0].rank).toBe(1)
    expect(result[1].rank).toBe(2)
  })

  it('trie par streak si demandé', () => {
    const user = makeUser({ currentStreak: 10 })
    const friend = makeFriend({ currentStreak: 20 })
    const result = buildLeaderboard(user, 10, [friend], 'streak')
    expect(result[0].currentStreak).toBe(20)
    expect(result[1].currentStreak).toBe(10)
  })
})
