# Tache P — Split WorkoutSummarySheet (895 lignes) — 20260319-2300

## Objectif
Decomposer `WorkoutSummarySheet.tsx` (895 lignes, le plus gros composant) en sous-composants pour ameliorer la lisibilite et la maintenabilite.

## Fichier principal
- `mobile/src/components/WorkoutSummarySheet.tsx`

## Sous-composants a extraire

### 1. `SummaryHeader.tsx`
La section header avec le titre, la duree, le volume total, les stats globales (sets, exercices, PRs).
Environ lignes 220-280.

### 2. `SummaryExerciseList.tsx`
La FlatList/ScrollView qui liste chaque exercice avec ses sets valides.
Environ lignes 280-380.

### 3. `SummaryShareSection.tsx`
Les boutons de partage (texte, image) et la logique de capture ViewShot.
Environ lignes 380-450.

### 4. `SummaryActions.tsx`
Les boutons d'action en bas (Terminer, Abandonner, etc.).

## Contexte technique

### Pattern a suivre
```tsx
// Nouveau fichier : components/workout-summary/SummaryHeader.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'

interface SummaryHeaderProps {
  duration: number
  totalVolume: number
  totalSets: number
  exerciseCount: number
  prCount: number
}

export const SummaryHeader = React.memo(function SummaryHeader({
  duration, totalVolume, totalSets, exerciseCount, prCount
}: SummaryHeaderProps) {
  const colors = useColors()
  const { t } = useLanguage()
  // ... JSX extrait de WorkoutSummarySheet
})
```

### Regles
- Chaque sous-composant est un `React.memo` (performance)
- Les props doivent etre des valeurs primitives ou des objets stables (pas de creation inline)
- Le composant parent `WorkoutSummarySheet` orchestre et passe les props
- NE PAS deplacer la logique de share/ViewShot hors du parent (elle depend de refs)

### Structure de fichiers
```
mobile/src/components/
├── WorkoutSummarySheet.tsx          ← reste l'orchestrateur (~200 lignes)
└── workout-summary/
    ├── SummaryHeader.tsx
    ├── SummaryExerciseList.tsx
    ├── SummaryShareSection.tsx
    └── SummaryActions.tsx
```

## Etapes
1. Lire `WorkoutSummarySheet.tsx` en entier
2. Identifier les sections visuelles distinctes
3. Creer le dossier `workout-summary/`
4. Extraire chaque section dans son fichier
5. Ajouter `React.memo` + props typees
6. Mettre a jour `WorkoutSummarySheet.tsx` pour importer les sous-composants
7. `npx tsc --noEmit` → 0 erreur
8. `npm test` → 0 fail

## Contraintes
- NE PAS modifier la logique metier (calculs, DB writes)
- NE PAS modifier le style visuel
- NE PAS toucher aux autres fichiers (WorkoutScreen, etc.)
- Garder les refs (viewShotRef, etc.) dans le parent
- Si un sous-composant necessite une ref, la passer via `forwardRef`

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- `WorkoutSummarySheet.tsx` reduit a ~200-300 lignes
- Chaque sous-composant est un `React.memo`

## Dependances
Aucune.

## Statut
⏳ En attente
