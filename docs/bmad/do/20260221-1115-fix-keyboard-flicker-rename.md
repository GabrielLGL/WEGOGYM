# FIX(HomeScreen) — Keyboard flickering lors du renommage

Date : 2026-02-21 11:15

## Instruction
docs/bmad/prompts/20260221-1106-keyboard-flicker-rename-A.md

## Rapport source
docs/bmad/prompts/20260221-1106-keyboard-flicker-rename-A.md

## Classification
Type : fix
Fichiers modifiés :
- `mobile/src/screens/HomeScreen.tsx`

## Ce qui a été fait
1. Ajouté `InteractionManager` à l'import `react-native` existant (ligne 2).
2. Corrigé le handler "Renommer le Programme" (ex-ligne 284) :
   - `prepareRenameProgram` appelé AVANT `setIsOptionsVisible(false)`
   - `setIsProgramModalVisible(true)` différé via `InteractionManager.runAfterInteractions()`
   → Le CustomModal n'ouvre plus pendant l'animation de fermeture du BottomSheet
3. Corrigé le handler "Renommer la Séance" (ex-ligne 301) — même pattern :
   - `prepareRenameSession` appelé AVANT `setIsSessionOptionsVisible(false)`
   - `setIsSessionModalVisible(true)` différé via `InteractionManager.runAfterInteractions()`

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 8 passed
- Nouveau test créé : non (comportement UI/animation, couvert par tests existants)

## Documentation mise à jour
Aucune (pattern déjà documenté dans CLAUDE.md — pas de setTimeout sans cleanup → InteractionManager)

## Statut
✅ Résolu — 20260221-1115

## Commit
[sera rempli à l'étape 7]
