<!-- v1.0 — 2026-02-22 -->
# Rapport — Supprimer Tab Bar — Groupe C — 20260222-2300

## Objectif
Nettoyer les hooks `useModalState` et `useMultiModalSync` pour retirer la logique de synchronisation avec la tab bar (qui n'existe plus). Mettre a jour tous les ecrans qui importent `useMultiModalSync`.

## Fichiers concernes
- `mobile/src/hooks/useModalState.ts`
- `mobile/src/hooks/__tests__/useModalState.test.ts`
- `mobile/src/screens/ProgramsScreen.tsx` (import useMultiModalSync)
- `mobile/src/screens/ExercisesScreen.tsx` (import useMultiModalSync)
- `mobile/src/screens/AssistantScreen.tsx` (import useMultiModalSync ou useModalState)
- `mobile/src/screens/ChartsScreen.tsx` (import useMultiModalSync ou useModalState)
- `mobile/src/screens/WorkoutScreen.tsx` (import useMultiModalSync ou useModalState)
- `mobile/src/screens/SessionDetailScreen.tsx` (import useMultiModalSync ou useModalState)
- `mobile/src/screens/StatsMeasurementsScreen.tsx` (import useMultiModalSync ou useModalState)
- `mobile/src/screens/__tests__/SessionDetailScreen.test.tsx`
- `mobile/src/screens/__tests__/WorkoutScreen.test.tsx`

## Contexte technique
- `useModalState` emet `HIDE_TAB_BAR`/`SHOW_TAB_BAR` via `DeviceEventEmitter` quand un modal s'ouvre/ferme.
- `useMultiModalSync` fait pareil mais pour un tableau de booleans.
- Ces events etaient ecoutes par le `TabNavigator` pour masquer/afficher la tab bar.
- Sans tab bar, ces events ne servent plus a rien.
- `useModalState` reste utile pour sa gestion d'etat modal (open/close/toggle) — garder cette partie.
- `useMultiModalSync` n'a plus aucun role — le supprimer entierement.

## Etapes

### 1. Simplifier useModalState (hooks/useModalState.ts)
Remplacer le contenu du fichier par :
```typescript
import { useState } from 'react'

/**
 * Hook pour gerer l'etat d'un modal.
 *
 * @example
 * const addModal = useModalState()
 *
 * // Ouvrir un modal
 * <Button onPress={addModal.open} />
 *
 * // Afficher le modal
 * {addModal.isOpen && <View>...</View>}
 *
 * // Fermer le modal
 * <Button onPress={addModal.close} />
 */
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}
```
- Retirer `useEffect` et `DeviceEventEmitter` import
- Supprimer la fonction `useMultiModalSync` entierement
- Ne plus exporter `useMultiModalSync`

### 2. Supprimer les imports useMultiModalSync dans chaque ecran
Pour chaque fichier qui importe `useMultiModalSync` :
- Retirer `useMultiModalSync` de l'import `from '../hooks/useModalState'`
- Retirer l'appel `useMultiModalSync([...])` dans le composant
- Si l'import ne contient plus rien (ni useModalState ni useMultiModalSync), supprimer la ligne d'import entierement
- Si le fichier importe aussi `useModalState`, garder seulement cet import

**Fichiers a verifier et modifier :**

a) `ProgramsScreen.tsx` :
   - Ligne ~23 : `import { useMultiModalSync } from '../hooks/useModalState'`
   - Trouver et supprimer l'appel `useMultiModalSync([...])` dans le composant
   - Garder les autres hooks/imports intacts

b) `ExercisesScreen.tsx` :
   - Meme pattern : retirer import + appel

c) `AssistantScreen.tsx` :
   - Verifier si c'est useMultiModalSync ou useModalState
   - Retirer uniquement ce qui est lie a la tab bar

d) `ChartsScreen.tsx` :
   - Idem

e) `WorkoutScreen.tsx` :
   - Idem

f) `SessionDetailScreen.tsx` :
   - Idem

g) `StatsMeasurementsScreen.tsx` :
   - Idem

### 3. Mettre a jour les tests
- `hooks/__tests__/useModalState.test.ts` : Retirer les tests lies a `HIDE_TAB_BAR`/`SHOW_TAB_BAR` et `useMultiModalSync`
- `screens/__tests__/SessionDetailScreen.test.tsx` : Retirer les mocks de `HIDE_TAB_BAR`/`SHOW_TAB_BAR` si presents
- `screens/__tests__/WorkoutScreen.test.tsx` : Idem

### 4. Verifier qu'aucun autre fichier ne reference ces events
Chercher dans tout le codebase :
- `HIDE_TAB_BAR` → ne doit plus apparaitre nulle part
- `SHOW_TAB_BAR` → ne doit plus apparaitre nulle part
- `useMultiModalSync` → ne doit plus apparaitre nulle part

## Contraintes
- Ne pas casser la fonctionnalite modale des ecrans (les modals doivent toujours s'ouvrir/fermer)
- `useModalState` doit rester fonctionnel (juste sans les events tab bar)
- Ne pas toucher au layout ou a la logique metier des ecrans
- Respecter : pas de `any`, cleanup des imports inutilises

## Criteres de validation
- `npx tsc --noEmit` → zero erreur
- `npm test` → zero fail
- Aucune reference a `HIDE_TAB_BAR`, `SHOW_TAB_BAR`, `useMultiModalSync` dans le codebase
- Les modals de tous les ecrans fonctionnent toujours correctement
- Grep global : `grep -r "HIDE_TAB_BAR\|SHOW_TAB_BAR\|useMultiModalSync" mobile/src/` → aucun resultat

## Dependances
Peut etre lance en **PARALLELE** avec le Groupe A.
Les events emis par ces hooks ne sont plus ecoutes (TabNavigator supprime par Groupe A), mais le code compile meme sans Groupe A — il emet juste des events dans le vide.
Idealement, lancer apres le Groupe A pour eviter des warnings temporaires.

## Statut
⏳ En attente
