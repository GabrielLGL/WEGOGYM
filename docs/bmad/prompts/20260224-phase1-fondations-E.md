<!-- v1.0 — 2026-02-24 -->
# Rapport — Phase 1 Fondations — Groupe E — Videos/animations exercices

## Objectif
Ajouter des animations ou GIF courts (3-5 secondes en boucle) montrant l'execution correcte de chaque exercice. Accessible d'un tap pendant la seance. Offline-first (stocke localement ou bundled). C'est un standard de qualite qui rend l'app utilisable par les debutants.

## Source
Brainstorming session: `docs/brainstorming/brainstorming-session-2026-02-23.md`
Feature: #99 (Videos/animations execution)

## Fichiers concernes
- `mobile/src/model/schema.ts` — Ajouter colonne animation_url ou animation_key au modele Exercise
- `mobile/src/model/models/Exercise.ts` — Ajouter champ
- `mobile/src/components/ExerciseAnimation.tsx` — Nouveau composant d'affichage animation
- `mobile/src/components/SessionExerciseItem.tsx` — Bouton pour voir l'animation
- `mobile/assets/animations/` — Dossier pour les animations bundled (ou CDN)

## Contexte technique
- Stack: React Native Expo 52, TypeScript, WatermelonDB
- Offline-first: les animations doivent etre disponibles sans internet
- Options: Lottie (animations vectorielles legeres), GIF bundled, ou SVG animes
- La base d'exercices est dans le modele Exercise
- Theme: Dark mode only
- Performance: les animations doivent etre legeres (pas de video lourde)

## Etapes
1. Decider du format d'animation (Lottie recommande pour poids leger + qualite)
2. Schema migration: ajouter champ animation_key sur Exercise
3. Creer un mapping animation_key → fichier d'animation
4. Commencer avec les exercices les plus courants (squat, bench, deadlift, OHP, row, curl, extension, etc. — 20-30 exercices de base)
5. Creer composant ExerciseAnimation qui affiche l'animation en boucle
6. Ajouter bouton/icone dans SessionExerciseItem pour ouvrir l'animation
7. Afficher dans un BottomSheet (pas de Modal natif — Fabric crash)

## Contraintes
- Ne pas casser: le modele Exercise existant, le flow de seance
- Respecter: offline-first (pas de fetch reseau pour les animations de base), theme, BottomSheet pattern
- Les animations doivent etre legeres (< 100KB chacune idealement)
- Le bundle de l'app ne doit pas exploser — evaluer taille totale
- Commencer avec un set reduit et etendre progressivement

## Criteres de validation
- npx tsc --noEmit → zero erreur
- npm test → zero fail
- Tap sur l'icone animation → affiche l'animation dans un BottomSheet
- Animation joue en boucle, ferme proprement
- Fonctionne offline
- Bundle size impact mesure et acceptable

## Dependances
Aucune dependance technique. MAIS necessite un travail de creation/sourcing d'animations qui est HORS dev. Ce groupe peut etre demarre en parallele avec un placeholder (icone sans animation reelle) en attendant les assets.

## Statut
✅ Resolu — 20260225

## Resolution
Rapports do : docs/bmad/do/20260225-feat-exercise-info.md
