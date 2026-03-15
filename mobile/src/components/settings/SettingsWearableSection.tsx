import React, { useState, useCallback } from 'react'
import { View, Text, Switch, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Q } from '@nozbe/watermelondb'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import { database } from '../../model/index'
import { AlertDialog } from '../AlertDialog'
import { BottomSheet } from '../BottomSheet'
import { Button } from '../Button'
import User from '../../model/models/User'
import WearableSyncLog from '../../model/models/WearableSyncLog'
import BodyMeasurement from '../../model/models/BodyMeasurement'
import { getWearableService, WEARABLE_PROVIDER } from '../../services/wearableService'
import { spacing, fontSize, borderRadius } from '../../theme'
import type { SettingsStyles } from './settingsStyles'

interface SettingsWearableSectionProps {
  user: User | null
  styles: SettingsStyles
}

function formatTimeAgo(timestamp: number | null, t: ReturnType<typeof useLanguage>['t']): string {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t.wearable.timeAgo.justNow
  if (minutes < 60) return t.wearable.timeAgo.minutesAgo.replace('{n}', String(minutes))
  if (hours < 24) return t.wearable.timeAgo.hoursAgo.replace('{n}', String(hours))
  return t.wearable.timeAgo.daysAgo.replace('{n}', String(days))
}

