/**
 * Tests for progressPhotoService — permissions, capture, gallery, delete, exists
 */
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import {
  ensurePhotoDirectory,
  requestCameraPermission,
  requestGalleryPermission,
  capturePhoto,
  pickPhotoFromGallery,
  deletePhoto,
  photoExists,
} from '../progressPhotoService'

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///data/app/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}))

describe('progressPhotoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── ensurePhotoDirectory ─────────────────────────────────────

  describe('ensurePhotoDirectory', () => {
    it('creates directory when it does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false })
      await ensurePhotoDirectory()
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        expect.stringContaining('progress-photos/'),
        { intermediates: true },
      )
    })

    it('does not create directory when it already exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      await ensurePhotoDirectory()
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled()
    })
  })

  // ── requestCameraPermission ──────────────────────────────────

  describe('requestCameraPermission', () => {
    it('returns true when permission granted', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      const result = await requestCameraPermission()
      expect(result).toBe(true)
    })

    it('returns false when permission denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      const result = await requestCameraPermission()
      expect(result).toBe(false)
    })

    it('returns false on error without throwing', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(new Error('fail'))
      const result = await requestCameraPermission()
      expect(result).toBe(false)
    })
  })

  // ── requestGalleryPermission ─────────────────────────────────

  describe('requestGalleryPermission', () => {
    it('returns true when permission granted', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      const result = await requestGalleryPermission()
      expect(result).toBe(true)
    })

    it('returns false when permission denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      const result = await requestGalleryPermission()
      expect(result).toBe(false)
    })

    it('returns false on error without throwing', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(new Error('fail'))
      const result = await requestGalleryPermission()
      expect(result).toBe(false)
    })
  })

  // ── capturePhoto ─────────────────────────────────────────────

  describe('capturePhoto', () => {
    it('returns null when permission denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      const result = await capturePhoto()
      expect(result).toBeNull()
    })

    it('returns null when user cancels', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      ;(ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] })
      ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      const result = await capturePhoto()
      expect(result).toBeNull()
    })

    it('copies photo and returns URI on success', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      ;(ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///tmp/photo.jpg' }],
      })
      ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      const result = await capturePhoto('front')
      expect(result).toContain('progress-photos/')
      expect(result).toContain('_front.jpg')
      expect(FileSystem.copyAsync).toHaveBeenCalled()
    })

    it('returns null on error without throwing', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      ;(ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(new Error('camera fail'))
      const result = await capturePhoto()
      expect(result).toBeNull()
    })
  })

  // ── pickPhotoFromGallery ─────────────────────────────────────

  describe('pickPhotoFromGallery', () => {
    it('returns null when permission denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      const result = await pickPhotoFromGallery()
      expect(result).toBeNull()
    })

    it('returns null when user cancels', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      ;(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] })
      ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      const result = await pickPhotoFromGallery()
      expect(result).toBeNull()
    })

    it('copies photo and returns URI on success', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      ;(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///tmp/gallery.jpg' }],
      })
      ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      const result = await pickPhotoFromGallery()
      expect(result).toContain('progress-photos/')
      expect(FileSystem.copyAsync).toHaveBeenCalled()
    })
  })

  // ── deletePhoto ──────────────────────────────────────────────

  describe('deletePhoto', () => {
    it('deletes file when it exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      await deletePhoto('file:///data/app/progress-photos/123.jpg')
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        'file:///data/app/progress-photos/123.jpg',
        { idempotent: true },
      )
    })

    it('does not delete when file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false })
      await deletePhoto('file:///data/app/progress-photos/nonexistent.jpg')
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled()
    })

    it('does not throw on error', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(new Error('fail'))
      await expect(deletePhoto('file:///bad')).resolves.toBeUndefined()
    })
  })

  // ── photoExists ──────────────────────────────────────────────

  describe('photoExists', () => {
    it('returns true when file exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
      const result = await photoExists('file:///data/app/progress-photos/123.jpg')
      expect(result).toBe(true)
    })

    it('returns false when file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false })
      const result = await photoExists('file:///data/app/progress-photos/nope.jpg')
      expect(result).toBe(false)
    })

    it('returns false on error without throwing', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(new Error('fail'))
      const result = await photoExists('file:///bad')
      expect(result).toBe(false)
    })
  })
})
