import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Switch } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { database } from '../model/index'
import User from '../model/models/User'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface Props {
  user: User | null
}

const SettingsContent: React.FC<Props> = ({ user }) => {
  const haptics = useHaptics()
  const [restDuration, setRestDuration] = useState(user?.restDuration?.toString() || '90')
  const [timerEnabled, setTimerEnabled] = useState(user?.timerEnabled ?? true)

  const handleSaveRestDuration = async () => {
    if (!user) return

    const duration = parseInt(restDuration, 10)
    if (isNaN(duration) || duration < 10 || duration > 600) {
      // Validation : entre 10 et 600 secondes
      return
    }

    try {
      await database.write(async () => {
        await user.update((u) => {
          u.restDuration = duration
        })
      })
      haptics.onSuccess()
    } catch (error) {
      console.error('Failed to update rest duration:', error)
    }
  }

  const handleToggleTimer = async (enabled: boolean) => {
    if (!user) return

    setTimerEnabled(enabled)

    try {
      await database.write(async () => {
        await user.update((u) => {
          u.timerEnabled = enabled
        })
      })
      haptics.onPress()
    } catch (error) {
      console.error('Failed to toggle timer:', error)
      setTimerEnabled(!enabled) // Revert on error
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Section Minuteur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Minuteur de repos</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Activer le minuteur</Text>
              <Text style={styles.settingDescription}>
                Affiche un timer après chaque exercice ajouté
              </Text>
            </View>
            <Switch
              value={timerEnabled}
              onValueChange={handleToggleTimer}
              trackColor={{ false: colors.cardSecondary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Durée de repos</Text>
              <Text style={styles.settingDescription}>
                Temps de repos par défaut (en secondes)
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={restDuration}
                onChangeText={setRestDuration}
                keyboardType="numeric"
                onBlur={handleSaveRestDuration}
                onSubmitEditing={handleSaveRestDuration}
                placeholderTextColor={colors.placeholder}
              />
              <Text style={styles.inputUnit}>sec</Text>
            </View>
          </View>
        </View>

        {/* Section À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ À propos</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application</Text>
            <Text style={styles.infoValue}>WEGOGYM</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Développé avec</Text>
            <Text style={styles.infoValue}>React Native + WatermelonDB</Text>
          </View>
        </View>

        {/* Section Aide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Aide</Text>

          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>Navigation :{'\n'}</Text>
            • Onglet Bibliothèque : Gérer vos exercices{'\n'}
            • Onglet Prog : Créer des programmes et séances{'\n'}
            • Onglet Stats : Voir votre progression{'\n\n'}
            <Text style={styles.helpBold}>Programmes :{'\n'}</Text>
            • Appuyez longuement pour réorganiser{'\n'}
            • Utilisez ⋮ pour renommer/dupliquer/supprimer{'\n\n'}
            <Text style={styles.helpBold}>Exercices :{'\n'}</Text>
            • Ajoutez des exercices dans une séance{'\n'}
            • Modifiez les objectifs (séries × reps à poids){'\n'}
            • Le PR (Personal Record) s'affiche automatiquement
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardSecondary,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.cardSecondary,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'center',
  },
  inputUnit: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardSecondary,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  helpBold: {
    color: colors.text,
    fontWeight: 'bold',
  },
})

export default withObservables([], () => ({
  user: database.get<User>('users').query().observe().pipe(
    map((list: User[]) => list[0] || null)
  ),
}))(SettingsContent)
