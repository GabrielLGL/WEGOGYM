/**
 * ExerciseCatalogScreen
 *
 * Parcourir et rechercher les 873 exercices du catalogue Supabase.
 * Permet d'importer un exercice dans la bibliothèque locale (WatermelonDB).
 *
 * Source : table `exercises` Supabase (free-exercise-db dataset, CC0)
 * Accès : REST API Supabase via plain fetch (service exerciseCatalog.ts)
 */

import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model/index'
import Exercise from '../model/models/Exercise'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { Button } from '../components/Button'
import { useColors } from '../contexts/ThemeContext'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { fontSize, spacing, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'
import {
  searchCatalogExercises,
  mapCatalogToLocal,
} from '../services/exerciseCatalog'
import type { CatalogExercise } from '../services/exerciseCatalog'

// ── Constantes ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50
const DEBOUNCE_MS = 400
const THUMBNAIL_SIZE = 60
const DETAIL_IMAGE_HEIGHT = 220

// ── Composant item de liste ───────────────────────────────────────────────────

interface CatalogItemProps {
  item: CatalogExercise
  onPress: (item: CatalogExercise) => void
  colors: ThemeColors
}

const CatalogItem = memo<CatalogItemProps>(({ item, onPress, colors }) => {
  const styles = useItemStyles(colors)
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {item.gif_url ? (
        <Image
          source={{ uri: item.gif_url }}
          style={styles.thumbnail}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="barbell-outline" size={28} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.target} · {item.equipment}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  )
})

function useItemStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.ms,
      gap: spacing.ms,
    },
    thumbnail: {
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: borderRadius.sm,
    },
    thumbnailPlaceholder: {
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    name: {
      color: colors.text,
      fontSize: fontSize.bodyMd,
      fontWeight: '600',
    },
    meta: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginTop: 3,
      textTransform: 'capitalize',
    },
  })
}

// ── Composant détail exercice (dans BottomSheet) ──────────────────────────────

interface ExerciseDetailProps {
  exercise: CatalogExercise
  onImport: (exercise: CatalogExercise) => void
  isImporting: boolean
  colors: ThemeColors
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exercise,
  onImport,
  isImporting,
  colors,
}) => {
  const styles = useDetailStyles(colors)
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {exercise.gif_url ? (
        <Image
          source={{ uri: exercise.gif_url }}
          style={styles.detailImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.detailImage, styles.detailImagePlaceholder]}>
          <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
        </View>
      )}

      {/* Badges */}
      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{exercise.body_part}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{exercise.equipment}</Text>
        </View>
        <View style={[styles.badge, styles.badgePrimary]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>{exercise.target}</Text>
        </View>
      </View>

      {/* Instructions */}
      {exercise.instructions.length > 0 && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          {exercise.instructions.map((step, i) => (
            <View key={i} style={styles.instructionRow}>
              <Text style={styles.instructionNum}>{i + 1}.</Text>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bouton import */}
      <View style={styles.importBtn}>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={() => onImport(exercise)}
          disabled={isImporting}
        >
          {isImporting ? 'Ajout en cours…' : 'Ajouter à ma bibliothèque'}
        </Button>
      </View>
    </ScrollView>
  )
}

function useDetailStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      maxHeight: 500,
    },
    detailImage: {
      width: '100%',
      height: DETAIL_IMAGE_HEIGHT,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    detailImagePlaceholder: {
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    badge: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgePrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    badgeText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    instructions: {
      marginBottom: spacing.md,
    },
    instructionsTitle: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    instructionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    instructionNum: {
      color: colors.primary,
      fontSize: fontSize.sm,
      fontWeight: '700',
      minWidth: 18,
    },
    instructionText: {
      color: colors.text,
      fontSize: fontSize.sm,
      flex: 1,
      lineHeight: 20,
    },
    importBtn: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
  })
}

// ── Écran principal ───────────────────────────────────────────────────────────

