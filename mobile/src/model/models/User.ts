import { Model } from '@nozbe/watermelondb'
import { text, date, readonly, field } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  @text('email') email!: string
  @text('username') username?: string

  // Indispensable pour la version 13
  @field('timer_enabled') timerEnabled!: boolean

  // Ajout de la durée de repos pour la version 14
  @field('rest_duration') restDuration!: number

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}