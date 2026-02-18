// Importation de React et des hooks nécessaires
import React, { useState, useRef, useEffect } from 'react'
// Importation des composants de base de React Native
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
// Importation du HOC withObservables pour lier le composant à la base de données
import withObservables from '@nozbe/with-observables'
// Importation de l'objet Q pour les requêtes WatermelonDB
import { Q } from '@nozbe/watermelondb'
// Importation de l'instance de la base de données
import { database } from '../model/index'
// Importation des modèles pour le typage TypeScript
import Program from '../model/models/Program'
import Session from '../model/models/Session'
// Importation du composant SessionItem pour afficher chaque séance
import SessionItem from './SessionItem'
import { colors, borderRadius } from '../theme'

// Définition des propriétés (Props) attendues par le composant
interface Props {
  program: Program // L'objet programme à afficher
  sessions: Session[] // Liste des séances liées (injectée par withObservables)
  onOpenSession: (s: Session) => void // Fonction pour ouvrir le détail d'une séance
  onLongPressProgram: () => void // Fonction pour déclencher le Drag & Drop du programme
  onAddSession: () => void // Fonction pour ajouter une séance au programme
  onOptionsPress: () => void // Fonction pour ouvrir les options du programme
  onSessionOptionsPress: (s: Session) => void // Fonction pour ouvrir les options d'une séance
}

/**
 * Composant représentant une section de programme (accordéon).
 * Il affiche le titre du programme et permet de dérouler la liste des séances.
 */
const ProgramSection: React.FC<Props> = ({
  program, 
  sessions, 
  onOpenSession, 
  onLongPressProgram, 
  onAddSession,
  onOptionsPress,
  onSessionOptionsPress
}) => {
  // État local pour gérer si l'accordéon est ouvert ou fermé
  const [isExpanded, setIsExpanded] = useState(false)
  // Référence pour l'animation d'opacité de la liste des séances
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Effet pour déclencher l'animation quand l'état isExpanded change
  useEffect(() => {
    if (isExpanded) {
      // Animation d'apparition en fondu (200ms)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    } else {
      // Réinitialisation immédiate de l'opacité à 0 quand on ferme
      fadeAnim.setValue(0)
    }
  }, [isExpanded])

  return (
    <View style={styles.container}>
      {/* Barre d'en-tête de la section (Titre + Icône options) */}
      <View style={styles.headerRow}>
        {/* Zone cliquable pour déplier/replier ou lancer le Drag & Drop */}
        <TouchableOpacity
          style={styles.headerLeft} 
          onPress={() => setIsExpanded(!isExpanded)} // Alterne l'état ouvert/fermé
          onLongPress={onLongPressProgram} // Déclenche la réorganisation
          delayLongPress={500} // Délai d'appui long
        >
          {/* Icône de flèche dynamique selon l'état d'ouverture */}
          <Text style={styles.arrowIcon}>{isExpanded ? '▼' : '▶'}</Text>
          {/* Nom du programme et nombre de séances */}
          <Text style={styles.title}>{program.name} <Text style={styles.count}>({sessions.length})</Text></Text>
        </TouchableOpacity>

        {/* Bouton d'options du programme (Trois petits points) */}
        <TouchableOpacity style={styles.headerRight} onPress={onOptionsPress}>
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Affichage de la liste des séances uniquement si déplié */}
      {isExpanded && (
        <Animated.View style={[styles.list, { opacity: fadeAnim }]}>
          {/* Boucle sur les séances pour les afficher via SessionItem */}
          {sessions.map(session => (
            <SessionItem
              key={session.id}
              session={session}
              onPress={() => onOpenSession(session)} // Ouvre le détail
              onOptionsPress={() => onSessionOptionsPress(session)} // Menu options séance
            />
          ))}
          {/* Bouton pointillé pour ajouter une nouvelle séance au programme */}
          <TouchableOpacity style={styles.emptyButton} onPress={onAddSession}>
            <Text style={styles.emptyButtonText}>+ Ajouter une nouvelle séance</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

// Définition des styles CSS du composant
const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { paddingLeft: 15, paddingVertical: 5 },
  arrowIcon: { fontSize: 14, color: colors.textSecondary, marginRight: 8, width: 20, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  count: { color: colors.textSecondary, fontSize: 14, fontWeight: 'normal' },
  moreIcon: { color: colors.textSecondary, fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  list: { paddingLeft: 10 },
  emptyButton: {
    padding: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed', // Style pointillé pour l'aspect "ajouter"
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5
  },
  emptyButtonText: { color: colors.primary, fontWeight: 'bold' }
})

/**
 * Exportation du composant avec observation des données.
 * On surveille le 'program' et on observe ses 'sessions' triées par position.
 */
export default withObservables(['program'], ({ program }) => ({
  program: program.observe(),
  sessions: database.get<Session>('sessions').query(
    Q.where('program_id', program.id),
    Q.sortBy('position', Q.asc)
  ).observe()
}))(ProgramSection)
