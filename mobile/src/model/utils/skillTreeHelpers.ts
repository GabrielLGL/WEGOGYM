// ─── Skill Tree — Helpers ─────────────────────────────────────────────────────
// Calcule les 4 branches de l'arbre de compétences à la volée depuis User.

import type User from '../models/User'
import type { ThemeColors } from '../../theme'

export interface SkillNode {
  id: string
  label: string
  threshold: number
  unlocked: boolean
}

export interface SkillBranch {
  id: 'force' | 'endurance' | 'mobilite' | 'regularite'
  label: string
  icon: string
  color: string
  nodes: SkillNode[]
  progress: number       // 0-1 : fraction de nœuds débloqués
  currentValue: number
  nextThreshold: number  // -1 si tous débloqués
}

// ─── Seuils par branche ───────────────────────────────────────────────────────

const FORCE_THRESHOLDS = [1, 5, 10, 25, 50, 100]
const ENDURANCE_THRESHOLDS = [1000, 5000, 25000, 100000, 500000]
const MOBILITE_THRESHOLDS = [5, 10, 20, 30, 50]
const REGULARITE_THRESHOLDS = [2, 4, 8, 16, 30, 52]

function formatForceLabel(t: number): string {
  return `${t} PR${t > 1 ? 's' : ''}`
}
function formatEnduranceLabel(t: number): string {
  if (t >= 1000) return `${t / 1000}k kg`
  return `${t} kg`
}
function formatMobiliteLabel(t: number): string {
  return `${t} exercices`
}
function formatRegulariteLabel(t: number): string {
  return `${t} sem.`
}

function buildNodes(
  thresholds: number[],
  currentValue: number,
  branchId: string,
  labelFn: (t: number) => string,
): SkillNode[] {
  return thresholds.map(t => ({
    id: `${branchId}_${t}`,
    label: labelFn(t),
    threshold: t,
    unlocked: currentValue >= t,
  }))
}

function getProgress(nodes: SkillNode[]): number {
  if (nodes.length === 0) return 0
  const unlocked = nodes.filter(n => n.unlocked).length
  return unlocked / nodes.length
}

function getNextThreshold(nodes: SkillNode[]): number {
  const locked = nodes.find(n => !n.unlocked)
  return locked ? locked.threshold : -1
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function computeSkillTree(user: User, distinctExerciseCount: number, colors: ThemeColors): SkillBranch[] {
  const totalPrs = user.totalPrs ?? 0
  const totalTonnage = user.totalTonnage ?? 0
  const bestStreak = user.bestStreak ?? 0

  const forceNodes = buildNodes(FORCE_THRESHOLDS, totalPrs, 'force', formatForceLabel)
  const enduranceNodes = buildNodes(ENDURANCE_THRESHOLDS, totalTonnage, 'endurance', formatEnduranceLabel)
  const mobiliteNodes = buildNodes(MOBILITE_THRESHOLDS, distinctExerciseCount, 'mobilite', formatMobiliteLabel)
  const regulariteNodes = buildNodes(REGULARITE_THRESHOLDS, bestStreak, 'regularite', formatRegulariteLabel)

  return [
    {
      id: 'force',
      label: 'Force',
      icon: 'flash-outline',
      color: colors.primary,
      nodes: forceNodes,
      progress: getProgress(forceNodes),
      currentValue: totalPrs,
      nextThreshold: getNextThreshold(forceNodes),
    },
    {
      id: 'endurance',
      label: 'Endurance',
      icon: 'flame-outline',
      color: colors.warning,
      nodes: enduranceNodes,
      progress: getProgress(enduranceNodes),
      currentValue: totalTonnage,
      nextThreshold: getNextThreshold(enduranceNodes),
    },
    {
      id: 'mobilite',
      label: 'Mobilité',
      icon: 'body-outline',
      color: colors.danger,
      nodes: mobiliteNodes,
      progress: getProgress(mobiliteNodes),
      currentValue: distinctExerciseCount,
      nextThreshold: getNextThreshold(mobiliteNodes),
    },
    {
      id: 'regularite',
      label: 'Régularité',
      icon: 'calendar-outline',
      color: colors.textSecondary,
      nodes: regulariteNodes,
      progress: getProgress(regulariteNodes),
      currentValue: bestStreak,
      nextThreshold: getNextThreshold(regulariteNodes),
    },
  ]
}
