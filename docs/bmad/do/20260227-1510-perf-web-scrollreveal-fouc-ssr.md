# PERF(web) — ScrollReveal no-JS + FOUC thème + SocialProof SSR
Date : 2026-02-27 15:10

## Instruction
`/do docs/bmad/prompts/20260227-1500-site-audit-2-B.md`

## Rapport source
`docs/bmad/prompts/20260227-1500-site-audit-2-B.md`

## Classification
Type : perf / fix
Fichiers modifiés :
- `web/src/app/globals.css`
- `web/src/app/layout.tsx`
- `web/src/app/page.tsx`
- `web/src/components/sections/HeroSection.tsx`
- `web/src/components/SocialProof.tsx`

## Ce qui a été fait

### Fix 1 — ScrollReveal no-JS (`globals.css` + `layout.tsx`)
- `.reveal { opacity: 0 }` → `.js-loaded .reveal { opacity: 0 }` : sans JS, les éléments `.reveal` sont visibles par défaut (plus de contenu caché)
- `layout.tsx` script inline : `document.documentElement.classList.add('js-loaded')` déclenche les animations uniquement quand JS est actif
- `@media (prefers-reduced-motion: reduce)` : ajout `.js-loaded .reveal { opacity: 1; transform: none }` pour couvrir le cas JS actif + motion réduit

### Fix 2 — FOUC thème (`globals.css` + `layout.tsx`)
- Nouvelle règle CSS : `html.no-transition body { transition: none !important }` supprime la transition body au 1er paint
- Script inline : ajoute `no-transition` sur `<html>` puis le retire après 2 rAF (double requestAnimationFrame) → premier rendu sans animation parasite

### Fix 3 — SocialProof SSR (`SocialProof.tsx`, `HeroSection.tsx`, `page.tsx`)
- `SocialProof.tsx` : supprimé `"use client"`, `useState`, `useEffect`, fetch — devient composant de présentation pur avec prop `count: number | null`
- `page.tsx` : rendu `async`, fetch Supabase direct côté serveur dans `getSubscriberCount()`, `export const revalidate = 3600` (ISR — page mise en cache 1h)
- `HeroSection.tsx` : interface `HeroSectionProps { subscriberCount: number | null }`, passe `count={subscriberCount}` à `<SocialProof />`
- Résultat : plus aucune requête XHR client pour le count, données servent depuis le cache ISR Vercel

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit`)
- Tests : non applicable
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-1510

## Commit
`5891af4` perf(web): ScrollReveal no-JS guard, FOUC fix, SocialProof SSR with ISR
