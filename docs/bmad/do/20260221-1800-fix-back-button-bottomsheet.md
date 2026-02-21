# fix(BottomSheet) — back button Android ferme le sheet
Date : 2026-02-21 18:00

## Instruction
docs/bmad/prompts/20260221-1800-back-button-bottomsheet-A.md

## Rapport source
docs/bmad/prompts/20260221-1800-back-button-bottomsheet-A.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/components/BottomSheet.tsx
- mobile/src/components/__tests__/BottomSheet.test.tsx

## Ce qui a été fait
- Ajout de `BackHandler` aux imports depuis 'react-native' dans `BottomSheet.tsx`
- Ajout d'un `useEffect` qui enregistre `BackHandler.addEventListener('hardwareBackPress', ...)` quand `visible=true` — appelle `onClose()` et retourne `true` pour intercepter l'event
- Cleanup via `subscription.remove()` dans le return du useEffect (respecte Known Pitfalls)
- Le handler n'est PAS enregistré quand `visible=false` (early return)
- 2 nouveaux tests ajoutés dans `BottomSheet.test.tsx` via `jest.spyOn(BackHandler, 'addEventListener')`

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 9 passed (dont 2 nouveaux BackHandler)
- Nouveau test créé : oui

## Documentation mise à jour
aucune (changement interne au composant, interface BottomSheetProps non modifiée)

## Statut
✅ Résolu — 20260221-1800

## Commit
[sera rempli après push]
