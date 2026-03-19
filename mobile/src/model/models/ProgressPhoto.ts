import { Model, Relation } from '@nozbe/watermelondb'
import { field, text, readonly, date, relation } from '@nozbe/watermelondb/decorators'
import BodyMeasurement from './BodyMeasurement'

export default class ProgressPhoto extends Model {
  static table = 'progress_photos'

  static associations = {
    body_measurements: { type: 'belongs_to' as const, key: 'body_measurement_id' },
  }

  @field('date') date!: number
  @text('photo_uri') photoUri!: string
  @text('category') category!: string | null
  @text('note') note!: string | null
  @field('body_measurement_id') bodyMeasurementId!: string | null
  @relation('body_measurements', 'body_measurement_id') bodyMeasurement!: Relation<BodyMeasurement>
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
