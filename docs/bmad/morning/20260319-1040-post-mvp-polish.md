# Rapport — Polish post-MVP — 2026-03-19

## Problème
Le verrif-ship a identifié des améliorations non-bloquantes à traiter après le ship.
Le RAPPORT verrif 20260319-1009 liste 13 problèmes restants répartis en 5 groupes.

## Fichiers concernés
- Groupe A : 21 fichiers screens (71 couleurs hardcodées)
- Groupe B : HomeScreen.tsx (monolithique 2082 lignes)
- Groupe C : 5 helpers (getMondayOfWeek DRY) + StatsScreen useCallback
- Groupe D : muscleRecoveryHelpers + streakMilestonesHelpers
- Groupe E : overtrainingHelpers (dead code) + 12 fichiers tests (as any)

## Commandes à lancer
```
/do verrif 20260319-1009 RAPPORT.md — Groupe A
/do verrif 20260319-1009 RAPPORT.md — Groupe B
/do verrif 20260319-1009 RAPPORT.md — Groupe C
/do verrif 20260319-1009 RAPPORT.md — Groupe D
/do verrif 20260319-1009 RAPPORT.md — Groupe E
```

## Contexte
Ces 5 groupes sont parallélisables (fichiers différents). Estimé ~4h total, ~1h par groupe.
Aucun n'est bloquant pour le ship — c'est du polish/dette technique.

## Critères de validation
- 0 couleur hardcodée dans les écrans
- HomeScreen < 500 lignes par composant
- 1 seul getMondayOfWeek partagé
- 0 code mort
- Score HEALTH.md retour à 100/100

## Statut
✅ Obsolete — resolu par audit critique 20260320 (-21 ecrans, -13K LOC) + verrif runs 20260321. HomeScreen 291 lignes (vs 2082), as any 1 occurrence (vs 12), couleurs hardcodees = 0.
