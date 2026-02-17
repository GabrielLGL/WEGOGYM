import { Model, Q } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'
import type Session from './Session'

export default class Program extends Model {
  static table = 'programs'
  static associations = {
    sessions: { type: 'has_many', foreignKey: 'program_id' },
  } as const

  @field('name') name!: string
  @field('position') position!: number
  @readonly @date('created_at') createdAt!: Date
  @children('sessions') sessions!: Session[]

  // Ajoute cette méthode
  async duplicate() {
    // On accède à la DB via this.database ou this.collection
    const db = this.database
    
    // On encapsule tout dans un write global
    await db.write(async () => {
        const count = await db.get('programs').query().fetchCount()
        
        // 1. Création du programme
        const newProgram = await db.get<Program>('programs').create(p => {
            p.name = `${this.name} (Copie)`
            p.position = count
        })

        // 2. Récupération des sessions
        const originalSessions = await this.sessions.fetch()
        
        // ... (Tu peux copier ta logique de boucle for ici)
        // L'avantage est que ton HomeScreen n'a plus à savoir COMMENT on duplique, juste QU'ON duplique.
    })
  }
}