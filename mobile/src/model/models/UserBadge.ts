import { Model } from '@nozbe/watermelondb'
import { text, date, readonly } from '@nozbe/watermelondb/decorators'

export default class UserBadge extends Model {
  static table = 'user_badges'

  @text('badge_id') badgeId!: string
  @date('unlocked_at') unlockedAt!: Date

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
