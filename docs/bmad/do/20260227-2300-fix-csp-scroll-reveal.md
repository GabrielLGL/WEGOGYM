# fix(web) — CSP 'unsafe-eval' bloquait React HMR et ScrollReveal
Date : 2026-02-27 23:00

## Instruction
Déboguer pourquoi les sections Features, Pricing, Subscribe sont invisibles localement
(`.reveal` éléments jamais activés par IntersectionObserver)

## Rapport source
Description directe — suite de la session précédente

## Classification
Type : fix
Fichiers modifiés : `web/next.config.ts`

## Ce qui a été fait

### Root cause
La CSP dans `next.config.ts` ne contenait pas `'unsafe-eval'` dans `script-src`.
Next.js en mode dev utilise webpack HMR + React Fast Refresh, qui nécessitent `eval()`.

**Cascade d'effets :**
1. `main-app.js` lance une `EvalError` non catchée au démarrage
2. Le bundle React s'arrête avant de terminer son initialisation
3. React ne complète pas l'hydratation → `useEffect` ne s'exécute jamais
4. Le composant `ScrollReveal` ne crée jamais son `IntersectionObserver`
5. Les 17 éléments `.reveal` restent à `opacity: 0` (jamais `.active`)
6. Toutes les sections sous le hero (Features, Pricing, Subscribe) sont invisibles

### Fix
Ajout conditionnel de `'unsafe-eval'` uniquement en mode développement :
```ts
const isDev = process.env.NODE_ENV === "development";
// ...
`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
```

La CSP de production reste stricte (sans `unsafe-eval`).

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 26 passed
- ScrollReveal : ✅ 13/17 éléments activés au scroll (les 4 restants entrent en vue après y=1200)
- Console : ✅ 0 erreur CSP après fix

## Documentation mise à jour
Aucune — fix ponctuel dans la config

## Statut
✅ Résolu — 20260227-2300

## Commit
[sera rempli après commit]