const ExerciseCatalogScreen: React.FC = () => {
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()

  // State
  const [query, setQuery] = useState('')
  const [exercises, setExercises] = useState<CatalogExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<CatalogExercise | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Refs pour éviter les race conditions
  const currentOffsetRef = useRef(0)
  const isLoadingRef = useRef(false)
  const isLoadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)

  // Modals
  const detailSheet = useModalState()
  const duplicateAlert = useModalState()

  // ── Chargement initial / recherche ────────────────────────────────────────

  const loadInitial = useCallback(async (q: string) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setHasError(false)
    currentOffsetRef.current = 0
    hasMoreRef.current = true
    try {
      const result = await searchCatalogExercises({ query: q, offset: 0, limit: PAGE_SIZE })
      setExercises(result.exercises)
      setHasMore(result.hasMore)
      hasMoreRef.current = result.hasMore
      currentOffsetRef.current = result.exercises.length
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  const loadMore = useCallback(async (q: string) => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    const offset = currentOffsetRef.current
    try {
      const result = await searchCatalogExercises({ query: q, offset, limit: PAGE_SIZE })
      setExercises(prev => [...prev, ...result.exercises])
      setHasMore(result.hasMore)
      hasMoreRef.current = result.hasMore
      currentOffsetRef.current = offset + result.exercises.length
    } catch {
      // Échec silencieux sur load more
    } finally {
      setIsLoadingMore(false)
      isLoadingMoreRef.current = false
    }
  }, [])

  // Debounce sur la recherche
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadInitial(query)
    }, query.trim().length === 0 ? 0 : DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [query, loadInitial])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleItemPress = useCallback((item: CatalogExercise) => {
    haptics.onSelect()
    setSelectedExercise(item)
    detailSheet.open()
  }, [haptics, detailSheet])

  const handleImport = useCallback(async (ex: CatalogExercise) => {
    if (isImporting) return
    setIsImporting(true)
    try {
      const { name, muscles, equipment, description } = mapCatalogToLocal(ex)

      // Vérifier si un exercice avec ce nom existe déjà
      const count = await database
        .get<Exercise>('exercises')
        .query(Q.where('name', name))
        .fetchCount()

      if (count > 0) {
        duplicateAlert.open()
        return
      }

      await database.write(async () => {
        await database.get<Exercise>('exercises').create((record) => {
          record.name = name
          record._muscles = JSON.stringify(muscles)
          record.equipment = equipment
          record.description = description
          record.isCustom = false
        })
      })

      haptics.onSuccess()
      detailSheet.close()
    } catch {
      // Erreur silencieuse — l'utilisateur peut réessayer
    } finally {
      setIsImporting(false)
    }
  }, [isImporting, haptics, detailSheet, duplicateAlert])

  const handleEndReached = useCallback(() => {
    loadMore(query)
  }, [loadMore, query])

  const handleRetry = useCallback(() => {
    loadInitial(query)
  }, [loadInitial, query])

  // ── Rendus ────────────────────────────────────────────────────────────────

  const renderItem = useCallback(({ item }: { item: CatalogExercise }) => (
    <CatalogItem item={item} onPress={handleItemPress} colors={colors} />
  ), [handleItemPress, colors])

  const renderSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), [styles])

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }, [isLoadingMore, styles, colors])

  const renderEmpty = useCallback(() => {
    if (isLoading) return null
    if (hasError) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="wifi-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Erreur de connexion</Text>
          <Text style={styles.emptySubtitle}>Vérifiez votre réseau et réessayez.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Aucun exercice trouvé</Text>
        <Text style={styles.emptySubtitle}>Essayez un autre terme de recherche.</Text>
      </View>
    )
  }, [isLoading, hasError, styles, colors, handleRetry])

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un exercice…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loader initial */}
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Liste */}
      {!isLoading && (
        <FlatList
          data={exercises}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}

      {/* BottomSheet — Détail exercice */}
      <BottomSheet
        visible={detailSheet.isOpen}
        onClose={detailSheet.close}
        title={selectedExercise?.name ?? ''}
      >
        {selectedExercise && (
          <ExerciseDetail
            exercise={selectedExercise}
            onImport={handleImport}
            isImporting={isImporting}
            colors={colors}
          />
        )}
      </BottomSheet>

      {/* AlertDialog — Exercice déjà existant */}
      <AlertDialog
        visible={duplicateAlert.isOpen}
        title="Déjà dans votre bibliothèque"
        message="Un exercice avec ce nom existe déjà dans votre bibliothèque."
        onConfirm={duplicateAlert.close}
        onCancel={duplicateAlert.close}
        confirmText="OK"
        hideCancel
      />
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchWrapper: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.ms,
      height: 44,
      gap: spacing.sm,
    },
    searchIcon: {
      flexShrink: 0,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.bodyMd,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      flexGrow: 1,
    },
    separator: {
      height: 1,
      backgroundColor: colors.card,
    },
    loaderContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerLoader: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: spacing.sm,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
      marginTop: spacing.sm,
    },
    emptySubtitle: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center',
    },
    retryBtn: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
    },
    retryText: {
      color: colors.primaryText,
      fontWeight: '700',
      fontSize: fontSize.sm,
    },
  })
}

export default ExerciseCatalogScreen
