import {
  setupNotificationChannel,
  requestNotificationPermission,
  scheduleRestEndNotification,
  cancelNotification,
  setupReminderChannel,
  isoToExpoWeekday,
  scheduleWeeklyReminders,
  cancelAllReminders,
  updateReminders,
} from '../notificationService'

import * as Notifications from 'expo-notifications'

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 5 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval', WEEKLY: 'weekly' },
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'undetermined' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
}))

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}))

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('setupNotificationChannel', () => {
    it('creates android channel with correct config', async () => {
      await setupNotificationChannel()

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'rest-timer',
        expect.objectContaining({
          name: 'Minuteur de repos',
          importance: 5,
        })
      )
    })
  })

  describe('requestNotificationPermission', () => {
    it('returns true when permission already granted', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      })

      const result = await requestNotificationPermission()

      expect(result).toBe(true)
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled()
    })

    it('requests permission when not granted and returns true on approval', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      })
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      })

      const result = await requestNotificationPermission()

      expect(result).toBe(true)
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled()
    })

    it('returns false when permission denied', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      })
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      })

      const result = await requestNotificationPermission()

      expect(result).toBe(false)
    })
  })

  describe('scheduleRestEndNotification', () => {
    it('schedules notification and returns identifier', async () => {
      const id = await scheduleRestEndNotification(90)

      expect(id).toBe('notif-id-123')
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Repos terminé !',
          }),
          trigger: expect.objectContaining({
            seconds: 90,
          }),
        })
      )
    })

    it('returns null when scheduling fails', async () => {
      ;(Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('scheduling error')
      )

      const id = await scheduleRestEndNotification(60)

      expect(id).toBeNull()
    })
  })

  describe('cancelNotification', () => {
    it('cancels notification by identifier', async () => {
      await cancelNotification('notif-id-123')

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notif-id-123'
      )
    })
  })

  // --- Training Reminders ---

  describe('setupReminderChannel', () => {
    it('creates reminder channel with correct config', async () => {
      await setupReminderChannel()

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'training-reminders',
        expect.objectContaining({
          name: "Rappels d'entraînement",
          importance: 5,
        })
      )
    })
  })

  describe('isoToExpoWeekday', () => {
    it('converts ISO Monday (1) to Expo Monday (2)', () => {
      expect(isoToExpoWeekday(1)).toBe(2)
    })

    it('converts ISO Sunday (7) to Expo Sunday (1)', () => {
      expect(isoToExpoWeekday(7)).toBe(1)
    })

    it('converts ISO Saturday (6) to Expo Saturday (7)', () => {
      expect(isoToExpoWeekday(6)).toBe(7)
    })

    it('converts ISO Wednesday (3) to Expo Wednesday (4)', () => {
      expect(isoToExpoWeekday(3)).toBe(4)
    })
  })

  describe('scheduleWeeklyReminders', () => {
    it('schedules one notification per day', async () => {
      let callCount = 0
      ;(Notifications.scheduleNotificationAsync as jest.Mock).mockImplementation(() => {
        callCount++
        return Promise.resolve(`reminder-${callCount}`)
      })

      const ids = await scheduleWeeklyReminders([1, 3, 5], 18, 0)

      expect(ids).toHaveLength(3)
      expect(ids).toEqual(['reminder-1', 'reminder-2', 'reminder-3'])
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3)

      // Check first call uses correct weekday mapping (ISO 1=Mon -> Expo 2=Mon)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: "C'est l'heure de s'entraîner !",
          }),
          trigger: expect.objectContaining({
            type: 'weekly',
            weekday: 2, // Monday in expo format
            hour: 18,
            minute: 0,
          }),
        })
      )
    })

    it('returns empty array when no days provided', async () => {
      const ids = await scheduleWeeklyReminders([], 18, 0)
      expect(ids).toHaveLength(0)
    })

    it('skips days that fail to schedule', async () => {
      ;(Notifications.scheduleNotificationAsync as jest.Mock)
        .mockResolvedValueOnce('ok-1')
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('ok-3')

      const ids = await scheduleWeeklyReminders([1, 3, 5], 18, 0)

      expect(ids).toEqual(['ok-1', 'ok-3'])
    })
  })

  describe('cancelAllReminders', () => {
    it('cancels only reminder-channel notifications', async () => {
      ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        { identifier: 'rest-1', trigger: { channelId: 'rest-timer' } },
        { identifier: 'rem-1', trigger: { channelId: 'training-reminders' } },
        { identifier: 'rem-2', trigger: { channelId: 'training-reminders' } },
      ])

      await cancelAllReminders()

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2)
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('rem-1')
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('rem-2')
    })

    it('does nothing when no scheduled notifications', async () => {
      ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([])

      await cancelAllReminders()

      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled()
    })
  })

  describe('updateReminders', () => {
    it('cancels old and schedules new when enabled', async () => {
      ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([])
      ;(Notifications.scheduleNotificationAsync as jest.Mock)
        .mockResolvedValueOnce('new-1')
        .mockResolvedValueOnce('new-2')

      const ids = await updateReminders(true, [1, 5], 9, 30)

      expect(ids).toEqual(['new-1', 'new-2'])
    })

    it('only cancels when disabled', async () => {
      ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        { identifier: 'rem-1', trigger: { channelId: 'training-reminders' } },
      ])

      const ids = await updateReminders(false, [1, 5], 9, 30)

      expect(ids).toEqual([])
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('rem-1')
    })
  })
})
