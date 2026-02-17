import { database } from './index'
import Exercise from './models/Exercise'
import User from './models/User'
import { Q } from '@nozbe/watermelondb'

export const BASIC_EXERCISES = [
  { name: 'Développé Couché Barre', muscles: ['Pecs', 'Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Développé Couché Haltères', muscles: ['Pecs', 'Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Développé Incliné Barre', muscles: ['Pecs', 'Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Développé Incliné Haltères', muscles: ['Pecs', 'Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Écartés Poulie', muscles: ['Pecs'], equipment: 'Poulies' },
  { name: 'Pec Deck (Machine)', muscles: ['Pecs'], equipment: 'Machine' },
  { name: 'Dips (Bas des pecs)', muscles: ['Pecs', 'Triceps'], equipment: 'Poids du corps' },
  { name: 'Tractions', muscles: ['Dos', 'Biceps'], equipment: 'Poids du corps' },
  { name: 'Rowing Barre', muscles: ['Dos', 'Trapèzes'], equipment: 'Poids libre' },
  { name: 'Tirage Poitrine', muscles: ['Dos', 'Biceps'], equipment: 'Poulies' },
  { name: 'Rowing Haltère Unilatéral', muscles: ['Dos', 'Biceps'], equipment: 'Poids libre' },
  { name: 'Pull Over Poulie', muscles: ['Dos'], equipment: 'Poulies' },
  { name: 'Tirage Horizontal', muscles: ['Dos', 'Trapèzes'], equipment: 'Poulies' },
  { name: 'Extensions Lombaires', muscles: ['Dos'], equipment: 'Poids du corps' },
  { name: 'Squat Arrière', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Presse à Cuisses', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Machine' },
  { name: 'Leg Extension', muscles: ['Quadriceps'], equipment: 'Machine' },
  { name: 'Hack Squat', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Machine' },
  { name: 'Fentes Haltères', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Squat Bulgare', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Soulevé de Terre Roumain', muscles: ['Ischios', 'Fessiers', 'Dos'], equipment: 'Poids libre' },
  { name: 'Leg Curl Allongé', muscles: ['Ischios'], equipment: 'Machine' },
  { name: 'Leg Curl Assis', muscles: ['Ischios'], equipment: 'Machine' },
  { name: 'Soulevé de Terre Jambes Tendues', muscles: ['Ischios'], equipment: 'Poids libre' },
  { name: 'Extensions Mollets Debout', muscles: ['Mollets'], equipment: 'Machine' },
  { name: 'Extensions Mollets Assis', muscles: ['Mollets'], equipment: 'Machine' },
  { name: 'Mollets à la Presse', muscles: ['Mollets'], equipment: 'Machine' },
  { name: 'Développé Militaire', muscles: ['Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Élévations Latérales', muscles: ['Epaules'], equipment: 'Poids libre' },
  { name: 'Oiseau (Buste penché)', muscles: ['Epaules', 'Dos'], equipment: 'Poids libre' },
  { name: 'Développé Haltères Assis', muscles: ['Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Face Pull', muscles: ['Epaules', 'Trapèzes'], equipment: 'Poulies' },
  { name: 'Shrugs Barre', muscles: ['Trapèzes'], equipment: 'Poids libre' },
  { name: 'Shrugs Haltères', muscles: ['Trapèzes'], equipment: 'Poids libre' },
  { name: 'Tirage Menton', muscles: ['Trapèzes', 'Epaules'], equipment: 'Poids libre' },
  { name: 'Curl Haltères', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl Barre EZ', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl Marteau', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl Pupitre', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Extensions Poulie Haute', muscles: ['Triceps'], equipment: 'Poulies' },
  { name: 'Barre au front', muscles: ['Triceps'], equipment: 'Poids libre' },
  { name: 'Extensions Nuque Haltère', muscles: ['Triceps'], equipment: 'Poids libre' },
  { name: 'Dips (Triceps focus)', muscles: ['Triceps'], equipment: 'Poids du corps' },
  { name: 'Crunch', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Relevé de jambes', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Planche', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Roulette à abdos', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Tapis de Course', muscles: ['Cardio'], equipment: 'Machine' },
  { name: 'Vélo Elliptique', muscles: ['Cardio'], equipment: 'Machine' },
  { name: 'Rameur', muscles: ['Cardio'], equipment: 'Machine' },
  { name: 'Corde à sauter', muscles: ['Cardio'], equipment: 'Poids du corps' }
]

export const seedExercises = async () => {
  try {
    const exercisesCollection = database.get<Exercise>('exercises')
    const usersCollection = database.get<User>('users')

    await database.write(async () => {
      // 1. Créer l'utilisateur par défaut si nécessaire
      const userCount = await usersCollection.query().fetchCount()
      if (userCount === 0) {
        await usersCollection.create(u => {
          u.email = "me@gymtracker.app"
          u.timerEnabled = true
        })
      }

      // 2. Créer les exercices
      const toCreate = []
      for (const exoData of BASIC_EXERCISES) {
        const existing = await exercisesCollection.query(Q.where('name', exoData.name)).fetchCount()
        if (existing === 0) {
          toCreate.push(
            exercisesCollection.prepareCreate(e => {
              e.name = exoData.name
              e.isCustom = false
              e.muscles = exoData.muscles
              e.equipment = exoData.equipment
            })
          )
        }
      }

      if (toCreate.length > 0) {
        await database.batch(...toCreate)
      }
    })
  } catch (error) {
    console.error("❌ Erreur Seed:", error);
  }
}
