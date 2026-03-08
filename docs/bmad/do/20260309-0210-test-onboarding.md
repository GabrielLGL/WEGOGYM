# test(onboarding) — fix tests pour step 0 disclaimer
Date : 2026-03-09 02:10

## Instruction
fix tests OnboardingScreen — ajouter mock useRoute + adapter les tests au nouveau step 0 (disclaimer)

## Rapport source
docs/bmad/reviews/20260309-0200-review.md — problèmes #1 et #2

## Classification
Type : test
Fichiers modifiés : mobile/src/screens/__tests__/OnboardingScreen.test.tsx

## Ce qui a été fait
- Ajout mock `useRoute` retournant `{ params: undefined }` dans le mock `@react-navigation/native`
- Ajout mock `navigate` pour le lien CGU
- Helper `acceptDisclaimer()` pour passer le step 0 dans tous les tests
- Nouveau describe "step 0 (disclaimer)" avec 2 tests (affichage titre + lien CGU)
- Adaptation des describes existants : step 1→2 (niveau), step 2→3 (objectif)
- Chaque test passe par `acceptDisclaimer()` + `waitFor` avant de continuer
- Test confirmation : passe par le flow complet disclaimer → langue → niveau → objectif
- Test "ne confirme pas" : `mockDb.write.mockClear()` après disclaimer pour isoler l'assertion

## Vérification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 1737 passed (112 suites)
- Nouveau test créé : oui (2 tests pour step 0 disclaimer)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260309-0210

## Commit
0e39a38 test(onboarding): fix tests for disclaimer step 0 + mock useRoute
