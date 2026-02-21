# Rapport — Quality fixes : AlertDialog import + ChartsScreen RGB — 2026-02-21

## Problème

2 problèmes de qualité identifiés dans le scan verrif 20260221-0240, non corrigés
(classés niveau 3 / qualité, hors périmètre FIX-N1).

Score santé impacté : Qualité 15/20 (au lieu de 20/20).

## Fichiers concernés

- `mobile/src/components/AlertDialog.tsx`
- `mobile/src/screens/ChartsScreen.tsx`

## Corrections à appliquer

### 1. AlertDialog.tsx:6 — Import `useModalState` inutilisé

Supprimer l'import `useModalState` qui n'est jamais référencé dans le fichier.

```ts
// Supprimer cette ligne (ou retirer useModalState de l'import existant) :
import { useModalState } from '../hooks/useModalState'
```

### 2. ChartsScreen.tsx:277-278 — Colors rgba hardcodées (contrainte chart lib)

Les couleurs dynamiques (opacity variable) ne peuvent pas utiliser un token fixe,
mais les valeurs RGB doivent être extraites en constantes nommées en haut du fichier :

```ts
// Ajouter en haut de ChartsScreen.tsx (après les imports, avant le composant) :
const PRIMARY_RGB = '0, 122, 255'   // = colors.primary
const TEXT_RGB    = '255, 255, 255' // = colors.text

// Remplacer les lignes 277-278 :
// Avant : `rgba(0, 122, 255, ${opacity})`
// Après : `rgba(${PRIMARY_RGB}, ${opacity})`
// Avant : `rgba(255, 255, 255, ${opacity})`
// Après : `rgba(${TEXT_RGB}, ${opacity})`
```

## Commande à lancer

/do docs/bmad/morning/20260221-0831-fix-quality-alertdialog-chartsscreen.md

## Contexte

- Rapport source : `docs/bmad/verrif/qualite-20260221-0240.md` (problèmes #1 et #2)
- CLAUDE.md : "No hardcoded colors — always use colors.* from theme/index.ts"
- Pour ChartsScreen : les rgba dynamiques (opacity = 1) de la lib chart NÉCESSITENT
  des strings interpolées → on ne peut pas utiliser colors.primary directement.
  La solution est d'extraire les constantes RGB pour documenter l'intention.
- Fichiers indépendants → peuvent être modifiés en parallèle

## Critères de validation

- `npx tsc --noEmit` → 0 erreur
- `npm test` → 0 fail
- `grep "useModalState" mobile/src/components/AlertDialog.tsx` → aucun résultat
- `grep "rgba(0, 122, 255\|rgba(255, 255, 255" mobile/src/screens/ChartsScreen.tsx` → aucun résultat

## Statut
⏳ En attente
