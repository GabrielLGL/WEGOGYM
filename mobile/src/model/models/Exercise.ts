// Importation des classes de base de WatermelonDB pour définir un modèle de données
import { Model } from '@nozbe/watermelondb'
// Importation des décorateurs pour lier les propriétés de la classe aux colonnes de la base de données
import { text, field, date, readonly } from '@nozbe/watermelondb/decorators'
// Importation de l'objet Q pour effectuer des requêtes complexes
import { Q } from '@nozbe/watermelondb'

// Définition de la classe Exercise qui représente la table 'exercises'
export default class Exercise extends Model {
  // Nom de la table dans la base de données SQLite
  static table = 'exercises'

  // Définition des relations avec les autres tables
  static associations = {
    // Un exercice peut être lié à plusieurs entrées dans 'session_exercises'
    session_exercises: { type: 'has_many', foreignKey: 'exercise_id' },
    // Un exercice peut avoir plusieurs logs de performance dans 'performance_logs'
    performance_logs: { type: 'has_many', foreignKey: 'exercise_id' },
  } as const

  // Colonne 'name' de type texte (nom de l'exercice)
  @text('name') name!: string

  // Colonne 'is_custom' de type booléen (vrai si l'utilisateur a créé l'exercice)
  @field('is_custom') isCustom!: boolean
  
  // Colonne 'muscles' stockée sous forme de chaîne JSON brute en base de données
  @text('muscles') _muscles!: string

  // Colonne 'equipment' optionnelle (ex: Poids libre, Machine)
  @text('equipment') equipment?: string

  // Colonne de date de création, gérée automatiquement et en lecture seule
  @readonly @date('created_at') createdAt!: Date

  // Colonne de date de mise à jour, gérée automatiquement et en lecture seule
  @readonly @date('updated_at') updatedAt!: Date

  // Getter pour transformer la chaîne JSON '_muscles' en un tableau de strings utilisable en JS
  get muscles(): string[] {
    try {
      // Analyse la chaîne JSON, retourne un tableau vide si vide
      return JSON.parse(this._muscles || '[]')
    } catch (e) {
      // Sécurité en cas de JSON malformé
      return []
    }
  }

  // Setter pour transformer un tableau de muscles JS en chaîne JSON avant stockage
  set muscles(value: string[]) {
    this._muscles = JSON.stringify(value)
  }

  // --- LOGIQUE DE SUPPRESSION EN CASCADE AMÉLIORÉE ---
  // Cette méthode permet de supprimer un exercice ET toutes les données qui y sont liées
  async deleteAllAssociatedData() {
    // 1. Récupération de tous les liens entre cet exercice et les séances programmées
    const sessionExos = await this.collections
      .get('session_exercises')
      .query(Q.where('exercise_id', this.id))
      .fetch();

    // 2. Récupération de tout l'historique de progression lié à cet exercice
    const logs = await this.collections
      .get('performance_logs')
      .query(Q.where('exercise_id', this.id))
      .fetch();

    // 3. Exécution d'une transaction d'écriture groupée (batch) pour garantir l'intégrité
    await this.database.write(async () => {
      const batch = [
        // On prépare la destruction de chaque lien de séance
        ...sessionExos.map(se => se.prepareDestroyPermanently()),
        // On prépare la destruction de chaque log de performance
        ...logs.map(l => l.prepareDestroyPermanently()),
        // On prépare enfin la destruction de l'exercice lui-même
        this.prepareDestroyPermanently()
      ];
      // On envoie toutes les destructions d'un coup à la base de données
      await this.database.batch(...batch);
    });
  }
}
