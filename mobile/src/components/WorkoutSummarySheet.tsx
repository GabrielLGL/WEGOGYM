import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { updateHistoryNote } from '../model/utils/databaseHelpers'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface WorkoutSummarySheetProps {
  visible: boolean
  onClose: () => void
  durationSeconds: number
  totalVolume: number
  totalSets: number
  totalPrs: number
  historyId: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

interface StatBlockProps {
  label: string
  value: string
  emoji: string
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value, emoji }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{emoji} {value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

export const WorkoutSummarySheet: React.FC<WorkoutSummarySheetProps> = ({
  visible,
  onClose,
  durationSeconds,
  totalVolume,
  totalSets,
  totalPrs,
  historyId,
}) => {
  const [note, setNote] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleNoteChange = (text: string) => {
    setNote(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (historyId) updateHistoryNote(historyId, text).catch(e => { if (__DEV__) console.error('[WorkoutSummarySheet] updateHistoryNote (debounce):', e) })
    }, 500)
  }

  const handleClose = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      if (historyId && note) {
        updateHistoryNote(historyId, note).catch(e => { if (__DEV__) console.error('[WorkoutSummarySheet] updateHistoryNote (flush):', e) })
      }
    }
    onClose()
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Séance terminée !"
    >
      {totalPrs > 0 ? (
        <Text style={styles.celebrationText}>🏅 Nouveau record personnel !</Text>
      ) : totalSets > 0 ? (
        <Text style={[styles.celebrationText, { color: colors.success }]}>💪 Beau travail !</Text>
      ) : null}

      <View style={styles.statsGrid}>
        <StatBlock label="Durée" value={formatDuration(durationSeconds)} emoji="⏱" />
        <StatBlock label="Volume" value={`${totalVolume.toFixed(1)} kg`} emoji="🏋️" />
        <StatBlock label="Séries" value={`${totalSets} validées`} emoji="✅" />
        <StatBlock label="Records" value={`${totalPrs} PR`} emoji="🏆" />
      </View>

      <View style={styles.separator} />

      <Text style={styles.noteLabel}>Note de séance</Text>
      <TextInput
        style={styles.noteInput}
        multiline
        numberOfLines={3}
        value={note}
        onChangeText={handleNoteChange}
        placeholder="Ressenti, conditions, progrès..."
        placeholderTextColor={colors.placeholder}
        textAlignVertical="top"
      />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleClose}
        enableHaptics={false}
      >
        Terminer
      </Button>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  celebrationText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBlock: {
    width: '47.5%',
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.md,
  },
  noteLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  noteInput: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.separator,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 80,
  },
})
