# REFACTOR(rate-limit) — Serverless-safe via globalThis
Date : 2026-02-27 03:40

## Instruction
docs/bmad/prompts/20260227-0340-site-completion-B.md

## Rapport source
docs/bmad/prompts/20260227-0340-site-completion-B.md (description directe)

## Classification
Type : refactor
Fichiers modifiés :
- `web/src/lib/rateLimit.ts`

## Ce qui a été fait
Réécrit `rateLimit.ts` pour être serverless-safe :
- Ajout de `declare global` pour typer `globalThis._rateLimitStore` (`Map<string, RateLimitEntry>`) et `globalThis._rateLimitCleanup` (`ReturnType<typeof setInterval>`)
- Initialisation du store via `globalThis._rateLimitStore ?? new Map()` — réutilise le store existant entre invocations chaudes (même process Node.js)
- Cleanup interval enregistré uniquement si `!globalThis._rateLimitCleanup` — évite les duplicates lors des hot-reloads en dev
- API publique inchangée : `checkRateLimit()`, `getClientIp()`, `RateLimitResult`

## Vérification
- TypeScript : ✅ zéro erreur (`cd web && npx tsc --noEmit`)
- Tests : ✅ N/A (pas de tests unitaires pour ce fichier, logique purement utilitaire)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-0340

## Commit
dfe5907 refactor(rate-limit): make in-memory store serverless-safe via globalThis
