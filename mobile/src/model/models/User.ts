import { Model } from '@nozbe/watermelondb'
import { text, date, readonly, field } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  @text('email') email!: string

  // Indispensable pour la version 13
  @field('timer_enabled') timerEnabled!: boolean

  // Ajout de la durée de repos pour la version 14
  @field('rest_duration') restDuration!: number

  // Ajout du flag onboarding pour la version 15
  @field('onboarding_completed') onboardingCompleted!: boolean

  // Ajout des champs IA pour la version 16
  @text('ai_provider') aiProvider!: string | null
  @text('ai_api_key') aiApiKey!: string | null

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}