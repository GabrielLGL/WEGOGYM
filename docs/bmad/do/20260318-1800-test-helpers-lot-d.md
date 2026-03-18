# test(utils) — Tests unitaires helpers lot D (gamification/social)
Date : 2026-03-18 18:00

## Instruction
docs/bmad/prompts/20260318-1800-stab1-D.md

## Rapport source
docs/bmad/prompts/20260318-1800-stab1-D.md

## Classification
Type : test
Fichiers modifiés :
- mobile/src/model/utils/__tests__/leaderboardHelpers.test.ts (créé)
- mobile/src/model/utils/__tests__/selfLeaguesHelpers.test.ts (créé)
- mobile/src/model/utils/__tests__/skillTreeHelpers.test.ts (créé)
- mobile/src/model/utils/__tests__/prPredictionHelpers.test.ts (créé)
- mobile/src/model/utils/__tests__/flashbackHelpers.test.ts (créé)
- mobile/src/model/utils/__tests__/athleteClassHelpers.test.ts (créé)
- mobile/src/model/utils/__tests__/titlesHelpers.test.ts (créé)

## Ce qui a été fait
Créé 7 fichiers de tests unitaires pour les helpers gamification/social :
- **leaderboardHelpers** (11 tests) : generateFriendCode, encodeFriendPayload/decodeFriendPayload, buildLeaderboard (tri, isMe, égalités, tri par streak)
- **selfLeaguesHelpers** (9 tests) : computeSelfLeaguePeriods (vide, abandoned, hebdo, mensuel, PRs), buildSelfLeaguesRanking (vide, volume, sessions, pctFromAvg, durée)
- **skillTreeHelpers** (7 tests) : 4 branches, tout verrouillé, débloquage par seuils (force/endurance/mobilité/régularité), progress [0,1], nextThreshold=-1
- **prPredictionHelpers** (8 tests) : null si vide/1PR/sans PR, prédiction 2 PRs, prédiction > best, fallback pente nulle, confidence high, arrondi 2.5kg
- **flashbackHelpers** (8 tests) : null si vide/hors fenêtre, flashback 1 et 3 mois, volume multi-sets, exclusion abandoned/deleted, multi-séances
- **athleteClassHelpers** (6 tests) : null si <20 sets, null si vol=0, bodybuilder, powerlifter, pourcentages, pushPullRatio
- **titlesHelpers** (7 tests) : 15 titres, tout verrouillé, débloquage conditionnel, icons, non-débloquage

Pattern suivi : factories makeUser/makeHistory/makeSet, noms de tests en français, assertions strictes.

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 66 passed (7 suites)
- Nouveau test créé : oui (7 fichiers)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260318-1800

## Commit
(voir ci-dessous)
