import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { useColors } from '../contexts/ThemeContext'
import { fontSize } from '../theme'

interface ScreenLoadingProps {
  message?: string
}

const ScreenLoading = ({ message }: ScreenLoadingProps) => {
  const colors = useColors()
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: fontSize.sm,
  },
})

export default ScreenLoading
