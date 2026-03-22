import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class DailyVitals extends Model {
  static table = 'daily_vitals'

  @field('date') date!: number
  @field('resting_hr') restingHr!: number | null
  @field('hrv_rmssd') hrvRmssd!: number | null
  @field('source') source!: string

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
