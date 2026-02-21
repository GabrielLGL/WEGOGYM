<!-- v1.0 — 2026-02-21 -->
# Rapport — back-button-bottomsheet — Groupe A — 20260221-1800

## Objectif
Quand le bouton retour Android est pressé et qu'un `BottomSheet` est visible, fermer le bottom sheet (appeler `onClose()`) — exactement comme quand l'utilisateur appuie en dehors.

## Fichiers concernés
- `mobile/src/components/BottomSheet.tsx`

## Contexte technique
- `BottomSheet.tsx` utilise `<Portal>` de `@gorhom/portal` (jamais de `<Modal>` natif — contrainte Fabric)
- Il dispose déjà d'un `TouchableWithoutFeedback` sur l'overlay qui appelle `onClose()`
- Sur Android, le bouton retour doit avoir le même effet que taper sur l'overlay
- React Native expose `BackHandler` (dans 'react-native') pour intercepter le bouton retour Android
- `BackHandler.addEventListener` retourne un objet avec `.remove()` — toujours l'appeler en cleanup (cf. Known Pitfalls : "Every subscribe/observe MUST have an unsubscribe")

## Étapes
1. Ajouter `BackHandler` aux imports depuis 'react-native' (déjà : View, Text, StyleSheet, TouchableWithoutFeedback, Animated, Easing, Dimensions)
2. Ajouter un `useEffect` qui :
   - Si `visible === true` : enregistre un handler `BackHandler.addEventListener('hardwareBackPress', handler)` où `handler` appelle `onClose()` et retourne `true` (empêche le comportement par défaut)
   - Retourne un cleanup qui appelle `subscription.remove()`
   - Si `visible === false` : ne rien enregistrer (ou cleanup immédiat)
3. Dépendances du useEffect : `[visible, onClose]`

## Code attendu
```typescript
useEffect(() => {
  if (!visible) return
  const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
    onClose()
    return true
  })
  return () => subscription.remove()
}, [visible, onClose])
```

## Contraintes
- Ne pas casser : animation slide-up/down existante, overlay tap, titre, Portal
- Ne pas modifier l'interface `BottomSheetProps`
- Respecter : colors.*, spacing.*, borderRadius.* du theme (ne pas toucher aux styles)
- Pas de `console.log` sans guard `__DEV__`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur (dans `mobile/`)
- `npm test` → zéro fail
- Sur Android : back button pendant qu'un bottom sheet est ouvert → le ferme avec animation
- Taper sur l'overlay → comportement identique (non cassé)
- Back button quand bottom sheet fermé → comportement système normal (non intercepté)

## Dépendances
Aucune dépendance sur d'autres groupes.

## Statut
✅ Résolu — 20260221-1800

## Résolution
Rapport do : docs/bmad/do/20260221-1800-fix-back-button-bottomsheet.md
