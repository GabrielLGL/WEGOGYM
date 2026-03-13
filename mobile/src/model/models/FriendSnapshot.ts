import { Model } from '@nozbe/watermelondb'
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators'

export default class FriendSnapshot extends Model {
  static table = 'friend_snapshots'

  @text('friend_code') friendCode!: string
  @text('display_name') displayName!: string
  @field('total_xp') totalXp!: number
  @field('level') level!: number
  @field('current_streak') currentStreak!: number
  @field('total_tonnage') totalTonnage!: number
  @field('total_prs') totalPrs!: number
  @field('total_sessions') totalSessions!: number
  @field('imported_at') importedAt!: number
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
