import type User from '../models/User'

export interface PersonalChallenge {
  id: string
  icon: string
  title: string
  description: string
  progress: number
  currentValue: number
  targetValue: number
  completed: boolean
  unit: string
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
}

interface ChallengeDef {
  id: string
  icon: string
  metric: 'totalHistories' | 'totalTonnage' | 'totalPrs' | 'bestStreak' | 'level'
  target: number
  unit: string
  difficulty: PersonalChallenge['difficulty']
}

const CHALLENGE_DEFS: ChallengeDef[] = [
  { id: 'first_50',     icon: 'footsteps-outline',   metric: 'totalHistories', target: 50,        unit: 'séances',  difficulty: 'easy' },
  { id: 'first_100',    icon: 'shield-outline',       metric: 'totalHistories', target: 100,       unit: 'séances',  difficulty: 'medium' },
  { id: 'first_250',    icon: 'star-outline',          metric: 'totalHistories', target: 250,       unit: 'séances',  difficulty: 'hard' },
  { id: 'tonnage_50k',  icon: 'barbell-outline',       metric: 'totalTonnage',   target: 50000,     unit: 'kg',       difficulty: 'easy' },
  { id: 'tonnage_250k', icon: 'barbell-outline',       metric: 'totalTonnage',   target: 250000,    unit: 'kg',       difficulty: 'medium' },
  { id: 'tonnage_1M',   icon: 'barbell-outline',       metric: 'totalTonnage',   target: 1000000,   unit: 'kg',       difficulty: 'legendary' },
  { id: 'prs_25',       icon: 'trending-up-outline',   metric: 'totalPrs',       target: 25,        unit: 'PRs',      difficulty: 'easy' },
  { id: 'prs_100',      icon: 'trending-up-outline',   metric: 'totalPrs',       target: 100,       unit: 'PRs',      difficulty: 'medium' },
  { id: 'prs_500',      icon: 'trending-up-outline',   metric: 'totalPrs',       target: 500,       unit: 'PRs',      difficulty: 'hard' },
  { id: 'streak_4',     icon: 'flame-outline',         metric: 'bestStreak',     target: 4,         unit: 'semaines', difficulty: 'easy' },
  { id: 'streak_26',    icon: 'flame-outline',         metric: 'bestStreak',     target: 26,        unit: 'semaines', difficulty: 'hard' },
  { id: 'level_50',     icon: 'rocket-outline',        metric: 'level',          target: 50,        unit: 'level',    difficulty: 'legendary' },
]

function getMetricValue(user: User, totalHistories: number, metric: ChallengeDef['metric']): number {
  switch (metric) {
    case 'totalHistories': return totalHistories
    case 'totalTonnage':   return user.totalTonnage ?? 0
    case 'totalPrs':       return user.totalPrs ?? 0
    case 'bestStreak':     return user.bestStreak ?? 0
    case 'level':          return user.level ?? 0
  }
}

/**
 * Génère la liste des 12 défis personnels dynamiques.
 * Les cibles sont fixes, la progression est calculée depuis les données utilisateur.
 * Tri : non-complétés en premier (par progression décroissante), puis complétés.
 */
export function computePersonalChallenges(
  user: User,
  totalHistories: number,
): PersonalChallenge[] {
  const challenges = CHALLENGE_DEFS.map((def): PersonalChallenge => {
    const currentValue = getMetricValue(user, totalHistories, def.metric)
    const progress = Math.min(1, def.target > 0 ? currentValue / def.target : 0)
    return {
      id: def.id,
      icon: def.icon,
      title: def.id,
      description: def.id,
      progress,
      currentValue,
      targetValue: def.target,
      completed: progress >= 1,
      unit: def.unit,
      difficulty: def.difficulty,
    }
  })

  const incomplete = challenges.filter(c => !c.completed).sort((a, b) => b.progress - a.progress)
  const complete = challenges.filter(c => c.completed)
  return [...incomplete, ...complete]
}
