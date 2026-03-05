import { Platform } from 'react-native'

const CHANNEL_ID = 'rest-timer'
const REMINDER_CHANNEL_ID = 'training-reminders'

// Lazy-load expo-notifications to avoid crashing when the native module
// (ExpoPushTokenManager) is unavailable (e.g. Expo Go, missing native build).
function getNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications') as typeof import('expo-notifications')
  } catch {
    return null
  }
}

export async function setupNotificationChannel(): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications || Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Minuteur de repos',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
  })
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications()
  if (!Notifications) return false

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleRestEndNotification(
  durationSeconds: number
): Promise<string | null> {
  const Notifications = getNotifications()
  if (!Notifications) return null

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Repos terminé !',
        body: 'Prêt pour la prochaine série ?',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: durationSeconds,
      },
    })
    return identifier
  } catch {
    return null
  }
}

export async function cancelNotification(identifier: string): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications) return
  await Notifications.cancelScheduledNotificationAsync(identifier)
}

// --- Training Reminders ---

export async function setupReminderChannel(): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications || Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Rappels d\'entraînement',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
  })
}

/**
 * Convert ISO weekday (1=Monday..7=Sunday) to JS weekday (1=Sunday..7=Saturday)
 * used by expo-notifications WeeklyTriggerInput.
 */
export function isoToExpoWeekday(isoDay: number): number {
  // ISO: 1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat,7=Sun
  // Expo: 1=Sun,2=Mon,3=Tue,4=Wed,5=Thu,6=Fri,7=Sat
  return isoDay === 7 ? 1 : isoDay + 1
}

export async function scheduleWeeklyReminders(
  days: number[],
  hour: number,
  minute: number,
  title = 'C\'est l\'heure de s\'entraîner !',
  body = 'Ton programme t\'attend sur Kore'
): Promise<string[]> {
  const Notifications = getNotifications()
  if (!Notifications) return []

  const identifiers: string[] = []
  for (const isoDay of days) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId: REMINDER_CHANNEL_ID,
          weekday: isoToExpoWeekday(isoDay),
          hour,
          minute,
        },
      })
      identifiers.push(id)
    } catch {
      // Skip this day if scheduling fails
    }
  }
  return identifiers
}

export async function cancelAllReminders(): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications) return
  // Cancel only reminder-channel notifications (preserves rest timer)
  const all = await Notifications.getAllScheduledNotificationsAsync()
  for (const notif of all) {
    const trigger = notif.trigger as Record<string, unknown> | null
    if (trigger && trigger['channelId'] === REMINDER_CHANNEL_ID) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier)
    }
  }
}

export async function updateReminders(
  enabled: boolean,
  days: number[],
  hour: number,
  minute: number,
  title?: string,
  body?: string
): Promise<string[]> {
  await cancelAllReminders()
  if (!enabled || days.length === 0) return []
  return scheduleWeeklyReminders(days, hour, minute, title, body)
}
