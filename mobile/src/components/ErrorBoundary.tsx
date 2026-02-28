import React, { Component, ReactNode } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { captureError } from '../services/sentry'
import { colors, spacing, borderRadius, fontSize } from '../theme'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Composant pour capturer les erreurs React non gérées
 *
 * Empêche les écrans blancs en production en affichant une page d'erreur élégante.
 *
 * NOTE: Class component required — React error boundaries MUST use componentDidCatch
 * which cannot be implemented with hooks. Static theme colors are unavoidable here
 * (StyleSheet.create outside render cannot call useColors). This is an intentional
 * exception to the functional-only and no-hardcoded-colors rules.
 *
 * @usage
 * Envelopper l'app dans AppNavigator:
 * <ErrorBoundary>
 *   <NavigationContainer>...</NavigationContainer>
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Envoyer l'erreur à Sentry pour monitoring
    if (__DEV__) console.error('ErrorBoundary caught:', error, errorInfo)

    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'Root ErrorBoundary',
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Ionicons name="warning-outline" size={fontSize.jumbo} color={colors.warning} style={{ marginBottom: spacing.md }} />
            <Text style={styles.title}>Une erreur est survenue</Text>
            <Text style={styles.message}>
              L'application a rencontré un problème inattendu.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.ms,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: colors.cardSecondary,
    padding: spacing.ms,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    maxWidth: '100%',
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.ms,
    borderRadius: borderRadius.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
})
