import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { SettingsStyles } from './settingsStyles'

interface SettingsAISectionProps {
  styles: SettingsStyles
}

export const SettingsAISection: React.FC<SettingsAISectionProps> = ({ styles }) => {
  const colors = useColors()
  const { t } = useLanguage()

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>{t.settings.ai.title}</Text>
      </View>

      <Text style={styles.aiSubLabel}>{t.settings.ai.provider}</Text>
      <View style={styles.providerList}>
        <View style={[styles.providerRow, styles.providerRowActive]}>
          <View style={[styles.radioCircle, styles.radioCircleActive]} />
          <Text style={[styles.providerLabel, styles.providerLabelActive]}>
            {t.settings.ai.offlineLabel}
          </Text>
        </View>

        <View style={[styles.providerRow, styles.providerRowDisabled]}>
          <View style={styles.radioCircle} />
          <View style={styles.providerRowContent}>
            <Text style={[styles.providerLabel, styles.providerLabelDisabled]}>
              {t.settings.ai.cloudLabel}
            </Text>
            <Text style={styles.providerComingSoon}>{t.settings.ai.comingSoon}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
