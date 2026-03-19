import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class WearableSyncLog extends Model {
  static table = 'wearable_sync_logs'

  @date('sync_at') syncAt!: Date
  @field('provider') provider!: string
  @field('status') status!: string
  @field('records_synced') recordsSynced!: number | null
  @field('error_message') errorMessage!: string | null

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
