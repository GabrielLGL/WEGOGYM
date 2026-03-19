import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'

const PHOTO_DIR = `${FileSystem.documentDirectory}progress-photos/`

/**
 * Ensures the progress-photos/ directory exists inside the app's document directory.
 */
export async function ensurePhotoDirectory(): Promise<void> {
  const info = await FileSystem.getInfoAsync(PHOTO_DIR)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
  }
}

/**
 * Requests camera permission.
 * Returns true if granted, false otherwise. Never throws.
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    return status === 'granted'
  } catch {
    if (__DEV__) console.warn('[progressPhotoService] camera permission request failed')
    return false
  }
}

/**
 * Requests media library (gallery) permission.
 * Returns true if granted, false otherwise. Never throws.
 */
export async function requestGalleryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    return status === 'granted'
  } catch {
    if (__DEV__) console.warn('[progressPhotoService] gallery permission request failed')
    return false
  }
}

/**
 * Builds a destination filename from the current timestamp and an optional category.
 */
function buildFilename(category?: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const suffix = category ? `_${category}` : ''
  return `${timestamp}${suffix}.jpg`
}

/**
 * Copies a temporary image URI into the app's progress-photos/ directory.
 * Returns the permanent local URI, or null if copy fails.
 */
async function copyToPhotoDir(tempUri: string, category?: string): Promise<string | null> {
  try {
    await ensurePhotoDirectory()
    const filename = buildFilename(category)
    const destUri = `${PHOTO_DIR}${filename}`
    await FileSystem.copyAsync({ from: tempUri, to: destUri })
    return destUri
  } catch {
    if (__DEV__) console.warn('[progressPhotoService] failed to copy photo to app directory')
    return null
  }
}

/**
 * Captures a photo from the camera in portrait 3:4 aspect ratio at quality 0.8.
 * The photo is copied into the app's local directory.
 * Returns the local URI, or null if cancelled / permission denied / error.
 */
export async function capturePhoto(category?: string): Promise<string | null> {
  try {
    const hasPermission = await requestCameraPermission()
    if (!hasPermission) return null

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })

    if (result.canceled || result.assets.length === 0) return null

    return await copyToPhotoDir(result.assets[0].uri, category)
  } catch {
    if (__DEV__) console.warn('[progressPhotoService] capturePhoto failed')
    return null
  }
}

/**
 * Picks a photo from the gallery in portrait 3:4 aspect ratio at quality 0.8.
 * The photo is copied into the app's local directory.
 * Returns the local URI, or null if cancelled / permission denied / error.
 */
export async function pickPhotoFromGallery(category?: string): Promise<string | null> {
  try {
    const hasPermission = await requestGalleryPermission()
    if (!hasPermission) return null

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })

    if (result.canceled || result.assets.length === 0) return null

    return await copyToPhotoDir(result.assets[0].uri, category)
  } catch {
    if (__DEV__) console.warn('[progressPhotoService] pickPhotoFromGallery failed')
    return null
  }
}

/**
 * Deletes a photo file by its URI. No-op if the file does not exist.
 */
export async function deletePhoto(photoUri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(photoUri)
    if (info.exists) {
      await FileSystem.deleteAsync(photoUri, { idempotent: true })
    }
  } catch {
    if (__DEV__) console.warn('[progressPhotoService] deletePhoto failed for:', photoUri)
  }
}

/**
 * Checks whether a photo file exists at the given URI.
 */
export async function photoExists(photoUri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(photoUri)
    return info.exists
  } catch {
    return false
  }
}
