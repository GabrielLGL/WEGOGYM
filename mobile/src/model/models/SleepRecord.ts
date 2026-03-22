import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class SleepRecord extends Model {
  static table = 'sleep_records'

  @field('date') date!: number
  @field('duration_minutes') durationMinutes!: number
  @field('deep_minutes') deepMinutes!: number | null
  @field('light_minutes') lightMinutes!: number | null
  @field('rem_minutes') remMinutes!: number | null
  @field('awake_minutes') awakeMinutes!: number | null
  @field('source') source!: string

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
