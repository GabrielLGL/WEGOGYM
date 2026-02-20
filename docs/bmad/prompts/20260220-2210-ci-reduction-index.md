<!-- v1.0 — 2026-02-20 -->
# Prompt — ci-reduction — 20260220-2210

## Demande originale
```
214 workflow runs
docs(git-history): rapport push 20260220-2205
Lint Code #107: Commit 5a93495 pushed by GabrielLGL
```

## Analyse
214 runs GitHub Actions sur la branche main, dont la majorité pour des commits docs-only.
Deux problèmes distincts :
1. Pas de `paths-ignore` dans les workflows → CI tourne pour CHAQUE push y compris docs
2. `sentry.test.ts` : 6 erreurs TypeScript → `lint.yml` `TypeScript Check` échoue sur tout push

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260220-2210-ci-reduction-A.md` | `.github/workflows/ci.yml`, `.github/workflows/lint.yml` | 1 | ⏳ |
| B | `docs/bmad/prompts/20260220-2210-ci-reduction-B.md` | `mobile/src/services/__tests__/sentry.test.ts` | 1 | ⏳ |

## Ordre d'exécution
**Vague 1 uniquement** — A et B sont indépendants (fichiers disjoints), lancer en parallèle.

Après les deux groupes → CI devrait :
- Ne plus se déclencher sur les commits `docs/**`
- Passer au vert (TypeScript Check sans erreur)
