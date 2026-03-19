# Tache G — Accessibilite ecran Workout — 20260319-1900

## Objectif
Ajouter les labels d'accessibilite aux composants du workout live : inputs poids/reps, bouton valider, header, superset badges. Actuellement 0% de couverture a11y sur l'ecran le plus utilise.

## Fichiers a modifier
- `mobile/src/components/WorkoutExerciseCard.tsx` — inputs + boutons valider/devalider
- `mobile/src/components/WorkoutSupersetBlock.tsx` — letter badges + header
- `mobile/src/components/WorkoutHeader.tsx` — timer, volume, sets counter
- `mobile/src/components/WorkoutSummarySheet.tsx` — recap post-workout
- `mobile/src/components/RestTimer.tsx` — timer de repos + bouton skip

## Fichiers i18n (si les cles n'existent pas deja)
- `mobile/src/i18n/fr.ts` — section `accessibility` (peut deja exister, completer)
- `mobile/src/i18n/en.ts` — idem

## Contexte technique

### Cles i18n a ajouter/completer dans `accessibility`

```typescript
// Dans la section accessibility existante, ajouter :
weightInput: 'Poids en kilogrammes',
repsInput: 'Nombre de repetitions',
validateSet: 'Valider la serie',
unvalidateSet: 'Annuler la serie',
exerciseInSuperset: 'Exercice du superset',
exerciseInCircuit: 'Exercice du circuit',
restTimer: 'Timer de repos',
skipTimer: 'Passer le timer',
workoutTimer: 'Temps ecoule',
totalVolume: 'Volume total',
completedSets: 'Series completees',
workoutSummary: 'Resume de la seance',
```

### Patterns a suivre

**TextInput :**
```tsx
<TextInput
  accessibilityLabel={`${t.accessibility.weightInput}, serie ${setOrder}`}
  accessibilityHint="Entrez le poids"
  keyboardType="numeric"
/>
```

**Bouton valider :**
```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`${t.accessibility.validateSet} ${setOrder}`}
  accessibilityState={{ disabled: isValidated }}
>
```

**Superset letter badge :**
```tsx
<View
  accessibilityLabel={`${t.accessibility.exerciseInSuperset} ${letter}`}
>
```

**WorkoutHeader :**
```tsx
<Text accessibilityRole="timer" accessibilityLabel={`${t.accessibility.workoutTimer}: ${formattedTime}`}>
<Text accessibilityLabel={`${t.accessibility.totalVolume}: ${totalVolume} kg`}>
<Text accessibilityLabel={`${t.accessibility.completedSets}: ${completedSets} sur ${totalSetsTarget}`}>
```

**RestTimer :**
```tsx
// Timer display
accessibilityRole="timer"
accessibilityLabel={`${t.accessibility.restTimer}: ${remainingSeconds} secondes`}
accessibilityLiveRegion="polite"

// Skip button
accessibilityRole="button"
accessibilityLabel={t.accessibility.skipTimer}
```

## Etapes
1. Lire chaque fichier pour comprendre la structure
2. Completer la section `accessibility` dans fr.ts et en.ts
3. Ajouter les labels a chaque element interactif
4. `npx tsc --noEmit` → 0 erreur
5. `npm test` → 0 fail

## Contraintes
- NE PAS modifier WorkoutScreen.tsx (deja touche)
- NE PAS modifier la logique metier ou le layout
- NE PAS modifier Button.tsx, AlertDialog.tsx, BottomSheet.tsx (deja faits)
- Labels i18n, pas hardcodes

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Tous les TextInput du workout ont un accessibilityLabel
- Tous les boutons valider/devalider ont un role + label
- WorkoutHeader a des labels sur les 3 KPIs

## Dependances
Aucune — independant.

## Statut
✅ Résolu
