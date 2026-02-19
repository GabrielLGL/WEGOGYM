import * as Sentry from '@sentry/react-native'
import Constants from 'expo-constants'

/**
 * Configuration et initialisation de Sentry pour le monitoring des erreurs
 *
 * @docs https://docs.sentry.io/platforms/react-native/
 */

const SENTRY_DSN =
  (process.env as Record<string, string | undefined>).EXPO_PUBLIC_SENTRY_DSN ||
  Constants.expoConfig?.extra?.sentryDsn

/**
 * Initialise Sentry avec la configuration appropriée
 * À appeler au démarrage de l'app (App.tsx)
 */
export function initSentry() {
  // Ne pas initialiser Sentry en développement (optionnel)
  if (__DEV__ && !SENTRY_DSN) {
    console.log('[Sentry] Skipped in development (no DSN provided)')
    return
  }

  if (!SENTRY_DSN) {
    if (__DEV__) console.warn('[Sentry] DSN not configured. Error monitoring is disabled.')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Nom de l'environnement
    environment: __DEV__ ? 'development' : 'production',

    // Taux d'échantillonnage des traces (performance monitoring)
    // 1.0 = 100% des transactions, 0.1 = 10%
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,

    // Désactiver en développement pour ne pas polluer Sentry
    enabled: !__DEV__,

    // Debug mode (affiche les logs Sentry en console)
    debug: __DEV__,

    // Release version (utile pour tracker les bugs par version)
    release: Constants.expoConfig?.version || '1.0.0',

    // Distribution (optionnel)
    dist: Constants.expoConfig?.android?.versionCode?.toString(),

    // Avant d'envoyer un événement, on peut le modifier ou le filtrer
    beforeSend(event, hint) {
      // En dev, logger l'événement au lieu de l'envoyer
      if (__DEV__) {
        console.log('[Sentry] Event:', event)
        console.log('[Sentry] Hint:', hint)
        return null // Ne pas envoyer en dev
      }

      return event
    },

    // Intégrations par défaut
    integrations: [
      Sentry.reactNavigationIntegration(),
    ],
  })

  if (__DEV__) console.log('[Sentry] Initialized successfully')
}

/**
 * Capturer une erreur manuellement
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.setContext('additional_context', context)
  }
  Sentry.captureException(error)
}

export default Sentry
