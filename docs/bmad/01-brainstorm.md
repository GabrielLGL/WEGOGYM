# Brainstorm — Templates intelligents + Notes exercice — 2026-02-24

## Idee reformulee
En tant que pratiquant, quand j'ouvre ma seance, je veux que mes poids/reps de la derniere fois soient deja la ET qu'une suggestion de progression intelligente me guide — et que mes notes personnelles par exercice (grip, douleur, focus) me suivent d'une seance a l'autre sans effort.

## Persona cible
Intermediaire (6-24 mois) — pratiquant regulier qui veut progresser sans paperasse. Debutant et avance en profitent aussi.

## Idees explorees

### Templates intelligents (#23)
1. Pre-remplir poids + reps de la derniere seance identique
2. Suggestion +2.5kg si les reps cibles ont ete atteintes la derniere fois
3. Suggestion +1 rep si le poids max est atteint ou progression lineaire stagne
4. Indicateur visuel discret (petite fleche verte +2.5kg) a cote du champ poids
5. Possibilite d'accepter la suggestion en 1 tap
6. Historique multi-seances : si 3 seances consecutives au meme poids -> suggerer changement
7. Fallback gracieux : si pas d'historique, champs vides comme aujourd'hui
8. Suggestion basee sur la derniere History de la MEME session
9. Double progression adaptative : range -> +reps puis +poids / fixe -> +poids uniquement
10. Badge "Progression acceptee" quand l'utilisateur suit la suggestion et reussit

### Notes par exercice (#22)
11. Champ notes sur le modele Exercise (global, pas par seance)
12. Affichage automatique dans SessionExerciseItem quand une note existe
13. Editable pendant la seance (tap pour ouvrir, sauvegarder au blur)
14. Exemples d'usage : "Grip pronation", "Douleur epaule droite -> leger", "Focus excentrique"
15. Icone indicatrice quand une note existe (sans prendre de place)
16. Notes consultables aussi dans la bibliotheque d'exercices
17. Pas de limite de caracteres (text field)
18. Placeholder contextuel : "Ajouter une note (grip, tempo, sensation...)"

### Idees rejetees
19. Suggestion de progression par IA — over-engineering, l'algo simple suffit
20. Notes par seance ET par exercice — trop complexe, notes globales suffisent
21. Historique des notes (versionning) — pas MVP
22. Auto-detection du type de progression — pas MVP

## Top 5 Insights
1. **Double progression adaptative** — Range (6-8) : +reps puis +poids. Fixe (5) : +poids uniquement. Vide : pas de suggestion. Parse reps_target (string) pour determiner le mode. | Risque : edge cases non couverts (periodisation ondulee, etc.)
2. **Notes sur Exercise (global)** — Une seule note persistante par exercice, pas par seance. Schema plus simple, meilleure UX. | Risque : utilisateur pourrait vouloir notes differentes selon programme (rare)
3. **Suggestion discrete, pas imposee** — Petite indication visuelle (+2.5kg), utilisateur choisit. Pas de popup. | Risque : trop discret = pas remarque
4. **Reutilisation de l'existant** — getLastSetsForExercises() existe deja. Etendre pour reps + ajouter logique suggestion. | Risque : scope "meme session" vs "meme exercice tous programmes" a bien definir
5. **Migration schema v18** — Ajouter colonne `notes` (text, optional) sur `exercises`. Simple addColumns. | Risque : migration non-triviale mais non-destructive

## Decisions prises
- Double progression adaptative selon le type de reps_target
- Range ("6-8") : d'abord +reps jusqu'au haut, puis +poids et reset au bas
- Fixe ("5") : uniquement +poids, jamais de suggestion de reps
- Vide/null : pre-remplissage seul, pas de suggestion
- Notes sur Exercise (global), pas sur SessionExercise
- Suggestion discrète, jamais imposee (indicateur visuel, pas de modal)
- App non publique : schema v17 -> v18 direct, reset DB OK

## Questions ouvertes
- Scope exact de "derniere seance" : meme session_id ou meme exercice globalement ?
- Increment de poids configurable ? (2.5kg par defaut, mais certains veulent 1.25kg)

## Contraintes techniques identifiees
- Schema migration v17 -> v18 (ajout colonne notes sur exercises)
- reps_target est un string : parsing "6-8" vs "5" vs null
- getLastSetsForExercises() existe deja dans databaseHelpers.ts
- Mutations dans database.write(), withObservables pour reactivite

## Pret pour Phase 2 ?
OUI
