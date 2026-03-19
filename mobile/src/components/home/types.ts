import type { Ionicons } from '@expo/vector-icons'
import type { MilestoneEvent } from '../../model/utils/gamificationHelpers'
import type { BadgeDefinition } from '../../model/utils/badgeConstants'
import type { RootStackParamList } from '../../navigation'

export interface Tile {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  route: keyof RootStackParamList
}

export interface Section {
  title: string
  tiles: Tile[]
}

export type CelebrationItem =
  | { type: 'milestone'; data: MilestoneEvent }
  | { type: 'badge'; data: BadgeDefinition }
