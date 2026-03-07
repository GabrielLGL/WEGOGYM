import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { SettingsStyles } from './settingsStyles'

interface SettingsAboutSectionProps {
  styles: SettingsStyles
}

export const SettingsAboutSection: React.FC<SettingsAboutSectionProps> = ({ styles }) => {
  const colors = useColors()
  const { t } = useLanguage()

  return (
    <>
      {/* Section A propos */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.settings.about.title}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t.settings.about.app}</Text>
          <Text style={styles.infoValue}>Kore</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t.settings.about.version}</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t.settings.about.developedWith}</Text>
          <Text style={styles.infoValue}>React Native + WatermelonDB</Text>
        </View>
      </View>

      {/* Section Aide */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.settings.help.title}</Text>
        </View>

        <Text style={styles.helpText}>
          <Text style={styles.helpBold}>{t.settings.help.navigationTitle}{'\n'}</Text>
          {t.settings.help.navigationContent}{'\n\n'}
          <Text style={styles.helpBold}>{t.settings.help.programsTitle}{'\n'}</Text>
          {t.settings.help.programsContent}{'\n\n'}
          <Text style={styles.helpBold}>{t.settings.help.exercisesTitle}{'\n'}</Text>
          {t.settings.help.exercisesContent}
        </Text>
      </View>
    </>
  )
}
