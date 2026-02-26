<!-- v1.0 — 2026-02-26 -->
# Prompt — Tests web automatisés — 20260226-1745

## Demande originale
"j'aimerais faire des tests automatisées"

## Analyse
- Site : Next.js 15 + React 19 + TypeScript, pas de tests existants
- Framework choisi : **Vitest** (meilleure compatibilité ESM + React 19)
- 4 groupes : setup + 3 suites de tests

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260226-1745-tests-web-A.md | package.json, vitest.config.ts, src/test/setup.ts | 1 | ⏳ |
| B | 20260226-1745-tests-web-B.md | src/components/__tests__/ThemeToggle.test.tsx | 2 | ⏳ |
| C | 20260226-1745-tests-web-C.md | src/app/api/subscribe/__tests__/route.test.ts | 2 | ⏳ |
| D | 20260226-1745-tests-web-D.md | src/app/__tests__/page.test.tsx | 3 | ⏳ |

## Ordre d'exécution
- **Vague 1** : A — installe Vitest et configure l'environnement
- **Vague 2** : B + C en parallèle — dépendent de A (Vitest installé)
- **Vague 3** : D — dépend de A ; idéalement après B pour valider le setup

## Coverage attendu (~16 tests)
- Smoke : 1 test
- ThemeToggle : 5 tests
- API subscribe : 5 tests
- Page principale : 6 tests
