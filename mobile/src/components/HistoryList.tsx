// Importation de React pour définir le composant
import React from 'react'
// Importation des composants de base de React Native
import { View, Text, FlatList, StyleSheet } from 'react-native'
// Importation du HOC withObservables pour lier le composant aux données réactives
import withObservables from '@nozbe/with-observables'
// Importation du type Query de WatermelonDB
import { Query } from '@nozbe/watermelondb'
// Importation du hook pour accéder à la navigation
import { useNavigation } from '@react-navigation/native'
// Importation du type de navigation pour TypeScript
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
// Importation des types de routes de l'application
import { RootStackParamList } from '../navigation/index'
// Importation des modèles de données
import Session from '../model/models/Session'
import History from '../model/models/History'
// Importation du composant HistoryItem pour afficher chaque ligne
import HistoryItem from './HistoryItem'

// Définition de l'interface des propriétés du composant
interface Props {
  histories: History[] // Liste des sessions terminées injectée par withObservables
}

/**
 * Composant affichant la liste de l'historique d'une séance précise.
 */
const HistoryList: React.FC<Props> = ({ histories }) => {
  // Initialisation de la navigation avec les types définis
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  return (
    // Conteneur principal de la liste
    <View style={styles.container}>
      {/* En-tête affichant le nombre de séances passées */}
      <Text style={styles.header}>Historique ({histories.length})</Text>

      {/* Liste performante pour afficher l'historique */}
      <FlatList
        data={histories} // Données source (tableau d'objets History)
        keyExtractor={item => item.id} // Utilise l'ID unique de WatermelonDB comme clé
        renderItem={({ item }) => (
          // Affiche chaque séance passée via HistoryItem
          <HistoryItem
            history={item} 
            // Navigation vers l'écran SessionLive (Note: SessionLive semble être obsolète ou redirigé)
            onPress={() => navigation.navigate('SessionLive', { sessionId: item.id })}
          />
        )}
        // Composant affiché si la liste est vide
        ListEmptyComponent={<Text style={styles.empty}>Aucune séance enregistrée.</Text>}
      />
    </View>
  )
}

// Définition des styles CSS
const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5, color: 'white' },
  empty: { fontStyle: 'italic', color: 'gray', marginLeft: 5 }
})

/**
 * Exportation du composant avec observation des données.
 * On surveille la propriété 'session' et on observe ses 'histories'.
 */
export default withObservables(['session'], ({ session }: { session: Session }) => ({
  // Récupère et observe les entrées d'historique liées à cette séance
  histories: (session.histories as unknown as Query<History>).observe()
}))(HistoryList)
