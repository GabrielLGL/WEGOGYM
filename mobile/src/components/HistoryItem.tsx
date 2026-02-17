// Importation de React pour la création de composants
import React from 'react'
// Importation des composants graphiques de base de React Native
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
// Importation du HOC withObservables pour lier le composant aux changements de la base de données
import withObservables from '@nozbe/with-observables'
// Importation du modèle History pour le typage TypeScript
import History from '../model/models/History'

// Définition des propriétés attendues par le composant
interface Props {
  history: History // L'objet d'historique à afficher (une séance terminée)
  onPress: () => void // La fonction à exécuter lors d'un clic sur l'élément
}

/**
 * Composant représentant un élément unique dans la liste de l'historique des entraînements.
 */
const HistoryItem: React.FC<Props> = ({ history, onPress }) => (
  // Zone cliquable pour l'élément de la liste
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <View>
      {/* Affichage de la date formatée de la séance (ex: 12/05/2024) */}
      <Text style={styles.title}>Séance du {history.startTime.toLocaleDateString()}</Text>
      {/* Affichage de l'heure formatée de début de la séance */}
      <Text style={styles.subtitle}>{history.startTime.toLocaleTimeString()}</Text>
    </View>
    {/* Icône de flèche pour indiquer que l'élément est cliquable */}
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
)

// Définition des styles CSS pour le composant
const styles = StyleSheet.create({
  item: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333' }, // Titre principal en gras sombre
  subtitle: { fontSize: 12, color: '#888', marginTop: 2 }, // Sous-titre en gris plus petit
  arrow: { fontSize: 20, color: '#ccc' } // Flèche de navigation discrète
})

/**
 * Exportation du composant enveloppé dans withObservables.
 * Le composant observera automatiquement toute mise à jour de l'objet 'history'.
 */
export default withObservables(['history'], ({ history }) => ({
  history
}))(HistoryItem)