export const SettingsWearableSection: React.FC<SettingsWearableSectionProps> = ({ user, styles }) => {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()

  const [syncing, setSyncing] = useState(false)
  const [disconnectAlertVisible, setDisconnectAlertVisible] = useState(false)
  const [permissionAlertVisible, setPermissionAlertVisible] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [syncLogs, setSyncLogs] = useState<WearableSyncLog[]>([])

  // Don't render if no wearable service available
  if (!WEARABLE_PROVIDER) return null

  const isConnected = !!user?.wearableProvider
  const providerLabel = isConnected
    ? t.wearable.provider[user.wearableProvider as 'health_connect' | 'healthkit']
    : ''

  const handleConnect = useCallback(async () => {
    if (!user) return
    try {
      const service = await getWearableService()
      if (!service) return

      const available = await service.isAvailable()
      if (!available) {
        setPermissionAlertVisible(true)
        return
      }

      const granted = await service.requestPermissions()
      if (!granted) {
        setPermissionAlertVisible(true)
        return
      }

      await database.write(async () => {
        await user.update(u => {
          u.wearableProvider = WEARABLE_PROVIDER
        })
      })
      haptics.onSuccess()

      // First sync
      await performSync(user)
    } catch (error) {
      if (__DEV__) console.error('[Wearable] Connect error:', error)
      setPermissionAlertVisible(true)
    }
  }, [user, haptics])

  const handleDisconnect = useCallback(async () => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => {
          u.wearableProvider = null
          u.wearableLastSyncAt = null
          u.wearableSyncWeight = false
        })
      })
      haptics.onSuccess()
      setDisconnectAlertVisible(false)
    } catch (error) {
      if (__DEV__) console.error('[Wearable] Disconnect error:', error)
    }
  }, [user, haptics])

  const handleToggleSyncWeight = useCallback(async () => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => {
          u.wearableSyncWeight = !u.wearableSyncWeight
        })
      })
      haptics.onSelect()
    } catch (error) {
      if (__DEV__) console.error('[Wearable] Toggle sync weight error:', error)
    }
  }, [user, haptics])

  const performSync = useCallback(async (currentUser: User) => {
    setSyncing(true)
    try {
      const service = await getWearableService()
      if (!service) return

      const lastSync = currentUser.wearableLastSyncAt
      const from = lastSync ? new Date(lastSync) : new Date(Date.now() - 30 * 86400000) // 30 days back
      const to = new Date()

      const weights = await service.fetchWeightRecords(from, to)

      let recordsSynced = 0
      if (weights.length > 0) {
        await database.write(async () => {
          const measurementsCollection = database.get<BodyMeasurement>('body_measurements')

          for (const w of weights) {
            // Check if measurement already exists for this date (same day)
            const dayStart = new Date(w.timestamp)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(w.timestamp)
            dayEnd.setHours(23, 59, 59, 999)

            const existing = await measurementsCollection.query(
              Q.where('date', Q.gte(dayStart.getTime())),
              Q.where('date', Q.lte(dayEnd.getTime()))
            ).fetchCount()

            if (existing === 0) {
              await measurementsCollection.create(m => {
                m.date = w.timestamp
                m.weight = w.weightKg
              })
              recordsSynced++
            }
          }

          // Create sync log
          await database.get<WearableSyncLog>('wearable_sync_logs').create(log => {
            log.syncAt = Date.now()
            log.provider = WEARABLE_PROVIDER!
            log.status = 'success'
            log.recordsSynced = recordsSynced
          })

          // Update last sync
          await currentUser.update(u => {
            u.wearableLastSyncAt = Date.now()
          })
        })
      } else {
        // No new data
        await database.write(async () => {
          await database.get<WearableSyncLog>('wearable_sync_logs').create(log => {
            log.syncAt = Date.now()
            log.provider = WEARABLE_PROVIDER!
            log.status = 'success'
            log.recordsSynced = 0
          })
          await currentUser.update(u => {
            u.wearableLastSyncAt = Date.now()
          })
        })
      }

      haptics.onSuccess()
    } catch (error) {
      if (__DEV__) console.error('[Wearable] Sync error:', error)
      // Log the error
      try {
        await database.write(async () => {
          await database.get<WearableSyncLog>('wearable_sync_logs').create(log => {
            log.syncAt = Date.now()
            log.provider = WEARABLE_PROVIDER!
            log.status = 'error'
            log.errorMessage = error instanceof Error ? error.message : 'Unknown error'
          })
        })
      } catch {
        // Ignore logging error
      }
    } finally {
      setSyncing(false)
    }
  }, [haptics])

  const handleSyncNow = useCallback(async () => {
    if (!user || syncing) return
    await performSync(user)
  }, [user, syncing, performSync])

  const handleShowHistory = useCallback(async () => {
    try {
      const logs = await database.get<WearableSyncLog>('wearable_sync_logs')
        .query(Q.sortBy('sync_at', Q.desc), Q.take(10))
        .fetch()
      setSyncLogs(logs)
      setHistoryVisible(true)
    } catch (error) {
      if (__DEV__) console.error('[Wearable] Fetch history error:', error)
    }
  }, [])

  const formatLogDate = (timestamp: number): string => {
    const d = new Date(timestamp)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = (status: string): { name: 'checkmark-circle' | 'close-circle' | 'alert-circle'; color: string } => {
    switch (status) {
      case 'success': return { name: 'checkmark-circle', color: colors.primary }
      case 'error': return { name: 'close-circle', color: colors.danger }
      default: return { name: 'alert-circle', color: colors.warning }
    }
  }

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Ionicons name="watch-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.wearable.title}</Text>
        </View>

        {/* Connection status */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingLabelRow}>
              <Ionicons
                name={isConnected ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={isConnected ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.settingLabel}>
                {isConnected
                  ? `${t.wearable.connected} — ${providerLabel}`
                  : t.wearable.notConnected
                }
              </Text>
            </View>
            {isConnected && user?.wearableLastSyncAt ? (
              <Text style={styles.settingDescription}>
                {t.wearable.lastSync} : {formatTimeAgo(user.wearableLastSyncAt, t)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Connect / Disconnect button */}
        <View style={{ paddingVertical: spacing.md }}>
          {isConnected ? (
            <Button
              variant="danger"
              size="md"
              onPress={() => {
                haptics.onPress()
                setDisconnectAlertVisible(true)
              }}
            >
              {t.wearable.disconnect}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                haptics.onPress()
                handleConnect()
              }}
            >
              {`${t.wearable.connect} ${t.wearable.provider[WEARABLE_PROVIDER as 'health_connect' | 'healthkit']}`}
            </Button>
          )}
        </View>

        {/* Toggles — only when connected */}
        {isConnected && (
          <>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingLabelRow}>
                  <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>{t.wearable.autoSyncWeight}</Text>
                </View>
                <Text style={styles.settingDescription}>{t.wearable.autoSyncWeightDescription}</Text>
              </View>
              <Switch
                value={user?.wearableSyncWeight ?? false}
                onValueChange={handleToggleSyncWeight}
                trackColor={{ false: colors.cardSecondary, true: colors.primary }}
                thumbColor={colors.switchThumb}
              />
            </View>

            {/* Sync now button */}
            <View style={{ paddingVertical: spacing.sm }}>
              <Button
                variant="secondary"
                size="md"
                onPress={handleSyncNow}
              >
                {syncing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <ActivityIndicator size="small" color={colors.text} />
                    <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                      {t.wearable.syncing}
                    </Text>
                  </View>
                ) : (
                  t.wearable.syncNow
                )}
              </Button>
            </View>

            {/* Sync history */}
            <TouchableOpacity
              style={[styles.settingRow, styles.settingRowLast]}
              onPress={handleShowHistory}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingLabelRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>{t.wearable.syncHistory}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Disconnect confirmation */}
      <AlertDialog
        visible={disconnectAlertVisible}
        title={t.wearable.disconnectConfirmTitle}
        message={t.wearable.disconnectConfirmMessage}
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectAlertVisible(false)}
        confirmText={t.wearable.disconnect}
        cancelText={t.common.cancel}
      />

      {/* Permission denied alert */}
      <AlertDialog
        visible={permissionAlertVisible}
        title={t.common.error}
        message={t.wearable.permissionDenied}
        onConfirm={() => setPermissionAlertVisible(false)}
        onCancel={() => setPermissionAlertVisible(false)}
        confirmText={t.common.ok}
        cancelText={t.common.cancel}
      />

      {/* Sync history bottom sheet */}
      <BottomSheet
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        title={t.wearable.syncHistory}
      >
        {syncLogs.length === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, paddingVertical: spacing.lg, textAlign: 'center' }}>
            {t.wearable.noNewData}
          </Text>
        ) : (
          syncLogs.map(log => {
            const statusIcon = getStatusIcon(log.status)
            return (
              <View
                key={log.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.cardSecondary,
                }}
              >
                <Ionicons name={statusIcon.name} size={20} color={statusIcon.color} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: '600' }}>
                    {formatLogDate(log.syncAt)}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    {log.status === 'error'
                      ? log.errorMessage ?? t.wearable.syncError
                      : log.recordsSynced != null
                        ? `${log.recordsSynced} ${t.wearable.weightsImported}`
                        : t.wearable.noNewData
                    }
                  </Text>
                </View>
              </View>
            )
          })
        )}
      </BottomSheet>
    </>
  )
}
