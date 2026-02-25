# Sprint — Exercise Info (Animations/Demos placeholders)

## Feature
Fiches d'exercice avec description textuelle et placeholder animation, accessibles d'un tap pendant la seance et dans la bibliotheque.

## Ordre d'implementation

| # | Story | Priorite | Estimation | Dependances |
|---|-------|----------|------------|-------------|
| 1 | STORY-01 : Schema v21 (animation_key + description) | MUST | XS | - |
| 2 | STORY-02 : Descriptions exercices + seed | MUST | S | STORY-01 |
| 3 | STORY-03 : ExerciseInfoSheet (composant) | MUST | M | STORY-01 |
| 4 | STORY-04 : Bouton info en seance | MUST | S | STORY-03 |
| 5 | STORY-05 : Bouton info en bibliotheque | SHOULD | S | STORY-03 |

## Estimation totale
~3-5h de dev

## Risques
- Les noms d'exercices en base doivent matcher exactement le mapping (casse, accents)
- Le seed doit etre idempotent pour ne pas ecraser les modifications utilisateur

## Definition of Done
- npx tsc --noEmit → 0 erreur
- npm test → 0 fail
- Tap sur (i) en seance → ouvre fiche exercice
- Tap sur (i) en bibliotheque → ouvre fiche exercice
- Fiche affiche placeholder + description + muscles + notes
- Fonctionne offline
