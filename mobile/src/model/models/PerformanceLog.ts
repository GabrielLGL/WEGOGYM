// Importation des types de base de WatermelonDB
import { Model, Relation } from '@nozbe/watermelondb'
// Importation des décorateurs pour définir les colonnes et les relations
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
// Importation du type Exercise pour la relation
import type Exercise from './Exercise'

/**
 * Modèle représentant une entrée de performance dans l'historique (Stats).
 * Chaque modification de poids ou ajout d'exercice crée un log ici.
 */
export default class PerformanceLog extends Model {
  // Nom de la table physique dans SQLite
  static table = 'performance_logs'

  // Définition de l'appartenance : un log appartient à un exercice
  static associations = {
    exercises: { type: 'belongs_to', key: 'exercise_id' },
  } as const

  // Colonne numérique pour le nombre de séries effectuées
  @field('sets') sets!: number

  // Colonne numérique pour le poids soulevé
  @field('weight') weight!: number

  // Colonne numérique pour le nombre de répétitions
  @field('reps') reps!: number

  // Relation "Belongs To" : permet d'accéder à l'objet Exercise lié à ce log
  @relation('exercises', 'exercise_id') exercise!: Relation<Exercise>

  // Date de création du log (utilisée pour l'axe X du graphique)
  @readonly @date('created_at') createdAt!: Date
}
