import { Share } from 'react-native'
import * as Sharing from 'expo-sharing'
import type { RefObject } from 'react'
import type ViewShot from 'react-native-view-shot'
import type { Translations } from '../i18n'

// ── Types ────────────────────────────────────────────────────────────────

export interface WorkoutShareData {
  durationSeconds: number
  totalVolume: number
  totalSets: number
  totalPrs: number
  xpGained: number
  level: number
  currentStreak: number
  newBadges: { title: string; icon: string }[]
  exerciseNames: string[]
}

export interface BadgeShareData {
  title: string
  description: string
  icon: string
  category: string
  unlockedAt: Date
}

export interface PRShareData {
  exerciseName: string
  weight: number
  reps: number
  estimated1RM: number
  date: Date
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Format a number with space as thousands separator (e.g. 8500 → "8 500") */
function formatNumber(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
}

/** Convert seconds to a human-readable duration string */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`
  }
  return `${minutes}min`
}

// ── Text generators ─────────────────────────────────────────────────────

export function generateWorkoutShareText(
  data: WorkoutShareData,
  t: Translations,
): string {
  const lines: string[] = []

  lines.push(`\u{1F3CB}\u{FE0F} ${t.share.workoutTitle}`)
  lines.push(
    `\u23F1\u{FE0F} ${formatDuration(data.durationSeconds)} | \u{1F4CA} ${formatNumber(data.totalVolume)} kg | ${data.totalSets} ${t.share.sets}`,
  )
  lines.push(
    `\u2B50 +${data.xpGained} XP | ${t.share.level} ${data.level} | \u{1F525} ${data.currentStreak} ${t.share.streakWeeks}`,
  )

  if (data.totalPrs > 0) {
    lines.push(`\u{1F947} ${data.totalPrs} ${t.share.prsBeaten}`)
  }

  for (const badge of data.newBadges) {
    lines.push(`\u{1F3C5} ${t.share.badgeUnlocked} : ${badge.title}`)
  }

  lines.push('')
  lines.push(t.share.hashtags)

  return lines.join('\n')
}

export function generateBadgeShareText(
  data: BadgeShareData,
  t: Translations,
): string {
  const lines: string[] = []

  lines.push(`\u{1F3C5} ${t.share.badgeTitle}`)
  lines.push(`${data.icon} ${data.title}`)
  lines.push(data.description)
  lines.push('')
  lines.push(t.share.hashtags)

  return lines.join('\n')
}

export function generatePRShareText(
  data: PRShareData,
  t: Translations,
): string {
  const lines: string[] = []

  lines.push(`\u{1F947} ${t.share.prTitle}`)
  lines.push(`${data.exerciseName} : ${formatNumber(data.weight)} kg \u00D7 ${data.reps} reps`)
  lines.push(`\u{1F4C8} ${t.share.estimated1RM} : ${formatNumber(data.estimated1RM)} kg`)
  lines.push('')
  lines.push(t.share.hashtags)

  return lines.join('\n')
}

// ── Share actions ────────────────────────────────────────────────────────

export async function shareText(text: string): Promise<void> {
  await Share.share({ message: text })
}

export async function shareImage(
  viewShotRef: RefObject<ViewShot>,
): Promise<void> {
  if (!viewShotRef.current?.capture) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('shareImage: viewShotRef.current or capture is not available')
    }
    return
  }

  const uri = await viewShotRef.current.capture()
  await Sharing.shareAsync(uri, { mimeType: 'image/png' })
}
