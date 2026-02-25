# Sprint — Onboarding Personnalisé

## Stories

| # | Story | Priorité | Estimation | Dépendances |
|---|-------|----------|------------|-------------|
| S01 | Schema v18 + Models | MUST | XS | — |
| S02 | Constantes + types | MUST | XS | S01 |
| S03 | Composant OnboardingCard | MUST | S | — |
| S04 | OnboardingScreen (2 steps) | MUST | M | S01, S02, S03 |
| S05 | Routing conditionnel | MUST | S | S04 |
| S06 | Reconfiguration Settings | SHOULD | S | S02, S03 |

## Ordre d'implémentation
S01 → S02 → S03 → S04 → S05 → S06

## Décisions clés
- Onboarding 2 étapes non-skippable (niveau + objectif)
- Texte explicatif sous chaque question
- Équipement + fréquence → modèle Program (future story)
- Schema v18 direct (app non publique)
- OnboardingCard réutilisable (onboarding + settings)
