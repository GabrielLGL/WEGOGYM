<!-- v1.0 — 2026-02-21 -->
# Rapport — fix-bottomsheet-animation — Groupe A — 20260221-0940

## Objectif
Corriger le bug UX où les options du BottomSheet ne sont pas cliquables pendant l'animation d'ouverture. L'utilisateur doit actuellement attendre la fin complète de l'animation spring avant de pouvoir interagir.

## Fichiers concernés
- `mobile/src/components/BottomSheet.tsx`

## Contexte technique

### Cause du bug
L'animation d'ouverture utilise `Animated.spring` avec `bounciness: 4, speed: 12`. Ce spring met 400-600ms à se stabiliser à cause du bouncing. Sur Android avec Fabric (New Architecture), les touches sur une `Animated.View` en cours de déplacement ne sont pas toujours interceptées avant que l'animation soit stabilisée.

### Solution choisie
Remplacer `Animated.spring` par `Animated.timing` avec :
- `duration: 250` ms
- `easing: Easing.out(Easing.cubic)` (fluide, naturel, sans bounce)

Cela permet au sheet d'être cliquable quasi-immédiatement dès son apparition, car `Animated.timing` settle instantanément à la valeur finale (pas d'oscillation).

Le prop `animationSpeed` n'a plus de sens avec timing → le remplacer par `animationDuration?: number` (défaut: 250) pour rester rétrocompatible avec les écrans qui pourraient passer une valeur.

### Contraintes CLAUDE.md
- NO native `<Modal>` — garder le pattern `<Portal>`
- Utiliser `useNativeDriver: true`
- Pas de hardcoded colors
- Pas de `any` TypeScript

## Étapes

1. **Importer `Easing`** depuis `react-native` (ajouter à l'import existant)

2. **Renommer le prop** `animationSpeed?: number` → `animationDuration?: number` (défaut: 250) dans l'interface `BottomSheetProps` et la déstructuration

3. **Remplacer l'animation d'ouverture** : changer `Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: animationSpeed })` par `Animated.timing(slideAnim, { toValue: 0, duration: animationDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true })`

4. **Mettre à jour le commentaire JSDoc** : remplacer `@param animationSpeed - Vitesse de l'animation spring (défaut: 12)` par `@param animationDuration - Durée de l'animation en ms (défaut: 250)`

5. **Vérifier** que les animations de fermeture (`Animated.timing` vers `screenHeight`) ne sont pas affectées (elles utilisent déjà timing, OK)

## Contraintes
- Ne pas casser : la logique `showContent` / `setShowContent` (montage/démontage du portal)
- Ne pas casser : l'animation de fermeture (timing 200ms existante)
- Ne pas casser : le fade de l'overlay (timing 200ms existante)
- Garder : `useNativeDriver: true` sur toutes les animations
- Garder : le pattern Portal de `@gorhom/portal`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test` → zéro fail
- Le BottomSheet s'ouvre en ~250ms sans bounce
- Les options sont cliquables dès le début de l'animation (pas besoin d'attendre la fin)
- Le BottomSheet se ferme normalement (200ms)
- L'overlay s'affiche/disparaît normalement

## Dépendances
Aucune dépendance — groupe unique.

## Statut
✅ Résolu — 20260221-1000

## Résolution
Rapport do : docs/bmad/do/20260221-1000-fix-bottomsheet-animation.md
