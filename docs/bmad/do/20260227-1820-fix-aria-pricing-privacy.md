# fix(web) — Accessibilité PricingSection & PrivacyPage
Date : 2026-02-27 18:20

## Instruction
`/do docs/bmad/prompts/20260227-1800-audit4-aria-B.md`

## Rapport source
`docs/bmad/prompts/20260227-1800-audit4-aria-B.md`

## Classification
Type : fix
Fichiers modifiés :
- `web/src/components/sections/PricingSection.tsx`
- `web/src/app/privacy/page.tsx`

## Ce qui a été fait

### PricingSection.tsx
1. **Checkmarks aria-hidden** : ajout `aria-hidden="true"` sur le `<span>&#10003;</span>` de chaque feature — les screenreaders ne lisent plus "crochet de vérification" avant chaque feature, le texte de la feature suffit.
2. **Cartes div → article** : les cartes de pricing passent de `<div>` à `<article>` — landmark HTML5 sémantique, navigable au clavier avec les raccourcis screenreader.

### privacy/page.tsx
3. **Flèches "←" aria-hidden** : ajout `aria-hidden="true"` sur les deux `<span>` contenant "←" (back-links haut et bas de page) — les screenreaders lisaient "flèche gauche Retour à l'accueil", maintenant ils lisent uniquement "Retour à l'accueil".

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-1820

## Commit
`b51e243` fix(web): PricingSection article + aria-hidden, PrivacyPage arrows aria-hidden
