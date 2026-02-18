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
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{value}</Text>
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
      if (historyId) updateHistoryNote(historyId, text).catch(console.error)
    }, 500)
  }

  const handleClose = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      if (historyId && note) {
        updateHistoryNote(historyId, note).catch(console.error)
      }
    }
    onClose()
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {}}
      title="Séance terminée !"
    >
      <View style={styles.statsGrid}>
        <StatBlock label="Durée" value={formatDuration(durationSeconds)} />
        <StatBlock label="Volume" value={`${totalVolume.toFixed(1)} kg`} />
        <StatBlock label="Séries" value={`${totalSets} validées`} />
        <StatBlock label="Records" value={`${totalPrs} PR`} />
      </View>

      <TextInput
        style={styles.noteInput}
        multiline
        numberOfLines={3}
        value={note}
        onChangeText={handleNoteChange}
        placeholder="Ajouter une note (optionnel)..."
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
        Fermer
      </Button>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
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
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteInput: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 80,
  },
})
