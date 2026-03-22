import { Model } from '@nozbe/watermelondb'
import { text, date, readonly, field } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  @text('email') email!: string

  // Indispensable pour la version 13
  @field('timer_enabled') timerEnabled!: boolean

  // Préférences timer son & vibration — version 25
  @field('vibration_enabled') vibrationEnabled!: boolean
  @field('timer_sound_enabled') timerSoundEnabled!: boolean

  // Ajout de la durée de repos pour la version 14
  @field('rest_duration') restDuration!: number

  // Ajout du flag onboarding pour la version 15
  @field('onboarding_completed') onboardingCompleted!: boolean

  // Profil utilisateur — version 20
  @text('user_level') userLevel!: string | null
  @text('user_goal') userGoal!: string | null

  // Ajout du prénom pour la version 17
  @text('name') name!: string | null

  // Ajout du provider IA pour la version 16
  @text('ai_provider') aiProvider!: string | null

  // Gamification — version 19
  @field('total_xp') totalXp!: number
  @field('level') level!: number
  @field('current_streak') currentStreak!: number
  @field('best_streak') bestStreak!: number
  @field('streak_target') streakTarget!: number
  @field('total_tonnage') totalTonnage!: number
  @text('last_workout_week') lastWorkoutWeek!: string | null

  // Gamification Pro — version 22
  @field('total_prs') totalPrs!: number

  // Thème dynamique — version 23
  @text('theme_mode') themeMode!: string | null

  // Langue — version 26
  @text('language_mode') languageMode!: string | null

  // Tutoriel contextuel — version 28
  @field('tutorial_completed') tutorialCompleted!: boolean

  // Disclaimer & CGU — version 33
  @field('disclaimer_accepted') disclaimerAccepted!: boolean
  @text('cgu_version_accepted') cguVersionAccepted!: string | null

  // Leaderboard amis — version 37
  @text('friend_code') friendCode!: string | null

  // Wearables — version 38
  @text('wearable_provider') wearableProvider!: string | null
  @field('wearable_sync_weight') wearableSyncWeight!: boolean
  @date('wearable_last_sync_at') wearableLastSyncAt!: Date | null

  // Unités de poids — version 41
  @text('unit_mode') unitMode!: string | null  // 'metric' | 'imperial', default metric (null = metric)

  // Rappels d'entraînement — version 31
  @field('reminders_enabled') remindersEnabled!: boolean
  @text('reminder_days') reminderDays!: string | null  // JSON: "[1,3,5]" (ISO weekday)
  @field('reminder_hour') reminderHour!: number         // 0-23, default 18
  @field('reminder_minute') reminderMinute!: number     // 0-59, default 0

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}