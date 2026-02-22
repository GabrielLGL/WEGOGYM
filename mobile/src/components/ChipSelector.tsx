import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { colors, borderRadius, spacing, fontSize } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

interface ChipSelectorProps {
  items: readonly string[]
  selectedValue: string | null
  onChange: (value: string | null) => void
  allowNone?: boolean // Permet de désélectionner (défaut: true)
  noneLabel?: string // Label pour l'option "aucun" (défaut: "Tous")
  style?: StyleProp<ViewStyle>
}

/**
 * ChipSelector - Sélecteur de filtres horizontal avec chips
 *
 * Remplace les 3 implémentations identiques de filtres muscles/équipement.
 * Permet de sélectionner un élément parmi une liste ou de tout afficher.
 *
 * @param items - Liste des valeurs disponibles
 * @param selectedValue - Valeur actuellement sélectionnée (null = aucun filtre)
 * @param onChange - Callback appelé quand la sélection change
 * @param allowNone - Permet de désélectionner (défaut: true)
 * @param noneLabel - Label pour l'option "aucun" (défaut: "Tous")
 *
 * @example
 * const [filterMuscle, setFilterMuscle] = useState<string | null>(null)
 *
 * <ChipSelector
 *   items={MUSCLES_LIST}
 *   selectedValue={filterMuscle}
 *   onChange={setFilterMuscle}
 *   noneLabel="Tous muscles"
 * />
 */
export const ChipSelector: React.FC<ChipSelectorProps> = ({
  items,
  selectedValue,
  onChange,
  allowNone = true,
  noneLabel = 'Tous',
  style,
}) => {
  const haptics = useHaptics()

  const handleSelect = (value: string | null) => {
    haptics.onSelect() // Light haptic pour sélection
    onChange(value)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Option "Tous" / "Aucun filtre" */}
      {allowNone && (
        <TouchableOpacity
          style={[
            styles.chip,
            selectedValue === null && styles.chipSelected,
          ]}
          onPress={() => handleSelect(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              selectedValue === null && styles.chipTextSelected,
            ]}
          >
            {noneLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* Options de filtre */}
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.chip,
            selectedValue === item && styles.chipSelected,
          ]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              selectedValue === item && styles.chipTextSelected,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  contentContainer: {
    paddingRight: spacing.md, // Pour le dernier chip
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardSecondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text,
    fontWeight: 'bold',
  },
})
