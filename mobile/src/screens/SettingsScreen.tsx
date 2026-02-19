import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { map } from 'rxjs/operators'
import { database } from '../model/index'
import User from '../model/models/User'
import { useHaptics } from '../hooks/useHaptics'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import { testProviderConnection } from '../services/ai/aiService'
import type { AIProviderName } from '../services/ai/types'

const PROVIDERS: { key: AIProviderName; label: string }[] = [
  { key: 'offline', label: 'Offline (défaut)' },
  { key: 'claude',  label: 'Claude (Anthropic)' },
  { key: 'openai',  label: 'OpenAI (GPT-4o)' },
  { key: 'gemini',  label: 'Gemini (Google)' },
]

interface Props {
  user: User | null
}

const SettingsContent: React.FC<Props> = ({ user }) => {
  const haptics = useHaptics()
  const [restDuration, setRestDuration] = useState(user?.restDuration?.toString() ?? '90')
  const [timerEnabled, setTimerEnabled] = useState(user?.timerEnabled ?? true)
  const [aiProvider, setAiProvider] = useState<AIProviderName>((user?.aiProvider as AIProviderName) ?? 'offline')
  const [aiApiKey, setAiApiKey] = useState(user?.aiApiKey ?? '')
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (!user) return
    setRestDuration(user.restDuration?.toString() ?? '90')
    setTimerEnabled(user.timerEnabled ?? true)
    setAiProvider((user.aiProvider as AIProviderName) ?? 'offline')
    setAiApiKey(user.aiApiKey ?? '')
  }, [user])

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
      if (__DEV__) console.error('Failed to update rest duration:', error)
    }
  }

  const handleSaveAI = async (provider: AIProviderName, key: string) => {
    if (!user) return
    try {
      await database.write(async () => {
        await user.update(u => {
          u.aiProvider = provider
          u.aiApiKey = key.trim() || null
        })
      })
      haptics.onSuccess()
    } catch (error) {
      if (__DEV__) console.error('Failed to save AI settings:', error)
    }
  }

  const handleSelectProvider = async (key: AIProviderName) => {
    haptics.onSelect()
    setAiProvider(key)
    await handleSaveAI(key, aiApiKey)
  }

  const handleApiKeyBlur = async () => {
    await handleSaveAI(aiProvider, aiApiKey)
  }

  const handleTestConnection = async () => {
    if (aiProvider === 'offline') {
      Alert.alert('Mode Offline', 'Aucune connexion à tester en mode offline.')
      return
    }
    if (!aiApiKey.trim()) {
      Alert.alert('Clé manquante', 'Entre une clé API avant de tester.')
      return
    }
    haptics.onPress()
    setIsTesting(true)
    try {
      await testProviderConnection(aiProvider, aiApiKey.trim())
      haptics.onSuccess()
      Alert.alert('Connexion réussie ✅', `Le provider ${aiProvider} répond correctement.`)
    } catch (error) {
      haptics.onDelete()
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      const isGemini403 = aiProvider === 'gemini' && (errorMessage.includes('403') || errorMessage.includes('API_NOT_ENABLED'))
      const isGemini429 = aiProvider === 'gemini' && errorMessage.includes('429')
      const hint = isGemini403
        ? '\n\nVérifiez que l\'API Generative Language est activée dans Google Cloud Console.'
        : isGemini429
          ? '\n\nClé API sans quota gratuit.\n\n• Créez une clé sur aistudio.google.com (gratuit)\n• OU activez la facturation sur console.cloud.google.com'
          : ''
      Alert.alert('Erreur de connexion ❌', `Impossible de joindre ${aiProvider}.\n\n${errorMessage}${hint}`)
    } finally {
      setIsTesting(false)
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
      if (__DEV__) console.error('Failed to toggle timer:', error)
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

        {/* Section Intelligence Artificielle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Intelligence Artificielle</Text>

          <Text style={styles.aiSubLabel}>Provider</Text>
          <View style={styles.providerList}>
            {PROVIDERS.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[styles.providerRow, aiProvider === p.key && styles.providerRowActive]}
                onPress={() => handleSelectProvider(p.key)}
              >
                <View style={[styles.radioCircle, aiProvider === p.key && styles.radioCircleActive]} />
                <Text style={[styles.providerLabel, aiProvider === p.key && styles.providerLabelActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {aiProvider !== 'offline' && (
            <>
              <Text style={[styles.aiSubLabel, { marginTop: spacing.md }]}>Clé API</Text>
              <TextInput
                style={styles.apiKeyInput}
                value={aiApiKey}
                onChangeText={setAiApiKey}
                onBlur={handleApiKeyBlur}
                placeholder="Colle ta clé API ici"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.testButton, isTesting && styles.testButtonDisabled]}
                onPress={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.testButtonText}>Tester la connexion</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  aiSubLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  providerList: {
    gap: spacing.xs,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.md,
  },
  providerRowActive: {
    backgroundColor: colors.cardSecondary,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  radioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  providerLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  providerLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  apiKeyInput: {
    backgroundColor: colors.cardSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  testButton: {
    backgroundColor: colors.secondaryButton,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
})

export { SettingsContent }

export default withObservables([], () => ({
  user: database.get<User>('users').query().observe().pipe(
    map((list: User[]) => list[0] || null)
  ),
}))(SettingsContent)
