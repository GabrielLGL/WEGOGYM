/**
 * LeaderboardScreen — Classement entre amis
 *
 * Affiche :
 * - Le code encodé personnel à partager
 * - Le classement trié par XP / Streak / Tonnage / PRs
 * - Un BottomSheet pour importer un ami
 * - Un AlertDialog pour confirmer la suppression d'un ami
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Share,
  ActivityIndicator,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { map } from 'rxjs/operators'

import { database } from '../model'
import User from '../model/models/User'
import FriendSnapshot from '../model/models/FriendSnapshot'
import History from '../model/models/History'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useFriendManager } from '../hooks/useFriendManager'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import {
  encodeFriendPayload,
  buildLeaderboard,
  type LeaderboardEntry,
  type LeaderboardSort,
} from '../model/utils/leaderboardHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import type { ThemeColors } from '../theme'
import { formatTonnage } from '../model/utils/gamificationHelpers'
import type { Translations } from '../i18n'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(ms: number, t: Translations): string {
  const diff = Date.now() - ms
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return t.leaderboard.today
  if (days === 1) return t.leaderboard.yesterday
  return t.leaderboard.daysAgo(days)
}

function rankEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}.`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeaderboardScreenProps {
  user: User
  friends: FriendSnapshot[]
  histories: History[]
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function LeaderboardScreenBase({ user, friends, histories }: LeaderboardScreenProps) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const haptics = useHaptics()

  const [sort, setSort] = useState<LeaderboardSort>('xp')
  const [importText, setImportText] = useState('')
  const [importResult, setImportResult] = useState<'success' | 'invalid' | 'duplicate' | 'self' | null>(null)
  const [selectedFriendCode, setSelectedFriendCode] = useState<string | null>(null)

  const addModal = useModalState()
  const removeAlert = useModalState()

  const { importFriend, removeFriend, isImporting } = useFriendManager()

  const totalSessions = histories.length

  const encodedCode = useMemo(
    () => encodeFriendPayload(user, totalSessions),
    [user, totalSessions]
  )

  const leaderboard = useMemo(
    () => buildLeaderboard(user, totalSessions, friends, sort),
    [user, totalSessions, friends, sort]
  )

  const SORT_OPTIONS: { key: LeaderboardSort; label: string }[] = [
    { key: 'xp', label: t.leaderboard.sortXp },
    { key: 'streak', label: t.leaderboard.sortStreak },
    { key: 'tonnage', label: t.leaderboard.sortTonnage },
    { key: 'prs', label: t.leaderboard.sortPrs },
  ]

  const handleCopyCode = useCallback(async () => {
    await Clipboard.setStringAsync(encodedCode)
    haptics.onSuccess()
  }, [encodedCode, haptics])

  const handleShareCode = useCallback(async () => {
    try {
      await Share.share({ message: encodedCode })
      haptics.onSuccess()
    } catch {
      // User cancelled share — no action needed
    }
  }, [encodedCode, haptics])

  const handleImport = useCallback(async () => {
    const result = await importFriend(importText.trim())
    setImportResult(result)
    if (result === 'success') {
      haptics.onSuccess()
      setImportText('')
    } else {
      haptics.onError()
    }
  }, [importText, importFriend, haptics])

  const handleOpenRemove = useCallback((friendCode: string) => {
    haptics.onDelete()
    setSelectedFriendCode(friendCode)
    removeAlert.open()
  }, [haptics, removeAlert])

  const handleConfirmRemove = useCallback(async () => {
    if (!selectedFriendCode) return
    await removeFriend(selectedFriendCode)
    setSelectedFriendCode(null)
    removeAlert.close()
  }, [selectedFriendCode, removeFriend, removeAlert])

  const handleOpenAddModal = useCallback(() => {
    haptics.onPress()
    setImportText('')
    setImportResult(null)
    addModal.open()
  }, [haptics, addModal])

  const getSecondaryValue = (entry: LeaderboardEntry): string => {
    switch (sort) {
      case 'xp':
        return `${entry.totalXp.toLocaleString()} XP`
      case 'streak':
        return `${entry.currentStreak} sem. streak`
      case 'tonnage':
        return formatTonnage(entry.totalTonnage)
      case 'prs':
        return `${entry.totalPrs} PRs`
    }
  }

  const getImportResultMessage = (): string | null => {
    switch (importResult) {
      case 'success': return t.leaderboard.importSuccess
      case 'invalid': return t.leaderboard.importInvalid
      case 'duplicate': return t.leaderboard.importDuplicate
      case 'self': return t.leaderboard.importSelf
      default: return null
    }
  }

  const importResultColor = importResult === 'success' || importResult === 'duplicate'
    ? colors.primary
    : colors.danger

  const importResultMessage = getImportResultMessage()

  // Find friend to get importedAt date for display
  const selectedFriendForRemoval = friends.find(f => f.friendCode === selectedFriendCode)

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Section Mon Code ── */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t.leaderboard.myCode.toUpperCase()}
        </Text>
        <View style={styles.codeRow}>
          <Text
            style={[styles.codeText, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {encodedCode}
          </Text>
          <TouchableOpacity
            style={[styles.copyBtn, { backgroundColor: colors.cardSecondary }]}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.copyBtnIcon}>📋</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
          onPress={handleShareCode}
          activeOpacity={0.7}
        >
          <Text style={[styles.shareBtnText, { color: colors.primaryText }]}>
            {t.leaderboard.shareCode}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Section Classement ── */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.leaderboardHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {t.leaderboard.title.toUpperCase()}
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primaryBg }]}
            onPress={handleOpenAddModal}
            activeOpacity={0.7}
          >
            <Text style={[styles.addBtnText, { color: colors.primary }]}>
              + {t.leaderboard.addFriend}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortRow}
          contentContainerStyle={styles.sortRowContent}
        >
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortChip,
                { backgroundColor: sort === option.key ? colors.primary : colors.cardSecondary },
              ]}
              onPress={() => {
                haptics.onSelect()
                setSort(option.key)
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sortChipText,
                  { color: sort === option.key ? colors.primaryText : colors.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Entries */}
        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon]}>🏆</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t.leaderboard.noFriends}
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              {t.leaderboard.noFriendsHint}
            </Text>
          </View>
        ) : (
          leaderboard.map((entry, index) => {
            const friendSnap = friends.find(f => f.friendCode === entry.friendCode)
            return (
              <View
                key={entry.friendCode}
                style={[
                  styles.entryRow,
                  index < leaderboard.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.separator },
                ]}
              >
                {/* Rang */}
                <Text style={[styles.rankText, { color: colors.text }]}>
                  {rankEmoji(entry.rank)}
                </Text>

                {/* Info */}
                <View style={styles.entryInfo}>
                  <View style={styles.entryNameRow}>
                    <Text style={[styles.entryName, { color: colors.text }]} numberOfLines={1}>
                      {entry.displayName}
                    </Text>
                    {entry.isMe && (
                      <View style={[styles.meBadge, { backgroundColor: colors.primaryBg }]}>
                        <Text style={[styles.meBadgeText, { color: colors.primary }]}>
                          {t.leaderboard.me}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.entryLevel, { color: colors.textSecondary }]}>
                    {t.leaderboard.level}{entry.level} · {getSecondaryValue(entry)}
                  </Text>
                  {!entry.isMe && friendSnap && (
                    <Text style={[styles.entryDate, { color: colors.placeholder }]}>
                      {t.leaderboard.lastUpdated} {formatRelative(friendSnap.importedAt, t)}
                    </Text>
                  )}
                </View>

                {/* Delete button */}
                {!entry.isMe && (
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: colors.cardSecondary }]}
                    onPress={() => handleOpenRemove(entry.friendCode)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteBtnIcon}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          })
        )}
      </View>

      {/* ── BottomSheet Ajouter un ami ── */}
      <BottomSheet
        visible={addModal.isOpen}
        onClose={() => {
          addModal.close()
          setImportResult(null)
        }}
        title={t.leaderboard.addFriend}
      >
        <View style={styles.importContainer}>
          <Text style={[styles.importLabel, { color: colors.textSecondary }]}>
            {t.leaderboard.importCode}
          </Text>
          <TextInput
            style={[styles.importInput, {
              backgroundColor: colors.cardSecondary,
              color: colors.text,
              borderColor: colors.separator,
            }]}
            value={importText}
            onChangeText={text => {
              setImportText(text)
              setImportResult(null)
            }}
            placeholder={t.leaderboard.importPlaceholder}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            multiline={false}
          />
          {importResultMessage !== null && (
            <Text style={[styles.importResultText, { color: importResultColor }]}>
              {importResultMessage}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.importBtn,
              {
                backgroundColor: importText.trim().length > 0 ? colors.primary : colors.cardSecondary,
                opacity: isImporting ? 0.6 : 1,
              },
            ]}
            onPress={handleImport}
            disabled={isImporting || importText.trim().length === 0}
            activeOpacity={0.7}
          >
            {isImporting ? (
              <ActivityIndicator color={colors.primaryText} size="small" />
            ) : (
              <Text style={[
                styles.importBtnText,
                { color: importText.trim().length > 0 ? colors.primaryText : colors.textSecondary },
              ]}>
                {t.leaderboard.importButton}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* ── AlertDialog Retirer un ami ── */}
      <AlertDialog
        visible={removeAlert.isOpen}
        title={`${t.leaderboard.removeFriend} ?`}
        message={selectedFriendForRemoval
          ? `${selectedFriendForRemoval.displayName} — ${t.leaderboard.removeFriendConfirm}`
          : t.leaderboard.removeFriendConfirm
        }
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setSelectedFriendCode(null)
          removeAlert.close()
        }}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        confirmColor={colors.danger}
      />
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    card: {
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    sectionLabel: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
    },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    codeText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: 'monospace' as const,
    },
    copyBtn: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    copyBtnIcon: {
      fontSize: fontSize.md,
    },
    shareBtn: {
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    shareBtnText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    leaderboardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    addBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    addBtnText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    sortRow: {
      marginBottom: spacing.md,
    },
    sortRowContent: {
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    sortChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    sortChipText: {
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    emptyIcon: {
      fontSize: fontSize.jumbo,
    },
    emptyTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    emptyHint: {
      fontSize: fontSize.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
    entryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    rankText: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      minWidth: 36,
      textAlign: 'center',
    },
    entryInfo: {
      flex: 1,
    },
    entryNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    entryName: {
      fontSize: fontSize.bodyMd,
      fontWeight: '700',
    },
    meBadge: {
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
    },
    meBadgeText: {
      fontSize: fontSize.caption,
      fontWeight: '700',
    },
    entryLevel: {
      fontSize: fontSize.xs,
      marginTop: 2,
    },
    entryDate: {
      fontSize: fontSize.caption,
      marginTop: 1,
    },
    deleteBtn: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    deleteBtnIcon: {
      fontSize: fontSize.md,
    },
    // BottomSheet import
    importContainer: {
      gap: spacing.sm,
    },
    importLabel: {
      fontSize: fontSize.sm,
    },
    importInput: {
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSize.sm,
      borderWidth: 1,
    },
    importResultText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    importBtn: {
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    importBtnText: {
      fontSize: fontSize.md,
      fontWeight: '700',
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  user: database.get<User>('users').query(Q.take(1)).observe().pipe(
    map((users: User[]) => users[0])
  ),
  friends: database.get<FriendSnapshot>('friend_snapshots').query().observe(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false))
  ).observe(),
}))

const Enhanced = enhance(LeaderboardScreenBase)

function LeaderboardScreen(props: Record<string, unknown>) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])
  if (!ready) return null
  return <Enhanced {...props} />
}

export default LeaderboardScreen
