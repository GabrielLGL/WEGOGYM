# fix(web) — Privacy page — 5 corrections accessibilité
Date : 2026-02-27 20:20

## Instruction
`/do docs/bmad/prompts/20260227-2000-audit6-privacy-B.md`

## Rapport source
`docs/bmad/prompts/20260227-2000-audit6-privacy-B.md`

## Classification
Type : fix
Fichiers modifiés : `web/src/app/privacy/page.tsx`

## Ce qui a été fait
1. **Skip link** ajouté en premier enfant de `<div>` racine (avant `<BackgroundBlobs />`) — visible au focus clavier, `sr-only` sinon.
2. **`id="main-content"`** ajouté sur `<main>` — cible du skip link.
3. **`<caption className="sr-only">`** ajouté sur `<table>` après l'ouverture, avant `<thead>` — annonce "Données personnelles collectées" aux lecteurs d'écran.
4. **`aria-hidden="true"`** ajouté sur le `<span>` flèche du lien retour **bas de page** (ligne ~345) — déjà présent en haut (ligne 65), manquait en bas.
5. **`aria-label`** ajouté sur les liens externes sous-traitants (`target="_blank"`) — format `"Politique de confidentialité de [label] (nouvel onglet)"`.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit` depuis `web/`)
- Tests : n/a (HTML/attributs purs)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260227-2020

## Commit
`b70923a` fix(web): privacy — skip link, main id, table caption, aria-hidden, aria-label
