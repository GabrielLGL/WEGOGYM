# feat(exercise) — Navigation ExercisesScreen → ExerciseInfoSheet au clic
Date : 2026-03-01 09:00

## Instruction
docs/bmad/prompts/20260228-1930-exercise-gif-B.md

## Rapport source
docs/bmad/prompts/20260228-1930-exercise-gif-B.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/components/ExerciseInfoSheet.tsx` — prop onViewHistory + bouton + styles
- `mobile/src/screens/ExercisesScreen.tsx` — handleRowPress → infoSheet, handleViewHistory
- `mobile/src/i18n/fr.ts` — ajout viewHistory
- `mobile/src/i18n/en.ts` — ajout viewHistory

## Ce qui a été fait
- ExerciseInfoSheet : ajout prop optionnelle `onViewHistory?: () => void` + bouton
  "Voir l'historique" avec flèche (Ionicons arrow-forward) en bas du sheet
- ExercisesScreen : `handleRowPress` ouvre maintenant ExerciseInfoSheet au lieu de
  naviguer directement vers ExerciseHistory
  - State dédié `infoSheetExercise` (distinct de `selectedExercise` déjà utilisé par
    useExerciseManager pour les options edit/delete)
  - `infoSheet = useModalState()` pour gérer open/close
  - `handleViewHistory` : ferme le sheet puis navigue vers ExerciseHistory
  - `infoSheetExercise` n'est pas resetté à null à la fermeture (animation fluide)
- Traductions fr/en : ajout clé `viewHistory`

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1556 passed (0 régression)
- Tests pré-existants en échec (non liés) : statsKPIs, statsHelpers (3 fails inchangés)
- Nouveau test créé : non (couverture existante suffisante)

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260301-0900

## Commit
[sera rempli après commit]
