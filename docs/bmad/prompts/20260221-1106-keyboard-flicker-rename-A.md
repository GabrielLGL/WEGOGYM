<!-- v1.0 — 2026-02-21 -->
# Rapport — keyboard-flicker-rename — Groupe A — 20260221-1106

## Objectif
Corriger le flickering du clavier lors du renommage d'un programme.
Quand l'utilisateur tape "Renommer le Programme" dans le BottomSheet options,
le clavier s'ouvre, se ferme, puis se rouvre — mauvaise UX.

## Cause racine
Dans `HomeScreen.tsx:284`, les 3 états sont changés simultanément :
```tsx
onPress={() => {
  setIsOptionsVisible(false);        // BottomSheet démarre animation fermeture (200ms)
  prepareRenameProgram(selectedProgram)
  setIsProgramModalVisible(true)     // CustomModal ouvre IMMÉDIATEMENT avec autoFocus
}}
```
Le BottomSheet (`BottomSheet.tsx:72-83`) a une animation de fermeture de 200ms.
Pendant que cette animation tourne, CustomModal s'ouvre avec `autoFocus={true}` sur le TextInput.
Sur Android, le layout shift causé par l'animation du BottomSheet encore en cours
fait dismisser le clavier, puis `autoFocus` le rouvre → flickering.

## Fichiers concernés
- `mobile/src/screens/HomeScreen.tsx` — ligne 284 (handler onPress "Renommer le Programme")

## Contexte technique
- `BottomSheet.tsx` animation de fermeture : 200ms slide + 150ms fade (`animationDuration` param, défaut 250ms)
- `CustomModal.tsx` : utilise `autoFocus` sur le TextInput enfant (HomeScreen.tsx:253)
- `useMultiModalSync` track `isOptionsVisible` et `isProgramModalVisible` → peut causer un re-render tab bar
- La même séquence existe pour les Sessions (ligne 301) → corriger aussi

## Étapes

### 1. Importer InteractionManager
Dans `HomeScreen.tsx`, ajouter `InteractionManager` à l'import react-native existant.

### 2. Corriger le handler "Renommer le Programme" (ligne 284)
Remplacer :
```tsx
onPress={() => { setIsOptionsVisible(false); if (selectedProgram) prepareRenameProgram(selectedProgram); setIsProgramModalVisible(true) }}
```
Par :
```tsx
onPress={() => {
  if (selectedProgram) prepareRenameProgram(selectedProgram)
  setIsOptionsVisible(false)
  InteractionManager.runAfterInteractions(() => {
    setIsProgramModalVisible(true)
  })
}}
```
Note : `prepareRenameProgram` est appelé AVANT `setIsOptionsVisible(false)` pour
éviter que le BottomSheet disparaisse avant que l'état soit prêt.

### 3. Corriger le handler "Renommer la Séance" (ligne 301) — même bug
Remplacer :
```tsx
onPress={() => { setIsSessionOptionsVisible(false); if (selectedSession) prepareRenameSession(selectedSession); setIsSessionModalVisible(true) }}
```
Par :
```tsx
onPress={() => {
  if (selectedSession) prepareRenameSession(selectedSession)
  setIsSessionOptionsVisible(false)
  InteractionManager.runAfterInteractions(() => {
    setIsSessionModalVisible(true)
  })
}}
```

### 4. Vérification TypeScript
```bash
cd mobile && npx tsc --noEmit
```

## Contraintes
- Ne pas modifier `CustomModal.tsx` ni `BottomSheet.tsx`
- Ne pas supprimer `autoFocus` du TextInput (c'est le comportement voulu)
- Respecter le pattern : pas de `any`, pas de hardcoded colors
- `InteractionManager` est importé depuis `react-native` (déjà une dépendance)
- CLAUDE.md : pas de setTimeout sans cleanup → utiliser InteractionManager à la place

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Comportement attendu : quand on tape "Renommer", le clavier apparaît UNE SEULE FOIS
  après que le BottomSheet a fini de se fermer
- Idem pour "Renommer la Séance"

## Dépendances
Aucune dépendance inter-groupes. Seul groupe.

## Statut
⏳ En attente
