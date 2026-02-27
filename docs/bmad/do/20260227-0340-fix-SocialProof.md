# fix(SocialProof) — loading skeleton, fallback uniquement en cas d'erreur
Date : 2026-02-27 03:40

## Instruction
docs/bmad/prompts/20260227-0340-site-completion-C.md

## Rapport source
Description directe (prompt Groupe C)

## Classification
Type : fix
Fichiers modifiés :
- `web/src/components/SocialProof.tsx`

## Ce qui a été fait
- Ajout de `const [loading, setLoading] = useState(true)` pour distinguer "en cours" de "erreur"
- `.then()` appelle `setLoading(false)` après `setCount(data.count)`
- `.catch()` appelle `setLoading(false)` après `setCount(FALLBACK)` → le fallback 342 n'apparaît QUE en cas d'erreur
- Suppression de `const displayed = count ?? FALLBACK` (affichait 342 dès le rendu initial)
- Rendu conditionnel :
  - `loading === true` → skeleton `<span>` avec classes `animate-pulse`, `aria-hidden="true"`, largeur fixe `w-8` (évite le layout shift)
  - `loading === false` → `<span>` avec le vrai count (ou fallback si erreur)

## Vérification
- TypeScript : ✅ `npx tsc --noEmit` → zéro erreur
- Tests : ✅ `page.test.tsx` mock déjà `HeroSection` → non impacté
- Nouveau test créé : non (composant UI pur, fetch déjà mocké dans page tests)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-0340

## Commit
[sera rempli après le commit]
