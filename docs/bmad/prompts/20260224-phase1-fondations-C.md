<!-- v1.0 — 2026-02-24 -->
# Rapport — Phase 1 Fondations — Groupe C — Templates intelligents & Notes exercice

## Objectif
Ameliorer le coeur de l'experience d'entrainement avec 2 features critiques:
1. Templates intelligents (#23): Pre-remplir la prochaine seance avec les poids de la derniere fois + suggestion de progression calculee (+2.5kg ou +1 rep selon l'historique). L'utilisateur n'a qu'a valider ou ajuster.
2. Notes par exercice (#22): Champ de notes persistant par exercice qui reapparait automatiquement a chaque seance suivante.

Ces 2 features sont GRATUITES — c'est le core qui rend l'app indispensable au quotidien.

## Source
Brainstorming session: `docs/brainstorming/brainstorming-session-2026-02-23.md`
Features: #23 (Templates intelligents), #22 (Notes par exercice)

## Fichiers concernes
- `mobile/src/model/schema.ts` — Ajouter colonne notes a SessionExercise ou Exercise
- `mobile/src/model/models/` — Ajouter champ notes
- `mobile/src/model/utils/databaseHelpers.ts` — Helper pour recuperer derniere seance + calculer suggestion progression
- `mobile/src/screens/SessionDetailScreen.tsx` — Afficher suggestions et notes
- `mobile/src/components/SessionExerciseItem.tsx` — Ajouter UI de notes + indicateur de suggestion

## Contexte technique
- Stack: React Native Expo 52, TypeScript, WatermelonDB
- Modeles existants: Program (1:N) Session (1:N) SessionExercise, History -> Set
- Les donnees historiques sont dans History/Set (soft-delete avec deleted_at)
- Pattern: withObservables pour rendre les donnees reactives
- Validation: utiliser validationHelpers.ts
- Inputs numeriques: keyboardType="numeric"
- Theme: Dark mode only, utiliser theme/index.ts

## Etapes

### Templates intelligents (#23)
1. Creer helper `getLastSessionData(sessionId)` qui retrouve la derniere instance de la meme session avec ses sets
2. Creer helper `suggestProgression(exerciseHistory)` qui calcule la suggestion basee sur la courbe
3. Au chargement d'une seance, pre-remplir les champs poids/reps avec les valeurs precedentes
4. Afficher une petite indication visuelle pour la suggestion (+2.5kg, +1 rep)
5. L'utilisateur peut accepter/modifier/ignorer

### Notes par exercice (#22)
1. Schema migration: ajouter colonne `notes` (text) sur le modele Exercise (pas SessionExercise — les notes sont persistantes PAR exercice)
2. Ajouter champ @text('notes') dans le modele Exercise
3. Ajouter un champ de saisie de notes dans le composant SessionExerciseItem
4. Les notes s'affichent automatiquement quand l'exercice apparait dans une seance
5. Editable a tout moment pendant la seance

## Contraintes
- Ne pas casser: le flow de seance existant, l'historique, le systeme de sets
- Respecter: WatermelonDB write() pour mutations, schema/model sync
- Les suggestions ne doivent pas etre intrusives — indicateur discret
- Les notes sont sur Exercise (global), pas sur SessionExercise (par seance)

## Criteres de validation
- npx tsc --noEmit → zero erreur
- npm test → zero fail
- Ouvrir une seance deja faite → poids/reps pre-remplis de la derniere fois
- Suggestion de progression visible
- Notes saisies persistent et reapparaissent a la prochaine seance
- Notes editables pendant la seance

## Dependances
Aucune dependance — peut etre fait en parallele.

## Statut
✅ Resolu -- 20260225

## Resolution
Rapports do : docs/bmad/do/20260225-feat-smart-templates-notes.md
QA : docs/bmad/07-qa-report-smart-templates.md
Changelog : docs/bmad/CHANGELOG-20260225-smart-templates.md
Stories : docs/stories/smart-templates-notes/
