import * as SecureStore from 'expo-secure-store'
import { database } from '../model'
import User from '../model/models/User'

const API_KEY_STORE_KEY = 'wegogym_ai_api_key'

/** Read the API key from secure storage. Returns null if not set. */
export async function getApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(API_KEY_STORE_KEY)
  } catch {
    return null
  }
}

/** Save the API key to secure storage. */
export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORE_KEY, key)
}

/** Delete the API key from secure storage. */
export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORE_KEY)
}

/**
 * One-time migration: if the User row still has an ai_api_key in SQLite,
 * move it to secure storage and clear the SQLite field.
 */
export async function migrateKeyFromDB(): Promise<void> {
  try {
    const users = await database.get<User>('users').query().fetch()
    const user = users[0]
    if (!user?.aiApiKey) return

    // Already migrated?
    const existing = await getApiKey()
    if (!existing) {
      await setApiKey(user.aiApiKey)
    }

    // Clear the plain-text key from SQLite
    await database.write(async () => {
      await user.update(u => {
        u.aiApiKey = null
      })
    })
  } catch {
    // Non-blocking: migration failure is not critical
    if (__DEV__) console.warn('[secureKeyStore] migration failed')
  }
}
