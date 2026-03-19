import React, { useMemo, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from './BottomSheet'
import { useModalState } from '../hooks/useModalState'
import { useHaptics } from '../hooks/useHaptics'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { SkillBranch } from '../model/utils/skillTreeHelpers'

interface Props {
  branch: SkillBranch
}

export const SkillTreeBranch: React.FC<Props> = ({ branch }) => {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const sheet = useModalState()

  const handlePress = useCallback(() => {
    haptics.onPress()
    sheet.open()
  }, [haptics, sheet])

  const unlockedCount = branch.nodes.filter(n => n.unlocked).length

  // Barre de progression vers le prochain nœud
  const progressToNext = useMemo(() => {
    if (branch.nextThreshold === -1) return 1
    const lockedIdx = branch.nodes.findIndex(n => !n.unlocked)
    const prevThreshold = lockedIdx > 0 ? branch.nodes[lockedIdx - 1].threshold : 0
    const range = branch.nextThreshold - prevThreshold
    if (range <= 0) return 1
    return Math.min(1, (branch.currentValue - prevThreshold) / range)
  }, [branch])

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Icon + Label */}
        <View style={styles.header}>
          <Ionicons name={branch.icon as React.ComponentProps<typeof Ionicons>['name']} size={22} color={branch.color} />
          <Text style={[styles.label, { color: colors.text }]}>{branch.label}</Text>
        </View>

        {/* Dots : nœuds débloqués / total */}
        <View style={styles.dotsRow}>
          {branch.nodes.map(node => (
            <Text
              key={node.id}
              style={[styles.dot, { color: node.unlocked ? branch.color : colors.separator }]}
            >
              {node.unlocked ? '●' : '○'}
            </Text>
          ))}
        </View>

        {/* Valeur actuelle */}
        <Text style={[styles.currentValue, { color: colors.textSecondary }]} numberOfLines={1}>
          {branch.currentValue.toLocaleString('fr-FR')} {getUnitSuffix(branch.id)}
        </Text>

        {/* Barre de progression vers prochain nœud */}
        {branch.nextThreshold !== -1 && (
          <View style={[styles.progressBar, { backgroundColor: colors.separator }]}>
            <View style={[styles.progressFill, { backgroundColor: branch.color, width: `${Math.round(progressToNext * 100)}%` }]} />
          </View>
        )}
      </TouchableOpacity>

      {/* BottomSheet détail */}
      <BottomSheet visible={sheet.isOpen} onClose={sheet.close} title={branch.label}>
        <View style={styles.sheetContent}>
          {/* En-tête */}
          <View style={[styles.sheetHeader, { backgroundColor: colors.cardSecondary }]}>
            <Ionicons name={branch.icon as React.ComponentProps<typeof Ionicons>['name']} size={32} color={branch.color} />
            <View>
              <Text style={[styles.sheetCurrentLabel, { color: colors.textSecondary }]}>
                {t.skillTree.currentValue}
              </Text>
              <Text style={[styles.sheetCurrentValue, { color: colors.text }]}>
                {branch.currentValue.toLocaleString('fr-FR')} {getUnitSuffix(branch.id)}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: branch.color }]}>{unlockedCount}/{branch.nodes.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.skillTree.nodesUnlocked}</Text>
            </View>
            {branch.nextThreshold !== -1 && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {branch.nextThreshold.toLocaleString('fr-FR')}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.skillTree.nextThreshold}</Text>
              </View>
            )}
          </View>

          {/* Liste des nœuds */}
          {branch.nodes.map(node => (
            <View key={node.id} style={[styles.nodeRow, { borderBottomColor: colors.separator }]}>
              <Ionicons
                name={node.unlocked ? 'checkmark-circle' : 'lock-closed-outline'}
                size={18}
                color={node.unlocked ? branch.color : colors.textSecondary}
              />
              <Text style={[styles.nodeLabel, { color: node.unlocked ? colors.text : colors.textSecondary }]}>
                {node.label}
              </Text>
              <Text style={[styles.nodeStatus, { color: node.unlocked ? branch.color : colors.textSecondary }]}>
                {node.unlocked ? t.skillTree.unlocked : t.skillTree.locked}
              </Text>
            </View>
          ))}

          {/* Barre de progression */}
          {branch.nextThreshold !== -1 && (
            <View style={styles.progressSection}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {t.skillTree.progressToNext} ({Math.round(progressToNext * 100)}%)
              </Text>
              <View style={[styles.progressBarLarge, { backgroundColor: colors.separator }]}>
                <View style={[styles.progressFillLarge, { backgroundColor: branch.color, width: `${Math.round(progressToNext * 100)}%` }]} />
              </View>
            </View>
          )}
        </View>
      </BottomSheet>
    </>
  )
}

function getUnitSuffix(branchId: SkillBranch['id']): string {
  switch (branchId) {
    case 'force': return 'PRs'
    case 'endurance': return 'kg'
    case 'mobilite': return 'ex.'
    case 'regularite': return 'sem.'
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flex: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: spacing.xs,
  },
  dot: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  currentValue: {
    fontSize: fontSize.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  sheetContent: {
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  sheetCurrentLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sheetCurrentValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  nodeLabel: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  nodeStatus: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  progressBarLarge: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: 8,
    borderRadius: 4,
  },
})
