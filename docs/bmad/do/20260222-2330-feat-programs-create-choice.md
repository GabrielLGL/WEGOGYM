# feat(programs) — BottomSheet choix Soi-même / Automatique
Date : 2026-02-22 23:30

## Instruction
docs/bmad/prompts/20260222-1430-simplify-outils-B.md

## Rapport source
docs/bmad/prompts/20260222-1430-simplify-outils-B.md

## Classification
Type : feat
Fichiers modifiés : mobile/src/screens/ProgramsScreen.tsx

## Ce qui a été fait
- Ajout de l'état `isCreateChoiceVisible` pour contrôler le BottomSheet de choix
- Le bouton "Créer un Programme" ouvre maintenant un BottomSheet avec 2 options au lieu du modal de saisie directement
- Option "Soi-même" (icone crayon) : ferme le BottomSheet, reset les états de renommage, ouvre le modal de saisie du nom (comportement identique à avant)
- Option "Automatique" (icone sparkles) : ferme le BottomSheet, navigue vers l'écran Assistant
- Intégration du BackHandler Android pour fermer le BottomSheet avec le bouton retour
- Haptics `onPress()` sur chaque option du BottomSheet
- Réutilisation des styles existants (`sheetOption`, `sheetOptionIcon`, `sheetOptionText`)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 840 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260222-2330

## Commit
f658c9a feat(programs): add create choice BottomSheet (Soi-même / Automatique)
