<!-- v1.0 — 2026-03-11 -->
# Rapport — Progression automatique — Groupe B (UI) — 20260311-2000

## Objectif
Ajouter un indicateur visuel dans les lignes de sets pour signaler que les inputs ont été
pré-remplis avec la progression suggérée (et non la dernière session brute).

**Contexte :** Après le Groupe A, `useWorkoutState` expose `suggestedExerciseIds: Set<string>`.
Le Groupe B doit utiliser cette info pour afficher un badge/label discret sur les sets concernés.

**Comportement cible :**
- Si les inputs d'un exercice viennent de la suggestion → afficher un petit badge "↑ Progression" en vert
  dans l'en-tête de l'exercice (ou près du label "Suggestion")
- Le texte "Suggestion: +2.5 kg" existant peut être retiré ou fusionné avec le badge
- Sur les sets individuels, aucun changement nécessaire (les inputs sont déjà pré-remplis)

## Fichiers concernés
- `mobile/src/components/WorkoutExerciseCard.tsx` — composant principal exercice
- `mobile/src/components/WorkoutSupersetBlock.tsx` — groupes superset/circuit
- `mobile/src/screens/WorkoutScreen.tsx` — pour passer `suggestedExerciseIds` aux composants

## Contexte technique

### Stack
- React Native + Expo 52, Fabric (New Arch), TypeScript strict
- Portal pattern pour modals — jamais `<Modal>` natif
- Theme : utiliser `colors.*` de `theme/index.ts` et `useColors()` hook
- i18n : utiliser `useLanguage()` → `t('clé')` pour tout texte affiché

### Interface actuelle WorkoutExerciseCard (props à étendre)
```typescript
interface WorkoutExerciseCardProps {
  // ... props existantes
  // À AJOUTER :
  isProgressionApplied?: boolean  // true si inputs viennent de la suggestion
}
```

### Clés i18n à ajouter (fr.ts ET en.ts)
```typescript
// fr.ts
progressionApplied: '↑ Progression appliquée'
// en.ts
progressionApplied: '↑ Progression applied'
```

### Style du badge
- Couleur : `colors.primary` avec opacity 0.15 pour le fond, `colors.primary` pour le texte
- Position : inline avec le label "Suggestion" existant
- Taille : `fontSize.caption` (11px), padding xs
- Remplacer le texte "Suggestion: +1 rep" par le badge + les valeurs suggérées

### Passage des données depuis WorkoutScreen
```typescript
// WorkoutScreen passe suggestedExerciseIds à WorkoutExerciseCard :
<WorkoutExerciseCard
  // ... props existantes
  isProgressionApplied={suggestedExerciseIds.has(sessionExercise.exerciseId)}
/>
```

## Étapes
1. Lire `WorkoutExerciseCard.tsx` entièrement
2. Lire `WorkoutSupersetBlock.tsx` entièrement
3. Ajouter les clés i18n `progressionApplied` dans `fr.ts` et `en.ts`
4. Modifier `WorkoutExerciseCard` :
   - Ajouter prop `isProgressionApplied?: boolean`
   - Si `isProgressionApplied` → remplacer/enrichir le label "Suggestion" avec badge visuel
5. Modifier `WorkoutSupersetBlock` de même
6. Modifier `WorkoutScreen` pour passer `isProgressionApplied` depuis `suggestedExerciseIds`
7. Vérifier les styles : uniquement `colors.*`, `spacing.*`, `fontSize.*` du theme

## Contraintes
- Ne pas casser : logique de validation, timers, superset logic
- Respecter : pas de couleurs hardcodées, `useColors()` obligatoire, textes via `t()`
- Aucune nouvelle dépendance npm
- Composants fonctionnels uniquement

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Visuel : badge "↑ Progression appliquée" visible sur exercices avec repsTarget + lastPerf
- Visuel : aucun badge sur exercices sans repsTarget (comportement inchangé)
- Dark/Light mode : badge lisible dans les deux thèmes

## Dépendances
Ce groupe dépend du Groupe A (qui expose `suggestedExerciseIds` depuis `useWorkoutState`).
Lancer APRÈS le Groupe A.

## Statut
⏳ En attente
