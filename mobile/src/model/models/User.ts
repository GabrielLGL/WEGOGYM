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

  // Profil utilisateur — version 20
  @text('user_level') userLevel!: string | null
  @text('user_goal') userGoal!: string | null

  // Ajout du prénom pour la version 17
  @text('name') name!: string | null

  // Ajout des champs IA pour la version 16
  @text('ai_provider') aiProvider!: string | null
  @text('ai_api_key') aiApiKey!: string | null

  // Gamification — version 19
  @field('total_xp') totalXp!: number
  @field('level') level!: number
  @field('current_streak') currentStreak!: number
  @field('best_streak') bestStreak!: number
  @field('streak_target') streakTarget!: number
  @field('total_tonnage') totalTonnage!: number
  @text('last_workout_week') lastWorkoutWeek!: string | null

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}