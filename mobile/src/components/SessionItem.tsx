// Importation de React
import React from 'react'
// Importation des composants de base de React Native
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
// Importation du HOC withObservables pour lier le composant aux données WatermelonDB
import withObservables from '@nozbe/with-observables'
// Importation de l'objet Q pour les requêtes
import { Q } from '@nozbe/watermelondb'
// Importation de l'instance de la base de données
import { database } from '../model/index'
// Importation des modèles pour le typage TypeScript
import Session from '../model/models/Session'
import Exercise from '../model/models/Exercise'
import { useHaptics } from '../hooks/useHaptics'
import { borderRadius, spacing, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

// Définition des propriétés (Props) attendues par le composant
interface Props {
  session: Session // L'objet séance à afficher
  onPress: () => void // Fonction appelée au clic simple (ouvrir la séance)
  onOptionsPress: () => void // Fonction appelée au clic sur les trois petits points
  exercises: Exercise[] // Liste des exercices liés à cette séance (injectée par withObservables)
}

/**
 * Composant représentant une ligne de séance dans la liste des programmes.
 */
const SessionItem: React.FC<Props> = ({ session, onPress, onOptionsPress, exercises }) => {
  const { colors, neuShadow } = useTheme()
  const styles = useStyles(colors)
  const haptics = useHaptics()

  // Génération d'un texte de prévisualisation (ex: "Squat, Tractions, Développé...")
  // On prend les 3 premiers exercices de la liste
  const exercisePreview = exercises.length > 0
    ? exercises.slice(0, 3).map(e => e.name).join(', ') + (exercises.length > 3 ? '...' : '')
    : null

  return (
    <View style={[styles.container, neuShadow.elevated]}>
      {/* Zone cliquable principale pour ouvrir le détail de la séance */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.clickableArea}
      >
        <View>
          {/* Titre de la séance */}
          <Text style={styles.title}>{session.name}</Text>
          {/* Affichage de la prévisualisation des exercices si elle existe */}
          {exercisePreview && (
            <Text style={styles.preview} numberOfLines={1}>
              {exercisePreview}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Bouton d'options (Trois petits points) */}
      <TouchableOpacity
        onPress={() => {
          haptics.onPress()
          onOptionsPress()
        }}
        style={styles.optionsButton}
      >
        <Text style={styles.moreIcon}>•••</Text>
      </TouchableOpacity>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    clickableArea: { flex: 1, padding: spacing.md },
    optionsButton: { padding: spacing.md },
    title: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text },
    preview: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
    moreIcon: { color: colors.placeholder, fontSize: fontSize.md, fontWeight: 'bold' },
  })
}

/**
 * Exportation du composant enveloppé dans withObservables.
 * Cela permet au composant de se mettre à jour AUTOMATIQUEMENT
 * dès que le nom de la séance ou les exercices qui la composent changent.
 */
export default withObservables(['session'], ({ session }: { session: Session }) => ({
  session: session.observe(), // Observe les changements directs sur la séance
  // Requête complexe : On observe les exercices dont l'ID est présent dans la table de liaison 'session_exercises' pour cette séance
  exercises: database.get<Exercise>('exercises').query(
    Q.on('session_exercises', 'session_id', session.id)
  ).observe()
}))(SessionItem)
