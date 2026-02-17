/**
 * Centralisation des chaînes de caractères de l'application
 *
 * Prépare la future internationalisation (i18n) et nettoie le code React
 * des chaînes hardcodées.
 *
 * @usage
 * import { STRINGS } from '../constants/strings'
 * <Text>{STRINGS.home.createProgram}</Text>
 */

export const STRINGS = {
  // HomeScreen
  home: {
    createProgram: '📂 Créer un Programme',
    newProgram: 'Nouveau programme',
    renameProgram: 'Renommer le programme',
    addSession: 'Ajouter une séance',
    renameSession: 'Renommer la séance',
    programOptions: {
      rename: 'Renommer le Programme',
      duplicate: 'Dupliquer le Programme',
      delete: 'Supprimer le Programme',
    },
    sessionOptions: {
      rename: 'Renommer la Séance',
      duplicate: 'Dupliquer la Séance',
      delete: 'Supprimer la Séance',
      moveTo: 'Déplacer vers :',
    },
    placeholders: {
      programName: 'ex : PPL ou Upper Lower',
      sessionName: 'ex : Push ou Pull',
    },
  },

  // SessionDetailScreen
  sessionDetail: {
    addExercise: '+ AJOUTER UN EXERCICE',
    editTarget: "Modifier l'objectif",
    emptyState: 'Ajoutez un exercice pour commencer.',
  },

  // ExercisesScreen
  exercises: {
    title: 'Exercices',
    createExercise: '+ CRÉER UN EXERCICE',
    newExercise: 'Nouvel exercice',
    editExercise: "Modifier l'exercice",
    searchPlaceholder: 'Rechercher un exercice...',
    emptyState: 'Aucun exercice disponible.',
    noResults: 'Aucun résultat trouvé.',
    placeholders: {
      exerciseName: 'ex : Développé couché',
    },
    options: {
      edit: "Modifier l'Exercice",
      delete: "Supprimer l'Exercice",
    },
    filters: {
      allMuscles: 'Tous muscles',
      allEquipment: 'Tout équipement',
    },
  },

  // ChartsScreen
  charts: {
    title: 'Progression',
    emptyState: 'Aucune donnée disponible.',
    selectExercise: 'Sélectionnez un exercice pour voir sa progression.',
    filters: {
      allMuscles: 'Tous muscles',
      allEquipment: 'Tout équipement',
    },
  },

  // SettingsScreen
  settings: {
    title: 'Paramètres',
    restTimer: {
      title: 'Minuteur de repos',
      enabled: 'Minuteur activé',
      disabled: 'Minuteur désactivé',
    },
    restDuration: {
      title: 'Durée de repos',
      seconds: 'secondes',
    },
    muscleGroups: {
      title: 'Groupes musculaires',
      add: 'Ajouter un muscle',
      placeholder: 'ex : Quadriceps',
    },
    equipment: {
      title: 'Équipement',
      add: 'Ajouter un équipement',
      placeholder: 'ex : Kettlebell',
    },
    dangerZone: {
      title: 'Zone de danger',
      resetApp: "Réinitialiser l'application",
      resetWarning: 'Supprimer toutes les données',
    },
  },

  // Boutons communs
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    validate: 'Valider',
    close: 'Fermer',
    confirm: 'Confirmer',
  },

  // Alertes de confirmation
  alerts: {
    deleteProgram: {
      title: (name: string) => `Supprimer ${name} ?`,
      message: 'Supprimer ce programme et toutes ses séances ?',
    },
    deleteSession: {
      title: (name: string) => `Supprimer ${name} ?`,
      message: 'Supprimer cette séance ?',
    },
    deleteExercise: {
      title: (name: string) => `Supprimer ${name} ?`,
      message: 'Voulez-vous vraiment retirer cet exercice de cette séance ?',
    },
    deleteExerciseDefinition: {
      title: (name: string) => `Supprimer ${name} ?`,
      message: "Cet exercice sera retiré de toutes les séances qui l'utilisent.",
    },
    deleteMuscle: {
      title: (name: string) => `Supprimer ${name} ?`,
      message: 'Ce muscle sera retiré de tous les exercices.',
    },
    deleteEquipment: {
      title: (name: string) => `Supprimer ${name} ?`,
      message: 'Cet équipement sera retiré de tous les exercices.',
    },
    resetApp: {
      title: "Réinitialiser l'application ?",
      message:
        'Toutes vos données seront supprimées définitivement. Cette action est irréversible.',
    },
  },

  // Toasts / Messages de succès
  toasts: {
    exerciseRemoved: 'Retiré',
    programCreated: 'Programme créé',
    sessionCreated: 'Séance créée',
    exerciseCreated: 'Exercice créé',
    settingsSaved: 'Paramètres enregistrés',
    appReset: 'Application réinitialisée',
  },
} as const
