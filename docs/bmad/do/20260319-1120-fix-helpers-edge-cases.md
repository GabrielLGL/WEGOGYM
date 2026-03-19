# fix(helpers) — edge-cases muscleRecovery et streakMilestones
Date : 2026-03-19 11:20

## Instruction
Corrige 2 bugs edge-case dans les helpers. Rapport verrif 20260319-1009 problemes #8 et #9.
(1) muscleRecoveryHelpers.ts:94-106 — volume accumulation depend de l'ordre des sets.
(2) streakMilestonesHelpers.ts:82-93 — semantique du streak ambigue.

## Rapport source
docs/bmad/verrif/20260319-1009/RAPPORT.md (problemes #8 et #9)

## Classification
Type : fix
Fichiers modifies :
- mobile/src/model/utils/muscleRecoveryHelpers.ts
- mobile/src/model/utils/streakMilestonesHelpers.ts
- mobile/src/model/utils/__tests__/muscleRecoveryHelpers.test.ts
- mobile/src/model/utils/__tests__/streakMilestonesHelpers.test.ts

## Ce qui a ete fait

### #8 — muscleRecoveryHelpers (volume deterministe)
- Ajout d'un tri chronologique (`sort by createdAt`) des sets avant la boucle d'accumulation
- Sans ce tri, le `muscleLastTs` et `muscleDayVolume` pouvaient varier selon l'ordre du tableau d'entree
- Ajout test : verifie que l'ordre des sets (chrono, inverse, shuffle) donne un resultat identique

### #9 — streakMilestonesHelpers (semantique streak)
- JSDoc enrichi : explique clairement que le streak = nb de jours d'entrainement uniques (pas de jours calendrier), avec tolerance 1 jour de repos
- Exemple ajoute dans le JSDoc : lundi + mercredi + jeudi = streak 3 (pas 4)
- Commentaire inline ligne 87 clarifie : "Gap <= 2 jours = tolerance 1 jour de repos"
- La logique etait correcte, seule la documentation etait ambigue
- Ajout test : verifie explicitement que le streak compte les jours d'entrainement

### Bonus — test getRecoveryColor
- Mise a jour du mock colors pour inclure `success` et `amber` (suite au fix couleurs hardcodees par un autre Claude Code)

## Verification
- TypeScript : OK 0 erreurs
- Tests : OK 16 passed (2 suites ciblees)
- Suite complete : 2212 passed, 10 failed (pre-existants dans sessionIntensityHelpers — modifie par un autre Claude Code en parallele)
- Nouveau test cree : oui (2 tests)

## Documentation mise a jour
- JSDoc de `computeStreakMilestones` enrichi

## Statut
OK Resolu — 20260319-1120

## Commit
31bce13 fix(helpers): deterministic volume accumulation + streak JSDoc clarity
