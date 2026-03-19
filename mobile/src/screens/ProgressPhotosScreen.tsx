import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'

import { database } from '../model'
import ProgressPhoto from '../model/models/ProgressPhoto'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { Button } from '../components/Button'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import {
  capturePhoto,
  pickPhotoFromGallery,
  deletePhoto,
} from '../services/progressPhotoService'

// ─── Catégories ──────────────────────────────────────────────────────────────

type CategoryFilter = 'all' | 'front' | 'side' | 'back'

const CATEGORY_FILTERS: CategoryFilter[] = ['all', 'front', 'side', 'back']

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  photos: ProgressPhoto[]
}

function ProgressPhotosScreenBase({ photos }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const { width: screenWidth } = useWindowDimensions()
  const haptics = useHaptics()
  const { t, language } = useLanguage()
  const addSheet = useModalState()
  const categorySheet = useModalState()

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [deleteTarget, setDeleteTarget] = useState<ProgressPhoto | null>(null)
  const [beforePhoto, setBeforePhoto] = useState<ProgressPhoto | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<ProgressPhoto | null>(null)
  const [pendingSource, setPendingSource] = useState<'camera' | 'gallery' | null>(null)

  const locale = language === 'fr' ? 'fr-FR' : 'en-US'

  const categoryLabelMap: Record<CategoryFilter, string> = useMemo(() => ({
    all: t.progressPhotos.filterAll,
    front: t.progressPhotos.filterFront,
    side: t.progressPhotos.filterSide,
    back: t.progressPhotos.filterBack,
  }), [t])

  // Filtrage par catégorie
  const filteredPhotos = useMemo(() => {
    if (categoryFilter === 'all') return photos
    return photos.filter(p => p.category === categoryFilter)
  }, [photos, categoryFilter])

  // Comparaison before/after automatique
  const comparisonPhotos = useMemo(() => {
    if (beforePhoto && afterPhoto) return { before: beforePhoto, after: afterPhoto }
    if (filteredPhotos.length < 2) return null
    return {
      before: filteredPhotos[filteredPhotos.length - 1], // la plus ancienne
      after: filteredPhotos[0], // la plus récente
    }
  }, [filteredPhotos, beforePhoto, afterPhoto])

  const handlePhotoTap = useCallback((photo: ProgressPhoto) => {
    haptics.onSelect()
    if (!beforePhoto) {
      setBeforePhoto(photo)
      setAfterPhoto(null)
    } else if (!afterPhoto && photo.id !== beforePhoto.id) {
      // Trier : la plus ancienne en "avant"
      if (photo.date < beforePhoto.date) {
        setAfterPhoto(beforePhoto)
        setBeforePhoto(photo)
      } else {
        setAfterPhoto(photo)
      }
    } else {
      // Reset et sélectionner celle-ci comme "avant"
      setBeforePhoto(photo)
      setAfterPhoto(null)
    }
  }, [beforePhoto, afterPhoto, haptics])

  const handleResetComparison = useCallback(() => {
    setBeforePhoto(null)
    setAfterPhoto(null)
  }, [])

  const handleSelectSource = useCallback((source: 'camera' | 'gallery') => {
    addSheet.close()
    setPendingSource(source)
    categorySheet.open()
  }, [addSheet, categorySheet])

  const handleSelectCategory = useCallback(async (category: string | null) => {
    categorySheet.close()
    const source = pendingSource
    setPendingSource(null)
    if (!source) return

    const cat = category ?? undefined
    const uri = source === 'camera'
      ? await capturePhoto(cat)
      : await pickPhotoFromGallery(cat)

    if (!uri) return

    try {
      await database.write(async () => {
        await database.get<ProgressPhoto>('progress_photos').create(record => {
          record.date = Date.now()
          record.photoUri = uri
          record.category = category
          record.note = null
          record.bodyMeasurementId = null
        })
      })
      haptics.onSuccess()
    } catch (e) {
      if (__DEV__) console.error('[ProgressPhotosScreen] create photo record:', e)
    }
  }, [pendingSource, haptics, categorySheet])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      const uri = deleteTarget.photoUri
      await database.write(async () => {
        await deleteTarget.destroyPermanently()
      })
      await deletePhoto(uri)
      haptics.onDelete()
      // Nettoyer la comparaison si la photo supprimée y était
      if (beforePhoto?.id === deleteTarget.id) setBeforePhoto(null)
      if (afterPhoto?.id === deleteTarget.id) setAfterPhoto(null)
    } catch (e) {
      if (__DEV__) console.error('[ProgressPhotosScreen] handleDelete:', e)
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, haptics, beforePhoto, afterPhoto])

  const handleLongPress = useCallback((photo: ProgressPhoto) => {
    haptics.onDelete()
    setDeleteTarget(photo)
  }, [haptics])

  const numColumns = 3
  const thumbSize = (screenWidth - spacing.md * 2 - spacing.xs * (numColumns - 1)) / numColumns

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    })
  }, [locale])

  const renderThumbnail = useCallback(({ item }: { item: ProgressPhoto }) => {
    const isSelectedBefore = beforePhoto?.id === item.id
    const isSelectedAfter = afterPhoto?.id === item.id
    const isSelected = isSelectedBefore || isSelectedAfter

    return (
      <TouchableOpacity
        style={[
          styles.thumbnail,
          { width: thumbSize, height: thumbSize * (4 / 3) },
          isSelected && styles.thumbnailSelected,
        ]}
        onPress={() => handlePhotoTap(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.photoUri }}
          style={styles.thumbnailImage}
          contentFit="cover"
        />
        <View style={styles.thumbnailOverlay}>
          <Text style={styles.thumbnailDate}>{formatDate(item.date)}</Text>
        </View>
        {isSelected && (
          <View style={styles.thumbnailBadge}>
            <Text style={styles.thumbnailBadgeText}>
              {isSelectedBefore ? t.progressPhotos.before : t.progressPhotos.after}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }, [beforePhoto, afterPhoto, thumbSize, styles, handlePhotoTap, handleLongPress, formatDate, t])

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtres catégorie */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORY_FILTERS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                categoryFilter === cat && styles.filterChipActive,
              ]}
              onPress={() => {
                haptics.onSelect()
                setCategoryFilter(cat)
                handleResetComparison()
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  categoryFilter === cat && styles.filterChipTextActive,
                ]}
              >
                {categoryLabelMap[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Comparaison Before/After */}
        {comparisonPhotos && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.progressPhotos.comparison}</Text>
              {(beforePhoto || afterPhoto) && (
                <TouchableOpacity onPress={handleResetComparison}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonLabel}>{t.progressPhotos.before}</Text>
                <Image
                  source={{ uri: comparisonPhotos.before.photoUri }}
                  style={[styles.comparisonImage, { height: (screenWidth - spacing.md * 3) / 2 * (4 / 3) }]}
                  contentFit="cover"
                />
                <Text style={styles.comparisonDate}>
                  {formatDate(comparisonPhotos.before.date)}
                </Text>
              </View>
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonLabel}>{t.progressPhotos.after}</Text>
                <Image
                  source={{ uri: comparisonPhotos.after.photoUri }}
                  style={[styles.comparisonImage, { height: (screenWidth - spacing.md * 3) / 2 * (4 / 3) }]}
                  contentFit="cover"
                />
                <Text style={styles.comparisonDate}>
                  {formatDate(comparisonPhotos.after.date)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Grille de miniatures */}
        {filteredPhotos.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
              {t.progressPhotos.history}
            </Text>
            <Text style={styles.hintText}>{t.progressPhotos.tapToSelect}</Text>
            <FlatList
              data={filteredPhotos}
              renderItem={renderThumbnail}
              keyExtractor={item => item.id}
              numColumns={numColumns}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContainer}
            />
          </>
        )}

        {/* État vide */}
        {filteredPhotos.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>{t.progressPhotos.emptyTitle}</Text>
            <Text style={styles.emptyText}>{t.progressPhotos.emptyMessage}</Text>
          </View>
        )}

        {/* Spacer pour les boutons */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Boutons d'action en bas */}
      <View style={styles.actionButtons}>
        <Button
          variant="primary"
          size="md"
          onPress={() => { haptics.onPress(); addSheet.open() }}
        >
          {t.progressPhotos.addPhoto}
        </Button>
      </View>

      {/* BottomSheet choix source */}
      <BottomSheet
        visible={addSheet.isOpen}
        onClose={addSheet.close}
        title={t.progressPhotos.addSheetTitle}
      >
        <View style={styles.sheetContent}>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => handleSelectSource('camera')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={styles.sheetOptionText}>{t.progressPhotos.camera}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => handleSelectSource('gallery')}
            activeOpacity={0.7}
          >
            <Ionicons name="images-outline" size={24} color={colors.primary} />
            <Text style={styles.sheetOptionText}>{t.progressPhotos.gallery}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* BottomSheet choix catégorie */}
      <BottomSheet
        visible={categorySheet.isOpen}
        onClose={() => { categorySheet.close(); setPendingSource(null) }}
        title={t.progressPhotos.categorySheetTitle}
      >
        <View style={styles.sheetContent}>
          {(['front', 'side', 'back', null] as const).map(cat => (
            <TouchableOpacity
              key={cat ?? 'none'}
              style={styles.sheetOption}
              onPress={() => handleSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetOptionText}>
                {cat === 'front' ? t.progressPhotos.categoryFront
                  : cat === 'side' ? t.progressPhotos.categorySide
                  : cat === 'back' ? t.progressPhotos.categoryBack
                  : t.progressPhotos.categoryNone}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* AlertDialog suppression */}
      <AlertDialog
        visible={deleteTarget !== null}
        title={t.progressPhotos.deleteTitle}
        message={t.progressPhotos.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText={t.progressPhotos.deleteConfirm}
        cancelText={t.progressPhotos.deleteCancel}
        confirmColor={colors.danger}
      />
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    // Filters
    filterRow: {
      marginBottom: spacing.md,
    },
    filterContent: {
      gap: spacing.sm,
    },
    filterChip: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
    },
    filterChipText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: colors.primaryText,
    },
    // Comparison
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    comparisonRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    comparisonCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    comparisonLabel: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    comparisonImage: {
      width: '100%',
    },
    comparisonDate: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: spacing.xs,
    },
    // Grid
    gridContainer: {
      gap: spacing.xs,
    },
    gridRow: {
      gap: spacing.xs,
    },
    thumbnail: {
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    thumbnailSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
    },
    thumbnailOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingVertical: 2,
      paddingHorizontal: spacing.xs,
    },
    thumbnailDate: {
      fontSize: fontSize.caption,
      color: colors.primaryText,
      textAlign: 'center',
    },
    thumbnailBadge: {
      position: 'absolute',
      top: spacing.xs,
      left: spacing.xs,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
    },
    thumbnailBadgeText: {
      fontSize: fontSize.caption,
      fontWeight: '700',
      color: colors.primaryText,
    },
    hintText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    // Action buttons
    actionButtons: {
      position: 'absolute',
      bottom: spacing.lg,
      left: spacing.md,
      right: spacing.md,
    },
    // Sheets
    sheetContent: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    sheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.ms,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
    },
    sheetOptionText: {
      fontSize: fontSize.md,
      color: colors.text,
      fontWeight: '500',
    },
  }), [colors])
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  photos: database
    .get<ProgressPhoto>('progress_photos')
    .query(Q.sortBy('date', Q.desc))
    .observe(),
}))

const ObservableContent = enhance(ProgressPhotosScreenBase)

const ProgressPhotosScreen = () => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableContent />}
    </View>
  )
}

export default ProgressPhotosScreen
