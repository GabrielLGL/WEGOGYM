# Product Brief — Animations/Demos exercices — 2026-02-25

## Probleme

Les debutants en musculation ne savent pas toujours comment executer correctement un exercice. Ils doivent quitter l'app pour chercher sur YouTube/Google, ce qui casse le flow de la seance. Les apps concurrentes (Hevy, Strong) offrent des demos visuelles integrees — c'est un standard attendu.

## Solution

Un systeme de fiches d'exercice accessibles d'un tap pendant la seance, affichees dans un BottomSheet. Chaque fiche contient :
- Une zone placeholder pour future animation/illustration
- Les muscles cibles (deja en base)
- Les notes personnelles de l'utilisateur (deja en base)
- Des instructions texte courtes (cues d'execution)

Structure prete pour recevoir des vrais assets visuels (Lottie/GIF/SVG) dans une phase ulterieure.

## Utilisateurs cibles

| Persona | Benefice |
|---------|----------|
| Debutant | Apprendre les mouvements sans quitter l'app |
| Intermediaire | Verifier un mouvement meconnu, lire ses notes |
| Avance | Consulter ses notes personnelles rapidement |

## Metriques de succes

| Metrique | Cible |
|----------|-------|
| Fiche exercice accessible d'un tap en seance | 100% des exercices |
| Description textuelle presente pour 20-30 exos de base | 100% coverage |
| Placeholder visuel pret pour futur remplacement par animation | Structure en place |
| Aucune regression sur les tests existants | 0 fail |
| TypeScript clean | 0 erreur |
| Fonctionne offline | 100% |

## Scope MVP

1. Ajout `animation_key` + `description` sur le modele Exercise (schema migration v21)
2. Mapping des 20-30 exercices de base avec cles d'animation et descriptions texte (cues d'execution)
3. Composant `ExerciseInfoSheet` (BottomSheet) : placeholder visuel + muscles + description + notes
4. Bouton d'acces dans `SessionExerciseItem` (icone info)
5. Acces aussi depuis la bibliotheque d'exercices

## Contraintes techniques

- Schema migration v20 → v21 (ajout colonnes animation_key + description sur exercises)
- BottomSheet via Portal (pas de Modal natif — Fabric crash)
- Offline-first : tout en local, pas de fetch reseau
- Mutations dans database.write()
- Reactivite via withObservables
- Theme dark mode, couleurs depuis theme/index.ts

## Hors scope (futur)

- Vrais assets visuels (Lottie/GIF/SVG)
- Telechargement d'animations supplementaires
- Mode "apprendre" interstitiel avant exercice
- Contribution communautaire de tips
- Tap sur placeholder pour importer une image custom

## Risques

| Risque | Mitigation |
|--------|------------|
| Placeholder visuel parait "vide" | Icone stylisee + message "Animation a venir" |
| Description texte insuffisante pour debutant | Cues clairs et actionables, pas de jargon |
| Migration schema echoue | addColumns non-destructif, testable |
| Exercices custom sans description | Afficher "Pas de description" avec invite a ajouter des notes |

## Pret pour Phase 3 ?
OUI
