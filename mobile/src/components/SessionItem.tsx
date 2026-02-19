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
import { colors, borderRadius } from '../theme'

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
  const haptics = useHaptics()

  // Génération d'un texte de prévisualisation (ex: "Squat, Tractions, Développé...")
  // On prend les 3 premiers exercices de la liste
  const exercisePreview = exercises.length > 0
    ? exercises.slice(0, 3).map(e => e.name).join(', ') + (exercises.length > 3 ? '...' : '')
    : null

  return (
    <View style={styles.container}>
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

// Styles CSS-in-JS du composant
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardSecondary,
  },
  clickableArea: { flex: 1, padding: 15 },
  optionsButton: { padding: 15 },
  title: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  preview: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  moreIcon: { color: colors.placeholder, fontSize: 16, fontWeight: 'bold' },
})

/**
 * Exportation du composant enveloppé dans withObservables.
 * Cela permet au composant de se mettre à jour AUTOMATIQUEMENT
 * dès que le nom de la séance ou les exercices qui la composent changent.
 */
export default withObservables(['session'], ({ session }) => ({
  session: session.observe(), // Observe les changements directs sur la séance
  // Requête complexe : On observe les exercices dont l'ID est présent dans la table de liaison 'session_exercises' pour cette séance
  exercises: database.get<Exercise>('exercises').query(
    Q.on('session_exercises', 'session_id', session.id)
  ).observe()
}))(SessionItem)
