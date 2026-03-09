// Importation de React
import React, { useMemo } from 'react'
// Importation des composants React Native pour la structure et le style
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
// Importation du HOC withObservables pour lier le composant à la base de données
import withObservables from '@nozbe/with-observables'
// Importation des modèles de données
import Set from '../model/models/Set'
import Exercise from '../model/models/Exercise'
import { spacing, borderRadius, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

// Définition des propriétés attendues
interface Props {
  set: Set // L'objet série (poids/reps) à afficher
  exercise: Exercise // L'objet exercice lié à cette série
  onLongPress: () => void // Fonction appelée lors d'un appui long
}

/**
 * Composant affichant les détails d'une série effectuée dans l'historique.
 */
const SetItem: React.FC<Props> = ({ set, exercise, onLongPress }) => {
  const { colors, neuShadow } = useTheme()
  const styles = useStyles(colors)

  return (
    // Zone cliquable avec gestion de l'appui long (ex: pour supprimer ou modifier)
    <TouchableOpacity
      style={[styles.container, neuShadow.elevatedSm]}
      onLongPress={onLongPress}
      delayLongPress={500} // Déclenchement après 0.5 seconde
      activeOpacity={0.7}
    >
      {/* Colonne de gauche : Infos sur l'exercice */}
      <View style={styles.info}>
        {/* Nom de l'exercice (observé) */}
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        {/* Numéro de la série (ex: Série #1) */}
        <Text style={styles.setOrder}>Série #{set.setOrder}</Text>
      </View>

      {/* Affichage de la performance (ex: 80kg x 10) */}
      <Text style={styles.perf}>
        {set.weight}kg <Text style={styles.x}>x</Text> {set.reps}
      </Text>
    </TouchableOpacity>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      padding: spacing.md,
      backgroundColor: colors.card,
      marginBottom: spacing.sm,
      borderRadius: borderRadius.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    info: { flexDirection: 'column' },
    exerciseName: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.text, marginBottom: 2 },
    setOrder: { fontSize: fontSize.xs, color: colors.textSecondary },
    perf: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.primary },
    x: { fontSize: fontSize.sm, color: colors.textSecondary }
  }), [colors])
}

/**
 * Configuration de l'observation des données.
 * On surveille la série ET l'exercice lié pour mettre à jour l'UI en direct.
 */
const enhance = withObservables(['set'], ({ set }: { set: Set }) => ({
  set: set.observe(),
  exercise: set.exercise.observe()
}))

// Exportation du composant enrichi
export default enhance(SetItem)
