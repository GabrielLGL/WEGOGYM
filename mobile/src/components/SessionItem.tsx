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
// Importation de la bibliothèque haptique pour les vibrations
import * as Haptics from 'expo-haptics'

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
          // Déclenche une vibration légère lors du clic
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          // Appelle la fonction passée par le parent pour ouvrir le menu
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
    flexDirection: 'row', // Aligne le contenu et le bouton d'options horizontalement
    backgroundColor: '#1C1C1E', // Gris très foncé (style iOS)
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E'
  },
  clickableArea: { flex: 1, padding: 15 }, // Prend tout l'espace restant
  optionsButton: { padding: 15 }, // Zone de clic confortable pour les options
  title: { fontSize: 17, fontWeight: 'bold', color: 'white' },
  preview: { fontSize: 13, color: '#888', marginTop: 4 }, // Texte secondaire en gris
  moreIcon: { color: '#444', fontSize: 16, fontWeight: 'bold' }
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
