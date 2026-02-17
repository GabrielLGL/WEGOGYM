// Importation des classes de base et des types de WatermelonDB
import { Model, Relation } from '@nozbe/watermelondb'
// Importation des décorateurs pour définir les colonnes et les relations
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
// Importation des types pour les relations
import type History from './History'
import type Exercise from './Exercise'

/**
 * Modèle représentant une série (set) d'un exercice dans une séance passée (History).
 */
export default class Set extends Model {
  // Nom de la table physique dans la base de données SQLite
  static table = 'sets'

  // Définition des associations (appartenances)
  static associations = {
    // Une série appartient à une entrée d'historique
    histories: { type: 'belongs_to', key: 'history_id' },
    // Une série appartient à un exercice
    exercises: { type: 'belongs_to', key: 'exercise_id' },
  } as const

  // Colonne numérique pour le poids soulevé dans cette série
  @field('weight') weight!: number

  // Colonne numérique pour le nombre de répétitions effectuées
  @field('reps') reps!: number

  // Colonne numérique pour l'ordre de la série dans l'exercice (1ère, 2ème, etc.)
  @field('set_order') setOrder!: number

  // Colonne booléenne : vrai si cette série est un record personnel (Personal Record)
  @field('is_pr') isPr!: boolean

  // Relation "Belongs To" vers l'historique : permet d'accéder à l'objet History parent
  @relation('histories', 'history_id') history!: Relation<History>

  // Relation "Belongs To" vers l'exercice : permet d'accéder à l'objet Exercise lié
  @relation('exercises', 'exercise_id') exercise!: Relation<Exercise>
}
