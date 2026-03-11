export type BadgeCategory =
  | 'sessions'
  | 'tonnage'
  | 'streak'
  | 'level'
  | 'pr'
  | 'session_volume'
  | 'exercises'

export interface BadgeDefinition {
  id: string
  icon: string
  category: BadgeCategory
  threshold: number
}

export const BADGES_LIST: BadgeDefinition[] = [
  // -- Seances --
  { id: 'sessions_1',    category: 'sessions', icon: 'barbell-outline', threshold: 1    },
  { id: 'sessions_5',    category: 'sessions', icon: 'star-outline',    threshold: 5    },
  { id: 'sessions_10',   category: 'sessions', icon: 'fitness-outline', threshold: 10   },
  { id: 'sessions_25',   category: 'sessions', icon: 'flame-outline',   threshold: 25   },
  { id: 'sessions_50',   category: 'sessions', icon: 'star',            threshold: 50   },
  { id: 'sessions_100',  category: 'sessions', icon: 'trophy-outline',  threshold: 100  },
  { id: 'sessions_250',  category: 'sessions', icon: 'ribbon-outline',  threshold: 250  },
  { id: 'sessions_500',  category: 'sessions', icon: 'person-outline',  threshold: 500  },
  { id: 'sessions_1000', category: 'sessions', icon: 'planet-outline',  threshold: 1000 },

  // -- Volume total (en kg) --
  { id: 'tonnage_1',    category: 'tonnage', icon: 'settings-outline',  threshold: 1_000     },
  { id: 'tonnage_5',    category: 'tonnage', icon: 'construct-outline', threshold: 5_000     },
  { id: 'tonnage_10',   category: 'tonnage', icon: 'hammer-outline',    threshold: 10_000    },
  { id: 'tonnage_25',   category: 'tonnage', icon: 'car-sport-outline', threshold: 25_000    },
  { id: 'tonnage_50',   category: 'tonnage', icon: 'car-outline',       threshold: 50_000    },
  { id: 'tonnage_100',  category: 'tonnage', icon: 'home-outline',      threshold: 100_000   },
  { id: 'tonnage_250',  category: 'tonnage', icon: 'business-outline',  threshold: 250_000   },
  { id: 'tonnage_500',  category: 'tonnage', icon: 'airplane-outline',  threshold: 500_000   },
  { id: 'tonnage_1000', category: 'tonnage', icon: 'rocket-outline',    threshold: 1_000_000 },

  // -- Regularite — best_streak (semaines) --
  { id: 'streak_2',  category: 'streak', icon: 'leaf-outline',    threshold: 2  },
  { id: 'streak_4',  category: 'streak', icon: 'leaf',            threshold: 4  },
  { id: 'streak_8',  category: 'streak', icon: 'link-outline',    threshold: 8  },
  { id: 'streak_12', category: 'streak', icon: 'shield-outline',  threshold: 12 },
  { id: 'streak_16', category: 'streak', icon: 'flash-outline',   threshold: 16 },
  { id: 'streak_20', category: 'streak', icon: 'diamond-outline', threshold: 20 },
  { id: 'streak_30', category: 'streak', icon: 'water-outline',   threshold: 30 },
  { id: 'streak_52', category: 'streak', icon: 'medal-outline',   threshold: 52 },

  // -- Niveau XP --
  { id: 'level_2',  category: 'level', icon: 'chevron-up-outline',  threshold: 2  },
  { id: 'level_5',  category: 'level', icon: 'navigate-outline',    threshold: 5  },
  { id: 'level_10', category: 'level', icon: 'trending-up-outline', threshold: 10 },
  { id: 'level_15', category: 'level', icon: 'cut-outline',         threshold: 15 },
  { id: 'level_20', category: 'level', icon: 'key-outline',         threshold: 20 },
  { id: 'level_25', category: 'level', icon: 'trophy',              threshold: 25 },
  { id: 'level_35', category: 'level', icon: 'sparkles-outline',    threshold: 35 },
  { id: 'level_50', category: 'level', icon: 'star',                threshold: 50 },
  { id: 'level_75', category: 'level', icon: 'eye-outline',         threshold: 75 },

  // -- Records Personnels — total_prs --
  { id: 'pr_1',   category: 'pr', icon: 'navigate-circle-outline',  threshold: 1   },
  { id: 'pr_5',   category: 'pr', icon: 'trending-up-outline',      threshold: 5   },
  { id: 'pr_10',  category: 'pr', icon: 'arrow-up-circle-outline',  threshold: 10  },
  { id: 'pr_25',  category: 'pr', icon: 'flash',                    threshold: 25  },
  { id: 'pr_50',  category: 'pr', icon: 'barbell',                  threshold: 50  },
  { id: 'pr_100', category: 'pr', icon: 'flame',                    threshold: 100 },

  // -- Volume par seance (en kg) --
  { id: 'session_vol_200',  category: 'session_volume', icon: 'water-outline',   threshold: 200   },
  { id: 'session_vol_500',  category: 'session_volume', icon: 'pulse-outline',   threshold: 500   },
  { id: 'session_vol_1000', category: 'session_volume', icon: 'flash-outline',   threshold: 1_000 },
  { id: 'session_vol_2000', category: 'session_volume', icon: 'flame-outline',   threshold: 2_000 },
  { id: 'session_vol_5000', category: 'session_volume', icon: 'nuclear-outline', threshold: 5_000 },

  // -- Exercices distincts pratiques --
  { id: 'exercises_5',  category: 'exercises', icon: 'apps-outline',  threshold: 5  },
  { id: 'exercises_10', category: 'exercises', icon: 'book-outline',  threshold: 10 },
  { id: 'exercises_20', category: 'exercises', icon: 'map-outline',   threshold: 20 },
  { id: 'exercises_30', category: 'exercises', icon: 'flask-outline', threshold: 30 },
]
