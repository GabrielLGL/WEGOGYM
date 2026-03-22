// Mocks AVANT les imports
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { SettingsDataSection } from '../SettingsDataSection'
import { mockUser } from '../../../model/utils/__tests__/testFactories'
import { StyleSheet } from 'react-native'

// --- Mocks ---

jest.mock('../../../model/index', () => ({
  database: {
    write: jest.fn((fn: () => Promise<void>) => fn()),
    get: jest.fn(),
    batch: jest.fn(),
  },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../BottomSheet', () => ({
  BottomSheet: ({ visible, children, title }: { visible: boolean; children: React.ReactNode; title?: string }) => {
    if (!visible) return null
    const { View, Text } = require('react-native')
    return (
      <View testID="bottom-sheet">
        {title && <Text>{title}</Text>}
        {children}
      </View>
    )
  },
}))

jest.mock('../../AlertDialog', () => ({
  AlertDialog: ({ visible, title, message, confirmText, cancelText, onConfirm, onCancel }: {
    visible: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
  }) => {
    if (!visible) return null
    const { View, Text, TouchableOpacity } = require('react-native')
    return (
      <View testID="alert-dialog">
        <Text>{title}</Text>
        <Text>{message}</Text>
        {confirmText && (
          <TouchableOpacity onPress={onConfirm} testID="alert-confirm">
            <Text>{confirmText}</Text>
          </TouchableOpacity>
        )}
        {cancelText && (
          <TouchableOpacity onPress={onCancel} testID="alert-cancel">
            <Text>{cancelText}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  },
}))

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    onPress: jest.fn(),
    onDelete: jest.fn(),
    onSuccess: jest.fn(),
    onSelect: jest.fn(),
    onError: jest.fn(),
    onMajorSuccess: jest.fn(),
  }),
}))

const mockNavigate = jest.fn()
const mockReset = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
    goBack: jest.fn(),
  }),
}))

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('{}'),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
    createFileAsync: jest.fn().mockResolvedValue('file://dest'),
  },
}))

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({ canceled: true }),
}))

jest.mock('../../../model/utils/exportHelpers', () => ({
  exportAllData: jest.fn().mockResolvedValue('/tmp/export.json'),
  importAllData: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../../../model/utils/databaseHelpers', () => ({
  deleteAllData: jest.fn().mockResolvedValue(undefined),
}))

// --- Minimal styles mock ---
const minimalStyles = StyleSheet.create({
  section: {},
  sectionTitleRow: {},
  sectionAccent: {},
  sectionTitle: {},
  dataButtonGap: {},
  exportHint: {},
  sheetOption: {},
  sheetOptionContent: {},
  sheetOptionTitle: {},
  sheetOptionDesc: {},
})

// Cast as SettingsStyles — the real type has many keys but only data-related ones are used
type MockStyles = typeof minimalStyles
const mockStyles = minimalStyles as unknown as import('../settingsStyles').SettingsStyles

describe('SettingsDataSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendu de base', () => {
    it('affiche le titre de la section "Donnees"', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      expect(getByText('Données')).toBeTruthy()
    })

    it('affiche le bouton d\'export', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      expect(getByText('Exporter mes données')).toBeTruthy()
    })

    it('affiche le bouton d\'import', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      expect(getByText('Importer mes données')).toBeTruthy()
    })

    it('affiche le bouton de suppression', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      expect(getByText('Supprimer toutes mes données')).toBeTruthy()
    })

    it('affiche le hint d\'export', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      expect(getByText('Vos données vous appartiennent')).toBeTruthy()
    })
  })

  describe('interactions export', () => {
    it('ouvre le bottom sheet quand on appuie sur exporter', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      fireEvent.press(getByText('Exporter mes données'))

      // Les options du sheet doivent etre visibles
      expect(getByText('Partager')).toBeTruthy()
      expect(getByText('Enregistrer')).toBeTruthy()
    })
  })

  describe('interactions suppression', () => {
    it('ouvre le dialog de confirmation quand on appuie sur supprimer', () => {
      const { getByText } = render(
        <SettingsDataSection user={mockUser()} styles={mockStyles} />
      )

      fireEvent.press(getByText('Supprimer toutes mes données'))

      expect(getByText('Supprimer toutes vos données ?')).toBeTruthy()
    })
  })

  describe('cas limites', () => {
    it('se rend sans crasher avec user null', () => {
      expect(() =>
        render(
          <SettingsDataSection user={null} styles={mockStyles} />
        )
      ).not.toThrow()
    })

    it('affiche tous les boutons meme avec user null', () => {
      const { getByText } = render(
        <SettingsDataSection user={null} styles={mockStyles} />
      )

      expect(getByText('Exporter mes données')).toBeTruthy()
      expect(getByText('Importer mes données')).toBeTruthy()
      expect(getByText('Supprimer toutes mes données')).toBeTruthy()
    })
  })
})
