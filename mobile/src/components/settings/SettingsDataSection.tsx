import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import User from '../../model/models/User'
import { exportAllData, importAllData } from '../../model/utils/exportHelpers'
import { deleteAllData } from '../../model/utils/databaseHelpers'
import { useHaptics } from '../../hooks/useHaptics'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import { AlertDialog } from '../AlertDialog'
import { BottomSheet } from '../BottomSheet'
import { Button } from '../Button'
import type { SettingsStyles } from './settingsStyles'

interface SettingsDataSectionProps {
  user: User | null
  styles: SettingsStyles
}

export const SettingsDataSection: React.FC<SettingsDataSectionProps> = ({
  user,
  styles,
}) => {
  const colors = useColors()
  const haptics = useHaptics()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [pendingImportUri, setPendingImportUri] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  const handleExportPress = () => {
    haptics.onPress()
    setShowExportOptions(true)
  }

  const handleExportShare = useCallback(async () => {
    setShowExportOptions(false)
    setExporting(true)
    try {
      const filePath = await exportAllData()
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: t.settings.data.exportSheetTitle,
      })
      showToast({ message: t.toasts.dataExported })
    } catch (error) {
      if (__DEV__) console.error('Export share failed:', error)
      setExportError(true)
      showToast({ message: t.toasts.error, variant: 'error' })
    } finally {
      setExporting(false)
    }
  }, [t, showToast])

  const handleExportDownload = useCallback(async () => {
    setShowExportOptions(false)
    setExporting(true)
    try {
      const filePath = await exportAllData()
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
      if (permissions.granted) {
        const dateStr = new Date().toISOString().slice(0, 10)
        const fileName = `kore-export-${dateStr}.json`
        const content = await FileSystem.readAsStringAsync(filePath)
        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri, fileName, 'application/json'
        )
        await FileSystem.writeAsStringAsync(destUri, content)
        haptics.onSuccess()
        showToast({ message: t.toasts.dataExported })
      }
    } catch (error) {
      if (__DEV__) console.error('Export download failed:', error)
      setExportError(true)
      showToast({ message: t.toasts.error, variant: 'error' })
    } finally {
      setExporting(false)
    }
  }, [haptics, t, showToast])

  const handleImportPress = async () => {
    haptics.onPress()
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets[0]) {
        setPendingImportUri(result.assets[0].uri)
        setShowImportConfirm(true)
      }
    } catch (error) {
      if (__DEV__) console.error('Document picker error:', error)
    }
  }

  const handleImportConfirm = useCallback(async () => {
    if (!pendingImportUri) return
    setShowImportConfirm(false)
    setImporting(true)
    try {
      await importAllData(pendingImportUri)
      haptics.onSuccess()
      setImportSuccess(true)
      showToast({ message: t.toasts.dataImported })
    } catch (error) {
      if (__DEV__) console.error('Import failed:', error)
      setImportError(true)
      showToast({ message: t.toasts.error, variant: 'error' })
    } finally {
      setImporting(false)
      setPendingImportUri(null)
    }
  }, [pendingImportUri, haptics, t, showToast])

  const handleDeleteAllData = useCallback(async () => {
    setShowDeleteConfirm(false)
    setDeleting(true)
    try {
      await deleteAllData(user)
      haptics.onSuccess()
      setDeleteSuccess(true)
    } catch (error) {
      if (__DEV__) console.error('Delete all data failed:', error)
      setDeleteError(true)
    } finally {
      setDeleting(false)
    }
  }, [user, haptics])

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Ionicons name="save-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t.settings.data.title}</Text>
        </View>
        <View style={styles.dataButtonGap}>
          <Button
            variant="primary"
            fullWidth
            onPress={handleExportPress}
            disabled={exporting || importing}
            enableHaptics={false}
          >
            {exporting ? t.settings.data.exportLoading : t.settings.data.exportLabel}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onPress={handleImportPress}
            disabled={exporting || importing}
            enableHaptics={false}
          >
            {importing ? t.settings.data.importLoading : t.settings.data.importLabel}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onPress={() => { haptics.onPress(); setShowDeleteConfirm(true) }}
            disabled={exporting || importing || deleting}
            enableHaptics={false}
          >
            {deleting ? t.settings.data.deleteAllLoading : t.settings.data.deleteAllLabel}
          </Button>
        </View>
        <Text style={styles.exportHint}>{t.settings.data.exportHint}</Text>
      </View>

      {/* BottomSheet choix d'export */}
      <BottomSheet
        visible={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        title={t.settings.data.exportSheetTitle}
      >
        <TouchableOpacity style={styles.sheetOption} onPress={handleExportShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={colors.primary} />
          <View style={styles.sheetOptionContent}>
            <Text style={styles.sheetOptionTitle}>{t.settings.data.shareOption}</Text>
            <Text style={styles.sheetOptionDesc}>{t.settings.data.shareDescription}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sheetOption} onPress={handleExportDownload} activeOpacity={0.7}>
          <Ionicons name="download-outline" size={20} color={colors.primary} />
          <View style={styles.sheetOptionContent}>
            <Text style={styles.sheetOptionTitle}>{t.settings.data.saveOption}</Text>
            <Text style={styles.sheetOptionDesc}>{t.settings.data.saveDescription}</Text>
          </View>
        </TouchableOpacity>
      </BottomSheet>

      {/* AlertDialog confirmation import */}
      <AlertDialog
        visible={showImportConfirm}
        title={t.settings.data.importConfirmTitle}
        message={t.settings.data.importConfirmMessage}
        confirmText={t.settings.data.importConfirmButton}
        confirmColor={colors.danger}
        cancelText={t.common.cancel}
        onConfirm={handleImportConfirm}
        onCancel={() => { setShowImportConfirm(false); setPendingImportUri(null) }}
      />

      {/* AlertDialog succes import */}
      <AlertDialog
        visible={importSuccess}
        title={t.settings.data.importSuccessTitle}
        message={t.settings.data.importSuccessMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => setImportSuccess(false)}
        onCancel={() => setImportSuccess(false)}
        hideCancel
      />

      <AlertDialog
        visible={exportError}
        title={t.settings.data.exportErrorTitle}
        message={t.settings.data.exportErrorMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => setExportError(false)}
        onCancel={() => setExportError(false)}
        hideCancel
      />

      {/* AlertDialog erreur import */}
      <AlertDialog
        visible={importError}
        title={t.settings.data.importErrorTitle}
        message={t.settings.data.importErrorMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => setImportError(false)}
        onCancel={() => setImportError(false)}
        hideCancel
      />

      {/* AlertDialog confirmation suppression totale */}
      <AlertDialog
        visible={showDeleteConfirm}
        title={t.settings.data.deleteAllConfirmTitle}
        message={t.settings.data.deleteAllConfirmMessage}
        confirmText={t.settings.data.deleteAllConfirmButton}
        confirmColor={colors.danger}
        cancelText={t.common.cancel}
        onConfirm={handleDeleteAllData}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* AlertDialog succes suppression */}
      <AlertDialog
        visible={deleteSuccess}
        title={t.settings.data.deleteAllSuccessTitle}
        message={t.settings.data.deleteAllSuccessMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => {
          setDeleteSuccess(false)
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
        }}
        onCancel={() => {
          setDeleteSuccess(false)
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
        }}
        hideCancel
      />

      {/* AlertDialog erreur suppression */}
      <AlertDialog
        visible={deleteError}
        title={t.settings.data.deleteAllErrorTitle}
        message={t.settings.data.deleteAllErrorMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => setDeleteError(false)}
        onCancel={() => setDeleteError(false)}
        hideCancel
      />
    </>
  )
}
