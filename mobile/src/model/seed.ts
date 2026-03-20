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
  { name: 'Corde à sauter', muscles: ['Cardio'], equipment: 'Poids du corps' },

  // --- Pecs ---
  { name: 'Pompes', muscles: ['Pecs', 'Triceps', 'Epaules'], equipment: 'Poids du corps' },
  { name: 'Écartés Haltères', muscles: ['Pecs'], equipment: 'Poids libre' },
  { name: 'Développé Décliné Barre', muscles: ['Pecs', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Développé Décliné Haltères', muscles: ['Pecs', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Cable Flyes Bas', muscles: ['Pecs'], equipment: 'Poulies' },
  { name: 'Cable Flyes Haut', muscles: ['Pecs'], equipment: 'Poulies' },
  { name: 'Développé Couché Machine', muscles: ['Pecs', 'Epaules', 'Triceps'], equipment: 'Machine' },
  { name: 'Pompes Déclinées', muscles: ['Pecs', 'Triceps'], equipment: 'Poids du corps' },

  // --- Dos ---
  { name: 'Soulevé de Terre', muscles: ['Dos', 'Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Tirage Nuque', muscles: ['Dos', 'Biceps'], equipment: 'Poulies' },
  { name: 'Rowing Machine', muscles: ['Dos', 'Biceps'], equipment: 'Machine' },
  { name: 'Rowing Poulie Basse', muscles: ['Dos', 'Biceps'], equipment: 'Poulies' },
  { name: 'Hyperextensions', muscles: ['Dos', 'Fessiers'], equipment: 'Machine' },
  { name: 'Good Morning', muscles: ['Dos', 'Ischios'], equipment: 'Poids libre' },
  { name: 'T-Bar Row', muscles: ['Dos', 'Biceps', 'Trapèzes'], equipment: 'Poids libre' },
  { name: 'Tirage Poitrine Prise Serrée', muscles: ['Dos', 'Biceps'], equipment: 'Poulies' },

  // --- Quadriceps ---
  { name: 'Squat Gobelet', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Squat Avant', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Sissy Squat', muscles: ['Quadriceps'], equipment: 'Poids du corps' },
  { name: 'Step Up', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Fentes Marchées', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids du corps' },
  { name: 'Fentes Arrières', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },
  { name: 'Split Squat', muscles: ['Quadriceps', 'Fessiers'], equipment: 'Poids libre' },

  // --- Ischios ---
  { name: 'Hip Thrust Barre', muscles: ['Fessiers', 'Ischios'], equipment: 'Poids libre' },
  { name: 'Curl Nordique', muscles: ['Ischios'], equipment: 'Poids du corps' },
  { name: 'Leg Curl Debout', muscles: ['Ischios'], equipment: 'Machine' },

  // --- Mollets ---
  { name: 'Mollets Haltères Debout', muscles: ['Mollets'], equipment: 'Poids libre' },
  { name: 'Élévation sur Pointes Debout', muscles: ['Mollets'], equipment: 'Poids du corps' },

  // --- Épaules ---
  { name: 'Développé Arnold', muscles: ['Epaules', 'Triceps'], equipment: 'Poids libre' },
  { name: 'Élévations Frontales', muscles: ['Epaules'], equipment: 'Poids libre' },
  { name: 'Oiseau Poulie', muscles: ['Epaules', 'Dos'], equipment: 'Poulies' },
  { name: 'Développé Machine Épaules', muscles: ['Epaules', 'Triceps'], equipment: 'Machine' },
  { name: 'Élévations Latérales Poulie', muscles: ['Epaules'], equipment: 'Poulies' },
  { name: 'Rotation Externe Épaule', muscles: ['Epaules'], equipment: 'Poids libre' },

  // --- Trapèzes ---
  { name: 'Shrugs Machine', muscles: ['Trapèzes'], equipment: 'Machine' },
  { name: 'Rowing Menton Haltères', muscles: ['Trapèzes', 'Epaules'], equipment: 'Poids libre' },

  // --- Biceps ---
  { name: 'Curl Câble', muscles: ['Biceps'], equipment: 'Poulies' },
  { name: 'Curl Concentré', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl Barre Droite', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl Incliné Haltères', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl Spider', muscles: ['Biceps'], equipment: 'Poids libre' },
  { name: 'Curl 21s', muscles: ['Biceps'], equipment: 'Poids libre' },

  // --- Triceps ---
  { name: 'Triceps Kickback', muscles: ['Triceps'], equipment: 'Poids libre' },
  { name: 'Développé Couché Prise Serrée', muscles: ['Triceps', 'Pecs'], equipment: 'Poids libre' },
  { name: 'Triceps Machine', muscles: ['Triceps'], equipment: 'Machine' },
  { name: 'Diamond Push-ups', muscles: ['Triceps', 'Pecs'], equipment: 'Poids du corps' },
  { name: 'Extensions Poulie Basse', muscles: ['Triceps'], equipment: 'Poulies' },

  // --- Abdos ---
  { name: 'Russian Twist', muscles: ['Abdos'], equipment: 'Poids libre' },
  { name: 'Gainage Latéral', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Leg Raises Suspendu', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Crunch Machine', muscles: ['Abdos'], equipment: 'Machine' },
  { name: 'Crunch Câble', muscles: ['Abdos'], equipment: 'Poulies' },
  { name: 'Crunch Obliques', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Mountain Climbers', muscles: ['Abdos', 'Cardio'], equipment: 'Poids du corps' },
  { name: 'Toes to Bar', muscles: ['Abdos'], equipment: 'Poids du corps' },
  { name: 'Dead Bug', muscles: ['Abdos'], equipment: 'Poids du corps' },

  // --- Cardio ---
  { name: 'Vélo Stationnaire', muscles: ['Cardio'], equipment: 'Machine' },
  { name: 'Stepping', muscles: ['Cardio', 'Quadriceps'], equipment: 'Machine' },
  { name: 'Sprint', muscles: ['Cardio', 'Quadriceps'], equipment: 'Poids du corps' },
  { name: 'HIIT', muscles: ['Cardio'], equipment: 'Poids du corps' },
  { name: 'Battle Ropes', muscles: ['Cardio', 'Epaules'], equipment: 'Poids libre' },
  { name: "Vélo d'Appartement", muscles: ['Cardio'], equipment: 'Machine' },
  { name: 'Box Jump', muscles: ['Cardio', 'Quadriceps'], equipment: 'Poids du corps' },
  { name: 'Burpees', muscles: ['Cardio'], equipment: 'Poids du corps' }
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
          u.friendCode = Math.random().toString(36).substring(2, 10).toUpperCase()
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
        await database.batch(toCreate)
      }
    })
  } catch (error) {
    if (__DEV__) console.error("❌ Erreur Seed:", error);
  }
}
