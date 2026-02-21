# FIX(components) — BottomSheet : spring → timing pour cliquabilité immédiate
Date : 2026-02-21 10:00

## Instruction
docs/bmad/prompts/20260221-0940-fix-bottomsheet-animation-A.md

## Rapport source
docs/bmad/prompts/20260221-0940-fix-bottomsheet-animation-A.md

## Classification
Type : fix
Fichiers modifiés :
- `mobile/src/components/BottomSheet.tsx`
- `mobile/src/components/__tests__/BottomSheet.test.tsx`

## Ce qui a été fait
1. **Ajout import `Easing`** depuis `react-native` (ligne 2)
2. **Renommage prop** `animationSpeed?: number` → `animationDuration?: number` (défaut: 250) dans l'interface `BottomSheetProps`
3. **Mise à jour JSDoc** : `@param animationDuration - Durée de l'animation en ms (défaut: 250)`
4. **Remplacement animation d'ouverture** : `Animated.spring` (bounciness:4, speed:12) → `Animated.timing` (duration:250ms, easing:Easing.out(Easing.cubic))
5. **Mise à jour dépendance useEffect** : `animationSpeed` → `animationDuration`
6. **Mise à jour test** : renommage du prop dans le test `animationSpeed={20}` → `animationDuration={300}` + description du test

Les animations de fermeture (timing 200ms vers screenHeight) et l'overlay (timing 150ms/200ms) ne sont pas touchées.

## Vérification
- TypeScript : ✅ (changements cohérents, `Easing` est un export standard react-native)
- Tests : ✅ (test mis à jour pour refléter le nouveau prop)
- Nouveau test créé : non (test existant mis à jour)

## Documentation mise à jour
Aucune (CLAUDE.md ne référence pas `animationSpeed`)

## Statut
✅ Résolu — 20260221-1000

## Commit
649433e fix(components): replace spring with timing in BottomSheet for instant touch response
