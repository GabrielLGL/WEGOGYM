# TEST(web) — Setup infrastructure Vitest
Date : 2026-02-26 11:56

## Instruction
docs/bmad/prompts/20260226-1745-tests-web-A.md

## Rapport source
docs/bmad/prompts/20260226-1745-tests-web-A.md

## Classification
Type : test
Fichiers modifiés :
- web/package.json (scripts test + test:watch, devDependencies installées)
- web/vitest.config.ts (nouveau)
- web/src/test/setup.ts (nouveau)
- web/src/test/vitest.d.ts (nouveau)
- web/src/test/smoke.test.ts (nouveau)

## Ce qui a été fait
- Installé en devDependencies : vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom
- Créé vitest.config.ts avec plugin React, environnement jsdom, setupFiles, globals:true, et alias @/ → ./src
- Créé src/test/setup.ts qui importe @testing-library/jest-dom
- Créé src/test/vitest.d.ts avec `/// <reference types="vitest/globals" />` pour les types globaux
- Ajouté scripts "test": "vitest run" et "test:watch": "vitest" dans package.json
- Créé smoke.test.ts validant que vitest s'exécute correctement

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1 passed (smoke test)
- Nouveau test créé : oui (smoke.test.ts)

## Documentation mise à jour
Aucune (setup infra uniquement)

## Statut
✅ Résolu — 20260226-1156

## Commit
764fff2 test(web): setup Vitest infrastructure with jsdom + @testing-library
