# feat(WorkoutExerciseCard) — S03+S04+S05 exercice-list-redesign
Date : 2026-02-26 10:45

## Instruction
docs/bmad/prompts/20260226-0930-brainstorm-implement-A.md

## Rapport source
Description directe (prompt brainstorm-implement-A)

## Classification
Type : feat
Fichiers modifiés : `mobile/src/components/WorkoutExerciseCard.tsx`

## Ce qui a été fait

### S03 — Retrait weightTarget UI (SessionExerciseItem)
Déjà implémenté. `SessionExerciseItem.tsx` n'affiche que `setsTarget` et `repsTarget` dans la `targetRow` — aucune référence visuelle à `weightTarget`. Le champ `weight_target` reste intact en DB et dans les modals d'édition.

### S04 — Redesign WorkoutExerciseCard (animation spring manquante)
Tous les éléments du redesign étaient déjà en place :
- ✅ Toggle ✓ : `validateBtn` (gris) / `validateBtnActive` (vert), même bouton pour valider et dé-valider
- ✅ Objectif sans poids : `Objectif : {setsTarget}×{repsTarget} reps`
- ✅ Dernière perf texte : `Dernière : Moy. X kg × Y reps sur Z séries`
- ✅ Placeholder reps `6-8` en `colors.placeholder`
- ✅ `haptics.onSuccess()` au moment de la validation

**Seul manque** : l'animation `Animated.spring` sur la validation.

**Ajouté dans `WorkoutSetRow`** :
- Import `Animated` depuis `react-native`
- `scaleAnim = React.useRef(new Animated.Value(1)).current` (avant tout return conditionnel)
- Dans `handleValidate` : `Animated.sequence([spring 1→1.25, spring 1.25→1]).start()` avec `useNativeDriver: true`
- Wrap du bouton `✓` dans `Animated.View style={{ transform: [{ scale: scaleAnim }] }}`

### S05 — WorkoutHeader stats
Déjà implémenté. `WorkoutScreen.tsx` passe :
- `totalVolume` depuis `useWorkoutState`
- `completedSets = Object.keys(validatedSets).length`
- `totalSetsTarget`
- Bouton "Terminer" uniquement dans le footer `Animated.View`

## Vérification
- TypeScript : ✅ TSC_EXIT=0 (0 erreur)
- Tests : ✅ 837 passed, 3 failed (HomeScreen pré-existants — "Outils"/"Assistant" sections supprimées de la screen avant ces modifications, sans rapport avec les changements)
- Nouveau test créé : non (tests existants WorkoutExerciseCard.test.tsx couvrent le bouton ✓)

## Documentation mise à jour
Aucune (pas de nouveau composant/hook/pattern)

## Statut
✅ Résolu — 20260226-1045

## Commit
310db86 feat(WorkoutExerciseCard): add Animated.spring on set validation toggle
