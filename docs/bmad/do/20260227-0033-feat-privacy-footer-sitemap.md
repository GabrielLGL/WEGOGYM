# feat(landing) — Intégration lien /privacy dans footer, formulaire et sitemap
Date : 2026-02-27 00:33

## Instruction
/do docs/bmad/prompts/20260227-0030-privacy-rgpd-B.md

## Rapport source
docs/bmad/prompts/20260227-0030-privacy-rgpd-B.md

## Classification
Type : feat
Fichiers modifiés :
- `web/src/app/page.tsx` (footer + mention formulaire)
- `web/src/app/sitemap.ts` (entrée /privacy)

## Ce qui a été fait
1. **Footer** : ajout d'un lien `<a href="/privacy">Confidentialite</a>` dans le footer, même style que les liens existants
2. **Formulaire** : ajout d'un lien cliquable "Politique de confidentialite" dans le texte "Pas de spam..." sous le CTA d'inscription
3. **Sitemap** : ajout de l'entrée `https://kore-app.com/privacy` (changeFrequency: "yearly", priority: 0.3)

## Vérification
- TypeScript : ✅ 0 erreur (npx tsc --noEmit)
- Tests : ✅ 19 passed, 0 failed (4 fichiers)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-0033

## Commit
[sera rempli après commit]
